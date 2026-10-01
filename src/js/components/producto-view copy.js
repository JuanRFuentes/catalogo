
/* =========================================================
   VISIÓN CREATIVA — VISTA DE PRODUCTO
   MÓDULO UNIVERSAL
========================================================= */

import { crearHeader } from './header.js';

const PLAYERA_FRENTE = './hero/playeras/playera-frente.png';
const PLAYERA_ESPALDA = './hero/playeras/playera-espalda.png';

let productoActual = null;
let vistaInicializada = false;
let intervaloFondoProducto = null;
let indiceFondoProducto = 0;


/* =========================================================
   UTILIDADES
========================================================= */

function escaparHTML(valor = '') {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter]);
}


function obtenerConfiguracion() {
    return window.configuracion || {};
}


function obtenerTemaActivo() {
    const configuracion = obtenerConfiguracion();
    const nombreTema = configuracion?.home?.tema || 'default';

    return configuracion?.temas?.[nombreTema]
        || configuracion?.temas?.default
        || {};
}


/* =========================================================
   FONDOS ANIMADOS
========================================================= */

function obtenerFondosProducto() {
    const configuracion = obtenerConfiguracion();
    const tema = obtenerTemaActivo();

    const fondosProducto = tema?.producto?.fondos;

    if (Array.isArray(fondosProducto) && fondosProducto.length) {
        return fondosProducto;
    }

    const fondosColecciones = tema?.colecciones?.fondos;

    if (Array.isArray(fondosColecciones) && fondosColecciones.length) {
        return fondosColecciones;
    }

    return [
        configuracion?.colores?.rosaClaro || '#f7d7df',
        configuracion?.colores?.azulSuave || '#dff1ff',
        '#e8ddff'
    ];
}


function obtenerIntervaloFondo() {
    const tema = obtenerTemaActivo();
    const intervalo = Number(tema?.producto?.intervaloFondoMs);

    return Number.isFinite(intervalo) && intervalo >= 1000
        ? intervalo
        : 4000;
}


function aplicarFondoProducto() {
    const panel = document.querySelector('.producto-view-panel');

    if (!panel) return;

    const fondos = obtenerFondosProducto();

    if (!fondos.length) return;

    const fondo = fondos[indiceFondoProducto % fondos.length];

    panel.style.setProperty('--producto-fondo', fondo);

    indiceFondoProducto++;
}


function iniciarFondosAnimados() {
    detenerFondosAnimados();

    indiceFondoProducto = 0;
    aplicarFondoProducto();

    intervaloFondoProducto = setInterval(
        aplicarFondoProducto,
        obtenerIntervaloFondo()
    );
}


function detenerFondosAnimados() {
    if (intervaloFondoProducto !== null) {
        clearInterval(intervaloFondoProducto);
        intervaloFondoProducto = null;
    }
}


/* =========================================================
   PREPARAR HEADER COMPARTIDO PARA EL VISOR
========================================================= */

function crearHeaderProducto() {
    const header = crearHeader();

    if (!header) {
        console.error('No se pudo crear el header compartido.');
        return document.createElement('div');
    }

    /*
       Identifica este header como el del visor.
       El CSS puede usar esta clase para aplicar
       la distribución móvil y de tablet.
    */
    header.classList.add('home-topbar-producto');

    /*
       El primer botón del header compartido es Buscar.
       En el visor se transforma en botón de salida.
    */
    const botonSalida = header.querySelector(
        '.home-header-actions .home-header-button'
    );

    if (botonSalida) {
        botonSalida.setAttribute('aria-label', 'Salir del producto');
        botonSalida.setAttribute('data-producto-close', '');

        const icono = botonSalida.querySelector('.home-header-icon');

        if (icono) {
            icono.textContent = '←';
        } else {
            botonSalida.textContent = '←';
        }
    }

    return header;
}


/* =========================================================
   CREAR PANEL
========================================================= */

function crearVista() {
    const existente = document.querySelector('#productoView');

    if (existente) return existente;

    const vista = document.createElement('section');

    vista.id = 'productoView';
    vista.className = 'producto-view';
    vista.setAttribute('aria-hidden', 'true');

    vista.innerHTML = `
        <div
            class="producto-view-overlay"
            data-producto-close
        ></div>

        <aside
            class="producto-view-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Personalizar producto"
        >
            <div class="producto-view-header">

                <div
                    class="producto-view-header-shared"
                    id="productoViewSharedHeader"
                ></div>

                <div
                    class="producto-view-header-chips"
                    id="productoViewHeaderChips"
                ></div>

            </div>

            <div
                class="producto-view-content"
                id="productoViewContent"
            ></div>
        </aside>
                <div
            class="producto-custom-panel"
            id="productoCustomPanel"
            aria-label="Personalización del producto"
            aria-hidden="true"
        ></div>
    `;

    /*
       Inserta el header compartido dentro del visor.
    */
    const contenedorHeader = vista.querySelector(
        '#productoViewSharedHeader'
    );

    if (contenedorHeader) {
        contenedorHeader.appendChild(crearHeaderProducto());
    }

    document.body.appendChild(vista);

    return vista;
}


/* =========================================================
   ENCONTRAR PRODUCTO
========================================================= */

function encontrarProducto(referencia) {
    const catalogo = window.catalogo;

    if (!catalogo || !Array.isArray(catalogo.categorias)) {
        return null;
    }

    const valor = String(referencia ?? '')
        .trim()
        .toUpperCase();

    if (!valor) return null;

    for (const categoria of catalogo.categorias) {
        if (!Array.isArray(categoria.productos)) continue;

        const producto = categoria.productos.find(item => {
            const sku = String(item?.sku ?? '')
                .trim()
                .toUpperCase();

            const numero = String(item?.numero ?? '')
                .trim()
                .toUpperCase();

            const id = String(item?.id ?? '')
                .trim()
                .toUpperCase();

            return sku === valor || numero === valor || id === valor;
        });

        if (producto) {
            return { producto, categoria };
        }
    }

    return null;
}


/* =========================================================
   RUTA DE IMAGEN
========================================================= */

function obtenerRutaImagen(categoria, imagen) {
    return (
        './diseños/' +
        encodeURIComponent(categoria.carpeta) +
        '/' +
        encodeURIComponent(imagen.archivo)
    );
}


/* =========================================================
   IMAGEN PRINCIPAL
========================================================= */

function obtenerImagenPrincipal(categoria, producto) {
    if (!Array.isArray(producto?.imagenes) || !producto.imagenes.length) {
        return null;
    }

    const frenteCentro = producto.imagenes.find(
        imagen =>
            imagen?.vista === 'front' &&
            imagen?.posicion === 'center'
    );

    const frente = producto.imagenes.find(
        imagen => imagen?.vista === 'front'
    );

    const imagen = frenteCentro || frente || producto.imagenes[0];

    return {
        ...imagen,
        url: obtenerRutaImagen(categoria, imagen)
    };
}


/* =========================================================
   CONTRASTE BLANCO
   Replica la lógica utilizada en las colecciones
========================================================= */

function productoNecesitaContrasteBlanco(producto, configuracion) {
    const listaContraste =
        configuracion?.home?.recomendaciones?.contrasteBlanco;

    if (producto?.necesitaContraste === true) {
        return true;
    }

    if (!Array.isArray(listaContraste)) {
        return false;
    }

    const skuProducto = String(producto?.sku || '')
        .trim()
        .toUpperCase();

    const numeroProducto = String(producto?.numero || '')
        .trim()
        .toUpperCase();

    return listaContraste.some(item => {
        const valor = String(item || '')
            .trim()
            .toUpperCase();

        return valor === skuProducto || valor === numeroProducto;
    });
}


/* =========================================================
   RENDERIZAR MOCKUP
========================================================= */

function renderizarProducto(producto, categoria) {
    const content = document.querySelector('#productoViewContent');

    if (!content) return;

    const imagen = obtenerImagenPrincipal(categoria, producto);

    const esEspalda = imagen?.vista === 'back';

    const posicion = imagen?.posicion === 'top'
        ? 'print-top'
        : 'print-center';

    const vistaClase = esEspalda
        ? 'print-back'
        : 'print-front';

    const basePlayera = esEspalda
        ? PLAYERA_ESPALDA
        : PLAYERA_FRENTE;

    const urlImagen = imagen?.url || '';

    /* CONTRASTE BLANCO */
    const configuracion = obtenerConfiguracion();

    const contrasteSobreBlanco =
        productoNecesitaContrasteBlanco(producto, configuracion);

    const claseContraste = contrasteSobreBlanco
        ? 'contraste-blanco'
        : '';

    const nombreImagen = escaparHTML(
        producto?.nombre ||
        producto?.titulo ||
        `Diseño ${producto?.numero || ''}`
    );

    const sku = producto?.sku || producto?.numero || '';
    const skuSeguro = escaparHTML(sku);
    const textoVista = esEspalda ? 'Espalda' : 'Frente';


    /* =====================================================
       ENCABEZADO DEL PRODUCTO
    ===================================================== */

    const headerChips = document.querySelector(
        '#productoViewHeaderChips'
    );

    if (headerChips) {
        headerChips.innerHTML = `
            <span class="producto-view-chip producto-view-chip-vista">
                ${textoVista}
            </span>

            ${
                skuSeguro
                    ? `
                        <span class="producto-view-chip producto-view-chip-sku">
                            SKU: ${skuSeguro}
                        </span>
                    `
                    : ''
            }
        `;
    }


    /* =====================================================
       CONTENIDO DEL PRODUCTO
    ===================================================== */

    content.innerHTML = `
        <div class="producto-view-main">

            <div class="producto-view-shirt-wrap">
                <div class="producto-view-shirt">

                    <img
                        class="producto-view-shirt-base"
                        src="${basePlayera}"
                        alt="Playera"
                        draggable="false"
                    >

                    ${
                        urlImagen
                            ? `
                                <img
                                    class="
                                        producto-view-print
                                        ${vistaClase}
                                        ${posicion}
                                        ${claseContraste}
                                    "
                                    src="${urlImagen}"
                                    alt="${nombreImagen}"
                                    draggable="false"
                                >
                            `
                            : ''
                    }

                </div>
            </div>

            <button
                type="button"
                class="producto-view-customize"
                data-producto-personalizar
            >
                Personalizar
            </button>

        </div>
    `;
}


/* =========================================================
   ABRIR PRODUCTO
========================================================= */

export function abrirProducto(referencia) {
    let resultado = referencia;

    if (!resultado || typeof resultado !== 'object') {
        resultado = encontrarProducto(referencia);
    }

    if (resultado?.producto && resultado?.categoria) {
        productoActual = resultado;
    } else {
        productoActual = null;
    }

    if (
        referencia &&
        typeof referencia === 'object' &&
        !referencia.producto
    ) {
        const encontrado = encontrarProducto(
            referencia.sku ||
            referencia.numero ||
            referencia.id
        );

        if (encontrado) {
            productoActual = encontrado;
        }
    }

    if (!productoActual) {
        console.warn('Producto no encontrado:', referencia);
        return;
    }

    const vista = crearVista();

    renderizarProducto(
        productoActual.producto,
        productoActual.categoria
    );

    vista.classList.add('is-open');
    vista.setAttribute('aria-hidden', 'false');

    const home = document.querySelector('#catalogHome');

    if (home) {
        home.classList.add('producto-view-open');
    }

    document.body.classList.add('producto-view-active');
    document.body.style.overflow = 'hidden';

    iniciarFondosAnimados();

    /*
       Mantiene compatibilidad con los iconos Lucide
       que pudieran existir en otros elementos del visor.
    */
    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* =========================================================
   CERRAR PRODUCTO
========================================================= */

export function cerrarProducto() {
    const vista = document.querySelector('#productoView');

    if (vista) {
        vista.classList.remove('is-open');
        vista.setAttribute('aria-hidden', 'true');
    }

    const home = document.querySelector('#catalogHome');

    if (home) {
        home.classList.remove('producto-view-open');
    }

    document.body.classList.remove('producto-view-active');
    document.body.style.overflow = '';

    detenerFondosAnimados();
}


/* =========================================================
   CONECTAR TARJETAS Y BOTONES
========================================================= */

export function conectarProductos() {
    if (vistaInicializada) return;
 
    vistaInicializada = true;

    document.addEventListener('click', evento => {

        /* CERRAR VISOR */
        const cerrar = evento.target.closest('[data-producto-close]');

        if (cerrar) {
            evento.preventDefault();
            cerrarProducto();
            return;
        }


        /* PERSONALIZAR PRODUCTO */
        const personalizar = evento.target.closest(
            '[data-producto-personalizar]'
        );

        if (personalizar) {
            evento.preventDefault();

            if (productoActual) {
                document.dispatchEvent(
                    new CustomEvent('producto:personalizar', {
                        detail: {
                            producto: productoActual.producto,
                            categoria: productoActual.categoria
                        }
                    })
                );
            }

            return;
        }


        /* ABRIR PRODUCTO DESDE TARJETA */
        const tarjeta = evento.target.closest('[data-producto]');

        if (!tarjeta) return;

        if (evento.target.closest('button, a')) return;

        const referencia = tarjeta.dataset.producto;

        if (!referencia) return;

        abrirProducto(referencia);
    });


    /* CERRAR CON ESCAPE */
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            cerrarProducto();
        }
    });
}


/* =========================================================
   INICIALIZAR
========================================================= */

export function inicializarProductoView() {
    crearVista();
    conectarProductos();
}


inicializarProductoView();