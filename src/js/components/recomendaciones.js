import {
  obtenerConfiguracionPlayera
} from '../motor/playeras.js';
import {
    abrirProducto
} from './producto-view.js';

/* =========================================================
   IMAGEN PRINCIPAL
========================================================= */

function obtenerImagenPrincipal(producto) {

  if (
    !producto ||
    !Array.isArray(producto.imagenes) ||
    !producto.imagenes.length
  ) {
    return null;
  }


  const frenteCentro =
    producto.imagenes.find(
      imagen =>
        imagen?.vista === 'front' &&
        imagen?.posicion === 'center'
    );

  if (frenteCentro) {
    return frenteCentro;
  }


  const frente =
    producto.imagenes.find(
      imagen =>
        imagen?.vista === 'front'
    );

  if (frente) {
    return frente;
  }


  return producto.imagenes[0];
}


/* =========================================================
   RUTA DEL DISEÑO
========================================================= */

function obtenerRutaDiseño(
  categoria,
  imagen
) {

  if (
    !categoria?.carpeta ||
    !imagen?.archivo
  ) {
    return '';
  }


  return (
    './diseños/' +
    encodeURIComponent(
      categoria.carpeta
    ) +
    '/' +
    encodeURIComponent(
      imagen.archivo
    )
  );
}


/* =========================================================
   POSICIÓN DEL ESTAMPADO
========================================================= */

function obtenerClasePosicion(imagen) {

  const posicion =
    String(
      imagen?.posicion || ''
    )
      .trim()
      .toLowerCase();


  if (posicion === 'top') {
    return 'print-top';
  }


  if (posicion === 'center') {
    return 'print-center';
  }


  /*
   * Si en el futuro aparece otra posición,
   * utilizamos center como comportamiento
   * seguro.
   */

  return 'print-center';
}


/* =========================================================
   PRODUCTOS CON CONTRASTE SOBRE BLANCO
========================================================= */

function productoNecesitaContrasteBlanco(
  producto,
  configuracion
) {

  const lista =
    configuracion
      ?.home
      ?.recomendaciones
      ?.contrasteBlanco;


  if (
    !Array.isArray(lista) ||
    !lista.length
  ) {
    return false;
  }


  const sku =
    String(
      producto?.sku || ''
    )
      .trim()
      .toUpperCase();


  const numero =
    String(
      producto?.numero || ''
    )
      .trim()
      .toUpperCase();


  return lista.some(
    item => {

      const valor =
        String(item || '')
          .trim()
          .toUpperCase();


      return (
        valor === sku ||
        valor === numero
      );
    }
  );
}


/* =========================================================
   CREAR CARD
========================================================= */

function crearCardRecomendacion(
  categoria,
  producto,
  configuracion,
  indice
) {

  const imagen =
    obtenerImagenPrincipal(
      producto
    );


  if (!imagen) {
    return null;
  }


  /* =====================================================
     FONDO DE TARJETA
  ===================================================== */

  const temaActivo =
    configuracion?.temas?.[configuracion?.home?.tema || 'default'];

  const fondosTarjeta =
    Array.isArray(temaActivo?.tarjetas?.fondos) && temaActivo.tarjetas.fondos.length
      ? temaActivo.tarjetas.fondos
      : ['rosa', 'azul', 'gris'];


  const fondoTarjeta =
    fondosTarjeta[
      indice % fondosTarjeta.length
    ];


  /* =====================================================
     CONTRASTE SOBRE BLANCO
  ===================================================== */

  const contrasteSobreBlanco =
    productoNecesitaContrasteBlanco(
      producto,
      configuracion
    );


  /* =====================================================
     CONFIGURACIÓN PLAYERA
  ===================================================== */

  const configuracionPlayera =
    obtenerConfiguracionPlayera({

      configuracion,

      estampadoClaro:
        imagen.estampadoClaro === true,

      fondoTarjeta,

      presentacion: {
        playeraColor: temaActivo?.playeras?.colorEnPortada === true
      },

      vista:
        imagen.vista === 'back'
          ? 'back'
          : 'front',

      forzarBlanco:
        contrasteSobreBlanco
    });

/* =====================================================
   CARD
===================================================== */

const card =
    document.createElement(
        'article'
    );

card.className =
    'home-card home-rec-card';

card.dataset.producto =
    producto.sku ||
    producto.numero ||
    producto.id ||
    '';
card.dataset.search = [
    categoria.nombre, categoria.carpeta, producto.sku, producto.codigo, producto.numero,
    producto.nombre, producto.name, producto.titulo, producto.descripcion,
    Array.isArray(producto.tags) ? producto.tags.join(' ') : producto.tags,
    Array.isArray(producto.etiquetas) ? producto.etiquetas.join(' ') : producto.etiquetas
].filter(Boolean).join(' ');

/* =====================================================
   ABRIR DETALLE DEL PRODUCTO
===================================================== */

card.addEventListener(
    'click',
    () => {

        abrirProducto(
            producto.sku ||
            producto.numero ||
            producto.id
        );

    }
);

  /* =====================================================
     FOTO
  ===================================================== */

  const photo =
    document.createElement(
      'div'
    );

  photo.className =
    `home-photo home-shirt-photo home-rec-photo rec-bg-${fondoTarjeta}`;


  /* =====================================================
     PLAYERA
  ===================================================== */

  const miniShirt =
    document.createElement(
      'div'
    );

  miniShirt.className =
    `home-mini-shirt shirt-${configuracionPlayera.color}`;


  /*
   * La misma PNG de la playera
   * se utiliza como máscara de color.
   */

  miniShirt.style.setProperty(
    '--shirt-mask',
    `url("${configuracionPlayera.archivo}")`
  );


  /* =====================================================
     PLAYERA BASE
  ===================================================== */

  const shirt =
    document.createElement(
      'img'
    );

  shirt.className =
    `home-mini-shirt-base shirt-${configuracionPlayera.color}`;

  shirt.src =
    configuracionPlayera.archivo;

  shirt.alt =
    'Playera';

  shirt.loading =
    'lazy';

  shirt.decoding =
    'async';

  shirt.draggable =
    false;


  /* =====================================================
     ESTAMPADO
  ===================================================== */

  const print =
    document.createElement(
      'img'
    );


  /*
   * Conservamos la posición que viene
   * directamente de catalogo.json.
   *
   * Ejemplo:
   *
   * posicion = top
   *     ↓
   * print-top
   *
   * posicion = center
   *     ↓
   * print-center
   */
const clasePosicion =
  obtenerClasePosicion(imagen);

const claseVista =
  imagen?.vista === 'back'
    ? 'print-back'
    : 'print-front';

print.className =
  `home-mini-print ${clasePosicion} ${claseVista}`;

  /*
   * Contraste especial para diseños
   * que deben permanecer sobre blanco.
   */

  if (contrasteSobreBlanco) {

    print.classList.add(
      'contraste-blanco'
    );
  }


  print.src =
    obtenerRutaDiseño(
      categoria,
      imagen
    );

  print.alt =
    `Estampado ${producto.sku || producto.numero || ''}`;

  print.loading =
    'lazy';

  print.decoding =
    'async';

  print.draggable =
    false;


  /* =====================================================
     ENSAMBLAR PLAYERA
  ===================================================== */

  miniShirt.append(
    shirt,
    print
  );


  /* =====================================================
     FOTO COMPLETA
  ===================================================== */

  photo.append(
    miniShirt
  );


  /* =====================================================
     NOMBRE
  ===================================================== */

  const name =
    document.createElement(
      'span'
    );

  name.className =
    'home-name';

  name.textContent =
    producto.sku || producto.numero || '';


  /* =====================================================
     PRECIO
  ===================================================== */

  const price =
    document.createElement(
      'span'
    );

  price.className =
    'home-price';

  const valorPrecio = Number(producto.precio);
  const mostrarPrecio = Number.isFinite(valorPrecio) && valorPrecio > 0;
  price.hidden = !mostrarPrecio;
  if (mostrarPrecio) {
    price.textContent = valorPrecio.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }


  /* =====================================================
     CARD FINAL
  ===================================================== */

  card.append(photo, name);
  if (mostrarPrecio) card.append(price);


  return card;
}


/* =========================================================
   RENDERIZAR RECOMENDACIONES
========================================================= */

export function renderizarRecomendaciones(
  catalogo,
  configuracion
) {

  const contenedor =
    document.querySelector(
      '#homeRecommendationGrid'
    );


  if (!contenedor) {
    return;
  }


  contenedor.innerHTML =
    '';


  const nombreCategoria =
    configuracion
      ?.home
      ?.recomendaciones
      ?.categoria;


  if (!nombreCategoria) {

    console.warn(
      'No hay categoría configurada para recomendaciones.'
    );

    return;
  }


  const categorias =
    Array.isArray(
      catalogo?.categorias
    )
      ? catalogo.categorias
      : [];


  const categoria =
    categorias.find(
      item =>
        String(
          item?.nombre || ''
        )
          .trim()
          .toLowerCase() ===
        String(
          nombreCategoria
        )
          .trim()
          .toLowerCase()
    );


  if (!categoria) {

    console.warn(
      'No se encontró la categoría:',
      nombreCategoria
    );

    return;
  }


  const productos =
    Array.isArray(
      categoria.productos
    )
      ? [...categoria.productos]
      : [];


  // Mantener el orden del catálogo estable entre recargas.
  productos.sort(
    (a, b) =>
      String(a?.numero || a?.sku || a?.id || '')
        .localeCompare(
          String(b?.numero || b?.sku || b?.id || ''),
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
  );


  productos
    .slice(-8)
    .forEach(
      (
        producto,
        indice
      ) => {

        const card =
          crearCardRecomendacion(
            categoria,
            producto,
            configuracion,
            indice
          );


        if (card) {
          contenedor.appendChild(
            card
          );
        }
      }
    );


  console.log(
    '✓ Recomendaciones:',
    contenedor.children.length
  );


  console.log(
    '✓ Categoría:',
    categoria.nombre
  );


  actualizarFlechasRecomendaciones();
}


/* =========================================================
   ELEMENTOS DEL CARRUSEL
========================================================= */

function obtenerElementosCarrusel() {

  const carrusel =
    document.querySelector(
      '#homeRecommendationGrid'
    );

  const flechaIzquierda =
    document.querySelector(
      '#homeRecArrowLeft'
    );

  const flechaDerecha =
    document.querySelector(
      '#homeRecArrowRight'
    );


  return {
    carrusel,
    flechaIzquierda,
    flechaDerecha
  };
}


/* =========================================================
   MÓVIL
========================================================= */

function esMovilRecomendaciones() {

  return window.matchMedia(
    '(max-width:800px)'
  ).matches;
}


/* =========================================================
   FLECHAS
========================================================= */

function actualizarFlechasRecomendaciones() {

  const {
    carrusel,
    flechaIzquierda,
    flechaDerecha
  } =
    obtenerElementosCarrusel();


  if (
    !carrusel ||
    !flechaIzquierda ||
    !flechaDerecha
  ) {
    return;
  }


  if (
    esMovilRecomendaciones()
  ) {

    flechaIzquierda.style.display =
      'none';

    flechaDerecha.style.display =
      'none';

    return;
  }


  const maxScroll =
    Math.max(
      0,
      carrusel.scrollWidth -
      carrusel.clientWidth
    );


  if (maxScroll <= 5) {

    flechaIzquierda.style.display =
      'none';

    flechaDerecha.style.display =
      'none';

    return;
  }


  flechaIzquierda.style.display =
    carrusel.scrollLeft > 5
      ? 'flex'
      : 'none';


  flechaDerecha.style.display =
    carrusel.scrollLeft <
    maxScroll - 5
      ? 'flex'
      : 'none';
}


/* =========================================================
   PASO DEL CARRUSEL
========================================================= */

function obtenerPasoCarrusel() {

  const {
    carrusel
  } =
    obtenerElementosCarrusel();


  if (!carrusel) {
    return 160;
  }


  const card =
    carrusel.querySelector(
      '.home-rec-card'
    );


  if (!card) {
    return 160;
  }


  const ancho =
    card.getBoundingClientRect()
      .width;


  const estilos =
    window.getComputedStyle(
      carrusel
    );


  const gap =
    parseFloat(
      estilos.columnGap ||
      estilos.gap ||
      '12'
    );


  return ancho + gap;
}


/* =========================================================
   CONTROLES
========================================================= */

function activarScrollRecomendaciones() {

  const {
    carrusel,
    flechaIzquierda,
    flechaDerecha
  } =
    obtenerElementosCarrusel();


  if (!carrusel) {
    return;
  }


  /* =====================================================
     WHEEL
  ===================================================== */

  carrusel.addEventListener(
    'wheel',
    evento => {

      if (
        esMovilRecomendaciones()
      ) {
        return;
      }


      if (
        carrusel.scrollWidth <=
        carrusel.clientWidth
      ) {
        return;
      }


      const movimiento =
        Math.abs(evento.deltaY) >
        Math.abs(evento.deltaX)
          ? evento.deltaY
          : evento.deltaX;


      if (
        Math.abs(movimiento) < 1
      ) {
        return;
      }


      evento.preventDefault();

      carrusel.scrollLeft +=
        movimiento;
    },
    {
      passive:false
    }
  );


  /* =====================================================
     DRAG
  ===================================================== */

  let presionado =
    false;

  let arrastrando =
    false;

  let huboArrastre =
    false;

  let inicioX =
    0;

  let inicioScroll =
    0;


  carrusel.addEventListener(
    'pointerdown',
    evento => {

      if (
        esMovilRecomendaciones()
      ) {
        return;
      }


      if (
        evento.pointerType === 'mouse' &&
        evento.button !== 0
      ) {
        return;
      }


      presionado =
        true;

      arrastrando =
        false;

      huboArrastre =
        false;

      inicioX =
        evento.clientX;

      inicioScroll =
        carrusel.scrollLeft;
    }
  );


  carrusel.addEventListener(
    'pointermove',
    evento => {

      if (!presionado) {
        return;
      }


      const desplazamiento =
        evento.clientX -
        inicioX;


      if (
        !arrastrando &&
        Math.abs(desplazamiento) < 6
      ) {
        return;
      }


      if (!arrastrando) {

        arrastrando =
          true;

        huboArrastre =
          true;


        carrusel.classList.add(
          'dragging'
        );


        try {

          carrusel.setPointerCapture(
            evento.pointerId
          );

        } catch (error) {}
      }


      carrusel.scrollLeft =
        inicioScroll -
        desplazamiento;
    }
  );


  function terminarArrastre(
    evento
  ) {

    if (!presionado) {
      return;
    }


    presionado =
      false;


    if (arrastrando) {

      carrusel.classList.remove(
        'dragging'
      );


      try {

        carrusel.releasePointerCapture(
          evento.pointerId
        );

      } catch (error) {}
    }


    arrastrando =
      false;
  }


  carrusel.addEventListener(
    'pointerup',
    terminarArrastre
  );

  carrusel.addEventListener(
    'pointercancel',
    terminarArrastre
  );


  carrusel.addEventListener(
    'click',
    evento => {

      if (!huboArrastre) {
        return;
      }


      evento.preventDefault();

      evento.stopPropagation();


      huboArrastre =
        false;
    },
    true
  );


  carrusel.addEventListener(
    'scroll',
    () => {

      actualizarFlechasRecomendaciones();

    },
    {
      passive:true
    }
  );


  if (flechaIzquierda) {

    flechaIzquierda.addEventListener(
      'click',
      evento => {

        evento.preventDefault();

        evento.stopPropagation();


        const paso =
          obtenerPasoCarrusel();


        carrusel.scrollBy({
          left:-(paso * 3),
          behavior:'smooth'
        });
      }
    );
  }


  if (flechaDerecha) {

    flechaDerecha.addEventListener(
      'click',
      evento => {

        evento.preventDefault();

        evento.stopPropagation();


        const paso =
          obtenerPasoCarrusel();


        carrusel.scrollBy({
          left:paso * 3,
          behavior:'smooth'
        });
      }
    );
  }


  window.addEventListener(
    'resize',
    () => {

      actualizarFlechasRecomendaciones();

    }
  );


  actualizarFlechasRecomendaciones();


  console.log(
    '✓ Controles del carrusel activados'
  );
}


activarScrollRecomendaciones();
