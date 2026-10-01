const RUTA_CATALOGO = './data/catalogo.json';
const RUTA_CONFIGURACION = './data/configuracion.json';

let catalogo = null;
let configuracion = null;

function normalizarVistaPorNombre(imagen = {}) {
    const coincidencia = String(imagen.archivo || '').match(/-([CT])-([FB])(?:\.[^.]+)$/i);
    if (!coincidencia) return imagen;
    const posicionCodigo = coincidencia[1].toUpperCase();
    const vistaCodigo = coincidencia[2].toUpperCase();
    return {
        ...imagen,
        vistaCodigo,
        posicionCodigo: imagen.posicionCodigo || posicionCodigo,
        vista: vistaCodigo === 'B' ? 'back' : 'front',
        posicion: imagen.posicion || (posicionCodigo === 'T' ? 'top' : 'center')
    };
}


export async function cargarCatalogo() {

    if (catalogo) {
        return catalogo;
    }

    const respuesta =
        await fetch(RUTA_CATALOGO, { cache: 'no-store' });

    if (!respuesta.ok) {

        throw new Error(
            `No se pudo cargar el catálogo: ${respuesta.status}`
        );

    }

    catalogo = await respuesta.json();
    catalogo.categorias?.forEach(categoria => {
        categoria.productos?.forEach(producto => {
            if (Array.isArray(producto.imagenes)) {
                producto.imagenes = producto.imagenes.map(normalizarVistaPorNombre);
            }
        });
    });

    return catalogo;
}


export async function cargarConfiguracion() {

    if (configuracion) {
        return configuracion;
    }

    const respuesta =
        await fetch(RUTA_CONFIGURACION);

    if (!respuesta.ok) {

        throw new Error(
            `No se pudo cargar la configuración: ${respuesta.status}`
        );

    }

    configuracion =
        await respuesta.json();

    return configuracion;
}


export async function obtenerCategorias() {

    const datos =
        await cargarCatalogo();

    return datos.categorias;
}


export async function obtenerCategoria(
    carpeta
) {

    const datos =
        await cargarCatalogo();

    return datos.categorias.find(
        categoria =>
            categoria.carpeta === carpeta
    ) || null;
}


export async function obtenerCategoriaPorNombre(
    nombre
) {

    const datos =
        await cargarCatalogo();

    if (!nombre) {
        return null;
    }

    const nombreBuscado =
        nombre
            .trim()
            .toLowerCase();

    return datos.categorias.find(
        categoria =>
            categoria.nombre
                .trim()
                .toLowerCase() ===
            nombreBuscado
    ) || null;
}


export async function obtenerProducto(
    carpeta,
    sku
) {

    const categoria =
        await obtenerCategoria(
            carpeta
        );

    if (!categoria) {
        return null;
    }

    return categoria.productos.find(
        producto =>
            producto.sku === sku
    ) || null;
}


export function seleccionarProductosAleatorios(
    productos,
    cantidad = 8
) {

    if (!Array.isArray(productos)) {
        return [];
    }

    const copia =
        [...productos];

    for (
        let indice = copia.length - 1;
        indice > 0;
        indice--
    ) {

        const aleatorio =
            Math.floor(
                Math.random() *
                (indice + 1)
            );

        [
            copia[indice],
            copia[aleatorio]
        ] = [
            copia[aleatorio],
            copia[indice]
        ];
    }

    return copia.slice(
        0,
        Math.min(
            cantidad,
            copia.length
        )
    );
}


export function obtenerRutaImagen(
    categoria,
    imagen
) {

    return (
        `./diseños/` +
        `${encodeURIComponent(categoria.carpeta)}/` +
        `${encodeURIComponent(imagen.archivo)}`
    );
}


export function obtenerImagenesProducto(
    categoria,
    producto
) {

    return producto.imagenes.map(
        imagen => ({

            ...imagen,

            url:
                obtenerRutaImagen(
                    categoria,
                    imagen
                )

        })
    );
}
