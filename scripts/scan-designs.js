import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

/*
==========================================================
CONFIGURACIÓN
==========================================================
*/

const RAIZ = process.cwd();

const CARPETA_DISENOS =
  path.join(RAIZ, 'diseños');

const ARCHIVO_SALIDA =
  path.join(
    RAIZ,
    'src',
    'data',
    'catalogo.json'
  );

const ALPHA_MINIMO = 32;

const RGB_MINIMO_CLARO = 220;

const DIFERENCIA_COLOR_MINIMA = 35;

const UMBRAL_ESTAMPADO_CLARO = 0.08;


/*
==========================================================
UTILIDADES
==========================================================
*/

function normalizarTexto(valor) {

  return String(valor || '')
    .trim()
    .toLowerCase();

}


/*
==========================================================
LEER PNG
==========================================================
*/

function leerPNG(rutaArchivo) {

  return new Promise(
    (resolve, reject) => {

      fs.createReadStream(rutaArchivo)
        .pipe(new PNG())
        .on('parsed', function () {

          resolve(this);

        })
        .on('error', reject);

    }
  );

}


/*
==========================================================
ANÁLISIS DEL ESTAMPADO
==========================================================
*/

function analizarImagen(png) {

  let pixelesVisibles = 0;

  let pixelesClaros = 0;

  let pixelesColoridos = 0;

  for (
    let y = 0;
    y < png.height;
    y++
  ) {

    for (
      let x = 0;
      x < png.width;
      x++
    ) {

      const indice =
        (png.width * y + x) << 2;

      const r =
        png.data[indice];

      const g =
        png.data[indice + 1];

      const b =
        png.data[indice + 2];

      const a =
        png.data[indice + 3];

      if (a < ALPHA_MINIMO) {
        continue;
      }

      pixelesVisibles++;

      const esClaro =
        r >= RGB_MINIMO_CLARO &&
        g >= RGB_MINIMO_CLARO &&
        b >= RGB_MINIMO_CLARO;

      if (esClaro) {
        pixelesClaros++;
      }

      const maximo =
        Math.max(r, g, b);

      const minimo =
        Math.min(r, g, b);

      const diferencia =
        maximo - minimo;

      if (
        diferencia >= DIFERENCIA_COLOR_MINIMA
      ) {

        pixelesColoridos++;

      }

    }

  }


  const porcentajeClaro =
    pixelesVisibles > 0
      ? pixelesClaros / pixelesVisibles
      : 0;


  const porcentajeColorido =
    pixelesVisibles > 0
      ? pixelesColoridos / pixelesVisibles
      : 0;


  /*
  --------------------------------------------------------
  ESTAMPADO CLARO
  --------------------------------------------------------

  Esto NO decide el color de la playera.

  Solamente describe una característica
  objetiva del diseño.
  */

  const estampadoClaro =
    porcentajeClaro >=
    UMBRAL_ESTAMPADO_CLARO;


  /*
  --------------------------------------------------------
  NECESITA CONTRASTE
  --------------------------------------------------------

  Por ahora utilizamos la misma información
  del estampado claro.

  La presentación podrá usar esta propiedad
  para aplicar una sombra/contorno sutil.
  */

  const necesitaContraste =
    estampadoClaro;


  return {

    estampadoClaro,

    necesitaContraste,

    porcentajeClaro,

    porcentajeColorido

  };

}


/*
==========================================================
ANALIZAR NOMBRE DEL ARCHIVO
==========================================================
*/

function analizarNombreArchivo(nombreArchivo) {

  const extension =
    path.extname(nombreArchivo)
      .toLowerCase();

  const nombre =
    path.basename(
      nombreArchivo,
      extension
    );


  /*
  --------------------------------------------------------
  FORMATO ESPERADO

  007-T-F
  007-C-F
  007-T-B
  007-C-B

  número - posición - vista
  --------------------------------------------------------
  */

  const coincidencia = nombre.match(/^(.+)-([TC])[-_]([FB])$/i);

  if (!coincidencia) {
    const marcaVista = nombre.match(/(?:^|[\s._-])(back|espalda|posterior|trasera|rear|front|frente|delantera|[FB])$/i);
    const raiz = nombre
      .replace(/(?:^|[\s._-])(back|espalda|posterior|trasera|rear|front|frente|delantera|[FB])$/i, '')
      .replace(/[\s._-]+$/g, '') || nombre;
    const vistaCodigo = marcaVista && /^(back|espalda|posterior|trasera|rear|b)$/i.test(marcaVista[1])
      ? 'B'
      : 'F';
    const raizNormalizada = raiz.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return {
      numero: null,
      posicion: null,
      vista: vistaCodigo === 'B' ? 'back' : 'front',
      posicionCodigo: null,
      vistaCodigo,
      identidad: `nombre:${raizNormalizada}`,
      nombreOriginal: nombre
    };
  }


  const numero =
    coincidencia[1];

  const posicionCodigo =
    coincidencia[2]
      .toUpperCase();

  const vistaCodigo =
    coincidencia[3]
      .toUpperCase();


  const posicion =
    posicionCodigo === 'T'
      ? 'top'
      : 'center';


  const vista =
    vistaCodigo === 'B'
      ? 'back'
      : 'front';


  return {

    numero,

    posicion,

    vista,

    posicionCodigo,

    vistaCodigo,
    identidad: `legacy:${numero}`,
    nombreOriginal: nombre

  };

}


/*
==========================================================
OBTENER PREFIJO
==========================================================
*/

function obtenerPrefijo(nombreCategoria) {

  const limpio =
    nombreCategoria
      .replace(
        /[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]/g,
        ''
      )
      .toUpperCase();


  return limpio
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .slice(0, 3);

}


function crearLetrasSKU(nombreOriginal, semillaTexto) {
  const letras = String(nombreOriginal || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  const base = letras || 'DISENO';
  let semilla = 2166136261;
  for (const caracter of semillaTexto) {
    semilla ^= caracter.charCodeAt(0);
    semilla = Math.imul(semilla, 16777619) >>> 0;
  }
  let resultado = '';
  for (let indice = 0; indice < 4; indice++) {
    semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
    resultado += base[semilla % base.length];
  }
  return resultado;
}


function obtenerRegistroAnterior(catalogoAnterior) {
  const registros = new Map();
  let mayorFolio = 0;
  for (const categoria of catalogoAnterior?.categorias || []) {
    for (const producto of categoria.productos || []) {
      const numero = String(producto.numero || '');
      const folio = Number.parseInt(numero, 10);
      if (Number.isFinite(folio)) mayorFolio = Math.max(mayorFolio, folio);
      for (const imagen of producto.imagenes || []) {
        const datos = analizarNombreArchivo(imagen.archivo || '');
        if (!datos) continue;
        registros.set(`${categoria.carpeta}|${datos.identidad}`, producto);
        registros.set(`${categoria.carpeta}|archivo:${imagen.archivo}`, producto);
      }
    }
  }
  return { registros, mayorFolio };
}


/*
==========================================================
ESCANEAR CATEGORÍA
==========================================================
*/

async function escanearCategoria(
  nombreCategoria,
  registrosPrevios,
  folioGlobal
) {

  const carpeta =
    path.join(
      CARPETA_DISENOS,
      nombreCategoria
    );


  const prefijo =
    obtenerPrefijo(
      nombreCategoria
    );


  const archivos =
    fs.readdirSync(
      carpeta,
      { withFileTypes: true }
    )
    .filter(
      entrada =>
        entrada.isFile()
    )
    .map(
      entrada =>
        entrada.name
    )
    .filter(nombre => path.extname(nombre).toLowerCase() === '.png')
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));


  const productosMap =
    new Map();


  for (const archivo of archivos) {

    const datosArchivo = analizarNombreArchivo(archivo);
    const claveRegistro = `${nombreCategoria}|${datosArchivo.identidad}`;
    const productoPrevio = registrosPrevios.get(claveRegistro)
      || registrosPrevios.get(`${nombreCategoria}|archivo:${archivo}`);
    let producto = productosMap.get(datosArchivo.identidad);

    if (!producto) {
      const numero = productoPrevio?.numero || datosArchivo.numero || String(folioGlobal.valor++).padStart(4, '0');
      const letras = datosArchivo.numero
        ? prefijo
        : crearLetrasSKU(datosArchivo.nombreOriginal, `${nombreCategoria}/${archivo}`);
      producto = {
        ...(productoPrevio || {}),
        numero,
        sku: productoPrevio?.sku || `${letras}${numero}`,
        imagenes: []
      };
      productosMap.set(datosArchivo.identidad, producto);
    }


    const rutaCompleta =
      path.join(
        carpeta,
        archivo
      );


    const png =
      await leerPNG(
        rutaCompleta
      );


    const analisis =
      analizarImagen(
        png
      );


    /*
    ------------------------------------------------------
    PRESENTACIÓN

    IMPORTANTE:

    El scanner NO decide si la playera
    debe ser de color.

    Todos los diseños comienzan con:

    playeraColor: false

    El futuro Panel Admin podrá cambiarlo
    a true.

    ------------------------------------------------------
    */

    const imagen = {

      archivo,

      vista: datosArchivo.vista,

      posicion: png.width >= png.height ? 'top' : 'center',

      vistaCodigo: datosArchivo.vistaCodigo,

      posicionCodigo: png.width >= png.height ? 'T' : 'C',

      estampadoClaro:
        analisis.estampadoClaro,

      necesitaContraste:
        analisis.necesitaContraste,

      porcentajeClaro:
        Number(
          analisis.porcentajeClaro
            .toFixed(4)
        ),

      porcentajeColorido:
        Number(
          analisis.porcentajeColorido
            .toFixed(4)
        )

    };


    producto.imagenes.push(imagen);

  }


  const productos =
    Array.from(
      productosMap.values()
    );


  /*
  --------------------------------------------------------
  ORDENAR PRODUCTOS
  --------------------------------------------------------
  */

  productos.sort(
    (a, b) => {

      const numeroA =
        parseInt(
          a.numero,
          10
        );

      const numeroB =
        parseInt(
          b.numero,
          10
        );


      if (
        Number.isNaN(numeroA) ||
        Number.isNaN(numeroB)
      ) {

        return a.numero
          .localeCompare(
            b.numero,
            undefined,
            {
              numeric: true
            }
          );

      }


      return numeroA - numeroB;

    }
  );


  /*
  --------------------------------------------------------
  ORDENAR IMÁGENES

  Front antes de back.
  Top antes de center.
  --------------------------------------------------------
  */

  for (const producto of productos) {

    producto.imagenes.sort(
      (a, b) => {

        if (
          a.vista !== b.vista
        ) {

          return a.vista === 'front'
            ? -1
            : 1;

        }


        if (
          a.posicion !== b.posicion
        ) {

          return a.posicion === 'top'
            ? -1
            : 1;

        }


        return a.archivo
          .localeCompare(
            b.archivo
          );

      }
    );

  }


  return {

    nombre:
      nombreCategoria,

    carpeta:
      nombreCategoria,

    prefijo,

    productos

  };

}


/*
==========================================================
MAIN
==========================================================
*/

async function main() {

  console.log(
    'Escaneando diseños...'
  );


  if (
    !fs.existsSync(
      CARPETA_DISENOS
    )
  ) {

    throw new Error(
      `No existe la carpeta: ${CARPETA_DISENOS}`
    );

  }

  let catalogoAnterior = null;
  if (fs.existsSync(ARCHIVO_SALIDA)) {
    try {
      catalogoAnterior = JSON.parse(fs.readFileSync(ARCHIVO_SALIDA, 'utf8'));
    } catch {
      console.warn('⚠ No pude leer el catálogo anterior; crearé uno nuevo.');
    }
  }
  const { registros, mayorFolio } = obtenerRegistroAnterior(catalogoAnterior);
  const folioGlobal = {
    valor: Math.max(Number(catalogoAnterior?.folioSiguiente) || 1, mayorFolio + 1)
  };


  const categorias =
    fs.readdirSync(
      CARPETA_DISENOS,
      { withFileTypes: true }
    )
    .filter(
      entrada =>
        entrada.isDirectory()
    )
    .map(
      entrada =>
        entrada.name
    )
    .sort(
      (a, b) =>
        a.localeCompare(
          b,
          'es',
          {
            sensitivity: 'base'
          }
        )
    );


  const resultadoCategorias = [];


  for (
    const nombreCategoria
    of categorias
  ) {

    const categoria =
      await escanearCategoria(
        nombreCategoria,
        registros,
        folioGlobal
      );


    resultadoCategorias.push(
      categoria
    );

  }


  /*
  ========================================================
  CATÁLOGO FINAL
  ========================================================
  */

  const catalogo = {

    version: 4,

    folioSiguiente: folioGlobal.valor,

    generado:
      new Date().toISOString(),

    categorias:
      resultadoCategorias

  };


  /*
  ========================================================
  GUARDAR
  ========================================================
  */

  fs.mkdirSync(
    path.dirname(
      ARCHIVO_SALIDA
    ),
    {
      recursive: true
    }
  );


  fs.writeFileSync(

    ARCHIVO_SALIDA,

    JSON.stringify(
      catalogo,
      null,
      2
    ),

    'utf8'

  );


  /*
  ========================================================
  ESTADÍSTICAS
  ========================================================
  */

  let totalProductos = 0;

  let totalImagenes = 0;

  let imagenesClaras = 0;

  let imagenesContraste = 0;


  for (
    const categoria
    of resultadoCategorias
  ) {

    totalProductos +=
      categoria.productos.length;


    for (
      const producto
      of categoria.productos
    ) {

      totalImagenes +=
        producto.imagenes.length;


      for (
        const imagen
        of producto.imagenes
      ) {

        if (
          imagen.estampadoClaro
        ) {

          imagenesClaras++;

        }


        if (
          imagen.necesitaContraste
        ) {

          imagenesContraste++;

        }

      }

    }

  }


  console.log('');
  console.log(
    '✓ Catálogo generado'
  );

  console.log(
    `✓ Categorías: ${resultadoCategorias.length}`
  );

  console.log(
    `✓ Productos: ${totalProductos}`
  );

  console.log(
    `✓ Imágenes: ${totalImagenes}`
  );

  console.log(
    `✓ Imágenes con estampado claro: ${imagenesClaras}`
  );

  console.log(
    `✓ Imágenes que necesitan contraste: ${imagenesContraste}`
  );

  console.log(
    `✓ Archivo: ${ARCHIVO_SALIDA}`
  );

}


main()
  .catch(
    error => {

      console.error(
        '\n✗ Error al generar catálogo:\n'
      );

      console.error(
        error
      );

      process.exit(1);

    }
  );
