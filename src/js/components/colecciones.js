/* =========================================================
   VISIÓN CREATIVA — COLECCIONES
========================================================= */

import {
    obtenerConfiguracionPlayera
} from '../motor/playeras.js';

const PLAYERA_FRENTE = './hero/playeras/playera-frente.png';
const PLAYERA_ESPALDA = './hero/playeras/playera-espalda.png';

let catalogoActual = null;
let configuracionActual = null;
let ultimoFondoColeccion = null;


/* =========================================================
   CONTENEDOR
========================================================= */

function obtenerContenedor(){

    return document.querySelector(
        '#homeDesignGrid'
    );

}


/* =========================================================
   CATEGORÍAS
========================================================= */

function obtenerCategorias(){

    if(
        !catalogoActual ||
        !Array.isArray(
            catalogoActual.categorias
        )
    ){

        return [];

    }

    return catalogoActual.categorias;

}


/* =========================================================
   FONDOS DE LAS CARDS DE COLECCIONES
========================================================= */

function obtenerFondosColeccion(){

    const tema =
        configuracionActual?.home?.tema;

    const fondos =
        configuracionActual
            ?.temas
            ?. [tema]
            ?.colecciones
            ?.fondos;

    if(
        !Array.isArray(fondos) ||
        !fondos.length
    ){

        console.warn(
            'No hay fondos configurados para el tema:',
            tema
        );

        return [];

    }

    return fondos.filter(
        fondo =>
            typeof fondo === 'string' &&
            fondo.trim() !== ''
    );

}


function obtenerFondoAleatorio(){

    const fondos =
        obtenerFondosColeccion();

    if(!fondos.length){

        return '';

    }

    if(fondos.length === 1){

        ultimoFondoColeccion =
            fondos[0];

        return fondos[0];

    }

    const opciones =
        fondos.filter(
            fondo =>
                fondo !==
                ultimoFondoColeccion
        );

    const fondo =
        opciones[
            Math.floor(
                Math.random() *
                opciones.length
            )
        ];

    ultimoFondoColeccion =
        fondo;

    return fondo;

}


function obtenerPlayeraPortada(imagen, fondoTarjeta) {
    const tema = configuracionActual?.temas?.[configuracionActual?.home?.tema || 'default'];
    return obtenerConfiguracionPlayera({
        configuracion: configuracionActual,
        estampadoClaro: imagen?.estampadoClaro === true,
        fondoTarjeta,
        vista: imagen?.vista === 'back' ? 'back' : 'front',
        presentacion: {
            playeraColor: tema?.playeras?.colorEnPortada === true
        }
    });
}


/* =========================================================
   IMAGEN PRINCIPAL
========================================================= */

function obtenerImagenPrincipal(
    producto
){

    if(
        !producto ||
        !Array.isArray(
            producto.imagenes
        ) ||
        !producto.imagenes.length
    ){

        return null;

    }

    const frenteCentro =
        producto.imagenes.find(
            imagen =>
                imagen?.vista === 'front' &&
                imagen?.posicion === 'center'
        );

    if(frenteCentro){

        return frenteCentro;

    }

    const frente =
        producto.imagenes.find(
            imagen =>
                imagen?.vista === 'front'
        );

    if(frente){

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
){

    if(
        !categoria?.carpeta ||
        !imagen?.archivo
    ){

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

function aplicarPosicionEstampado(
    print,
    imagen
){

    if(
        imagen?.posicion === 'top'
    ){

        print.classList.add(
            'print-top'
        );

    }else{

        print.classList.add(
            'print-center'
        );

    }

    if(
        imagen?.vista === 'back'
    ){

        print.classList.add(
            'print-back'
        );

    }else{

        print.classList.add(
            'print-front'
        );

    }

}


/* =========================================================
   PRODUCTOS CON CONTRASTE SOBRE BLANCO
========================================================= */

function productoNecesitaContrasteBlanco(
    producto,
    configuracion
){

    const lista =
        configuracion
            ?.home
            ?.recomendaciones
            ?.contrasteBlanco;

    if(
        !Array.isArray(lista) ||
        !lista.length
    ){

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
   CREAR TARJETA
========================================================= */

function crearTarjeta(
    categoria,
    producto
){

    const imagen =
        obtenerImagenPrincipal(
            producto
        );

    if(!imagen){

        return null;

    }


    /* -----------------------------------------------------
       CARD
    ----------------------------------------------------- */

    const card = document.createElement('article');

card.className =
    'home-card home-collection-card';

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

    /* -----------------------------------------------------
       FOTO
    ----------------------------------------------------- */

    const photo =
        document.createElement(
            'div'
        );

    photo.className =
        'home-photo';

    const fondoTarjeta = obtenerFondoAleatorio();
    photo.style.backgroundColor = fondoTarjeta;


    /* -----------------------------------------------------
       PLAYERA
    ----------------------------------------------------- */

    const miniShirt =
        document.createElement(
            'div'
        );

    const playeraPortada = obtenerPlayeraPortada(imagen, fondoTarjeta);
    const rutaPlayera = imagen.vista === 'back'
        ? PLAYERA_ESPALDA
        : PLAYERA_FRENTE;

    miniShirt.className =
        `home-mini-shirt shirt-${playeraPortada.color}`;

    miniShirt.style.setProperty(
        '--shirt-mask',
        `url("${rutaPlayera}")`
    );


    const shirt =
        document.createElement(
            'img'
        );

    shirt.className =
        'home-mini-shirt-base';

    shirt.src = rutaPlayera;

    shirt.alt =
        'Playera';

    shirt.loading =
        'lazy';

    shirt.decoding =
        'async';


    /* -----------------------------------------------------
       ESTAMPADO
    ----------------------------------------------------- */

    const print =
        document.createElement(
            'img'
        );

    print.className =
        'home-mini-print';


    aplicarPosicionEstampado(
        print,
        imagen
    );


    print.src =
        obtenerRutaDiseño(
            categoria,
            imagen
        );

    print.alt =
        producto.sku || producto.numero || '';

    print.loading =
        'lazy';

    print.decoding =
        'async';


    /*
     * CONTRASTE
     *
     * Conserva el resultado del scanner:
     *
     * producto.necesitaContraste === true
     *
     * y además utiliza la misma configuración
     * de contraste de Recomendaciones.
     */

    const contrasteSobreBlanco =
        producto.necesitaContraste === true ||
        productoNecesitaContrasteBlanco(
            producto,
            configuracionActual
        );

    if(contrasteSobreBlanco){

        print.classList.add(
            'contraste-blanco'
        );

    }


    miniShirt.append(
        shirt,
        print
    );


    
photo.append(
        miniShirt
    );


    /* -----------------------------------------------------
       NOMBRE
    ----------------------------------------------------- */

    const name =
        document.createElement(
            'span'
        );

    name.className =
        'home-name';

    name.textContent =
        producto.sku || producto.numero || '';


    /* -----------------------------------------------------
       PRECIO
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       CARD COMPLETA
    ----------------------------------------------------- */

    card.append(photo, name);
    if (mostrarPrecio) card.append(price);


    return card;

}


/* =========================================================
   CREAR BLOQUE DE CATEGORÍA
========================================================= */

function crearBloqueCategoria(
    categoria
){

    const bloque =
        document.createElement(
            'section'
        );

    bloque.className =
        'home-category-block';

    bloque.dataset.categoria =
        categoria.carpeta ||
        categoria.nombre ||
        '';


    /* =====================================================
       CABECERA
    ===================================================== */

    const head =
        document.createElement(
            'div'
        );

    head.className =
        'home-category-block-head';


    /* -----------------------------------------------------
       TEXTOS
    ----------------------------------------------------- */

    const textos =
        document.createElement(
            'div'
        );


    const title =
        document.createElement(
            'h3'
        );

    title.className =
        'home-category-title';

    title.textContent =
        categoria.nombre ||
        categoria.carpeta ||
        'Colección';


    const sub =
        document.createElement(
            'p'
        );

    sub.className =
        'home-category-sub';


    const cantidad =
        Array.isArray(
            categoria.productos
        )
            ? categoria.productos.length
            : 0;


    sub.textContent =
        `${cantidad} diseños`;


    textos.append(
        title,
        sub
    );


    /* -----------------------------------------------------
       VER TODO
    ----------------------------------------------------- */

    const verTodo =
        document.createElement(
            'button'
        );

    verTodo.type =
        'button';

    verTodo.className =
        'home-see home-category-see';

    verTodo.textContent =
        'Ver todo';


    verTodo.addEventListener(
        'click',
        () => {

            mostrarCategoriaCompleta(
                categoria
            );

        }
    );


    head.append(
        textos,
        verTodo
    );


    /* =====================================================
       GRID
    ===================================================== */

    const grid =
        document.createElement(
            'div'
        );

    grid.className =
        'home-category-grid';


    const productos =
        Array.isArray(
            categoria.productos
        )
            ? categoria.productos
            : [];


    productos
        .slice(0,8)
        .forEach(
            producto => {

                const card =
                    crearTarjeta(
                        categoria,
                        producto
                    );


                if(card){

                    grid.appendChild(
                        card
                    );

                }

            }
        );


    bloque.append(
        head,
        grid
    );


    return bloque;

}


/* =========================================================
   RENDERIZAR TODAS LAS CATEGORÍAS
========================================================= */

function renderizarTodasLasCategorias(){

    const contenedor =
        obtenerContenedor();


    if(!contenedor){

        console.warn(
            'No existe #homeDesignGrid'
        );

        return;

    }


    contenedor.innerHTML =
        '';


    const categorias =
        obtenerCategorias();


    categorias.forEach(
        categoria => {

            if(
                !Array.isArray(
                    categoria.productos
                ) ||
                !categoria.productos.length
            ){

                return;

            }


            const bloque =
                crearBloqueCategoria(
                    categoria
                );


            contenedor.appendChild(
                bloque
            );

        }
    );


    console.log(
        '✓ Colecciones por categoría:',
        categorias.length
    );

}


/* =========================================================
   MOSTRAR UNA CATEGORÍA
========================================================= */

function mostrarCategoria(
    nombre
){

    const contenedor =
        obtenerContenedor();


    if(!contenedor){

        return;

    }


    const buscado =
        String(
            nombre || ''
        )
        .trim()
        .toLowerCase();


    const categoria =
        obtenerCategorias().find(
            item => {

                const nombreCategoria =
                    String(
                        item?.nombre || ''
                    )
                    .trim()
                    .toLowerCase();


                const carpeta =
                    String(
                        item?.carpeta || ''
                    )
                    .trim()
                    .toLowerCase();


                return (
                    nombreCategoria === buscado ||
                    carpeta === buscado
                );

            }
        );


    if(!categoria){

        console.warn(
            'No se encontró categoría:',
            nombre
        );

        return;

    }


    contenedor.innerHTML =
        '';


    const bloque =
        crearBloqueCategoria(
            categoria
        );


    contenedor.appendChild(
        bloque
    );

}


/* =========================================================
   MOSTRAR CATEGORÍA COMPLETA
========================================================= */

function mostrarCategoriaCompleta(
    categoria
){

    const contenedor =
        obtenerContenedor();


    if(!contenedor){

        return;

    }


    contenedor.innerHTML =
        '';


    const bloque =
        document.createElement(
            'section'
        );

    bloque.className =
        'home-category-block home-category-full';


    /* -----------------------------------------------------
       CABECERA
    ----------------------------------------------------- */

    const head =
        document.createElement(
            'div'
        );

    head.className =
        'home-category-block-head';


    const textos =
        document.createElement(
            'div'
        );


    const title =
        document.createElement(
            'h3'
        );

    title.className =
        'home-category-title';

    title.textContent =
        categoria.nombre ||
        categoria.carpeta;


    const sub =
        document.createElement(
            'p'
        );

    sub.className =
        'home-category-sub';

    sub.textContent =
        'Todos nuestros diseños';


    textos.append(
        title,
        sub
    );


    const volver =
        document.createElement(
            'button'
        );

    volver.type =
        'button';

    volver.className =
        'home-see home-category-see';

    volver.textContent =
        '← Volver';


    volver.addEventListener(
        'click',
        () => {

            renderizarTodasLasCategorias();

            activarBotonTodos();

        }
    );


    head.append(
        textos,
        volver
    );


    /* -----------------------------------------------------
       GRID COMPLETO
    ----------------------------------------------------- */

    const grid =
        document.createElement(
            'div'
        );

    grid.className =
        'home-category-grid';


    const productos =
        Array.isArray(
            categoria.productos
        )
            ? categoria.productos
            : [];


    productos.forEach(
        producto => {

            const card =
                crearTarjeta(
                    categoria,
                    producto
                );


            if(card){

                grid.appendChild(
                    card
                );

            }

        }
    );


    bloque.append(
        head,
        grid
    );


    contenedor.appendChild(
        bloque
    );


    /* -----------------------------------------------------
       REGRESAR A LA SECCIÓN
    ----------------------------------------------------- */

    const home =
        document.querySelector(
            '#catalogHome'
        );


    if(home){

        const seccion =
            document.querySelector(
                '#homeAllSection'
            );


        home.scrollTo({

            top:
                seccion?.offsetTop || 0,

            behavior:'smooth'

        });

    }

}


/* =========================================================
   BOTÓN TODOS
========================================================= */

function activarBotonTodos(){

    const nav =
        document.querySelector(
            '#homeCategoryNav'
        );


    if(!nav){

        return;

    }


    nav.querySelectorAll(
        '.home-cat'
    ).forEach(
        boton => {

            const texto =
                boton.textContent
                    .trim()
                    .toLowerCase();


            boton.classList.toggle(
                'active',
                texto === 'todos'
            );

        }
    );

}


/* =========================================================
   OCULTAR CABECERA GENERAL "TODOS"
========================================================= */

function ocultarCabeceraGeneral(){

    const seccion =
        document.querySelector(
            '#homeAllSection'
        );


    if(!seccion){

        return;

    }


    const cabecera =
        seccion.querySelector(
            ':scope > .home-rec-head'
        );


    if(cabecera){

        cabecera.style.display =
            'none';

    }

}


/* =========================================================
   CONFIGURAR BOTONES DE CATEGORÍAS
========================================================= */

function configurarCategorias(catalogo){

    const nav =
        document.querySelector(
            '#homeCategoryNav'
        );


    if(!nav){

        return;

    }


    nav.replaceChildren();
    const categorias = Array.isArray(catalogo?.categorias) ? catalogo.categorias : [];
    const opciones = [{ nombre: 'Todos', categoria: null }, ...categorias
        .filter(categoria => Array.isArray(categoria.productos) && categoria.productos.length)
        .map(categoria => ({ nombre: categoria.nombre || categoria.carpeta, categoria }))];

    opciones.forEach(({ nombre, categoria }, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = `home-cat${indice === 0 ? ' active' : ''}`;
        boton.dataset.categoria = categoria?.carpeta || categoria?.nombre || 'todos';

        if (categoria) {
            const producto = categoria.productos.find(item => obtenerImagenPrincipal(item));
            const imagen = producto && obtenerImagenPrincipal(producto);
            const ruta = imagen && obtenerRutaDiseño(categoria, imagen);
            if (ruta) {
                const thumb = document.createElement('img');
                thumb.className = 'home-cat-thumb';
                thumb.src = ruta;
                thumb.alt = '';
                thumb.loading = 'lazy';
                boton.append(thumb);
            }
        }

        const label = document.createElement('span');
        label.textContent = nombre;
        boton.append(label);
        boton.addEventListener('click', () => {
            nav.querySelectorAll('.home-cat').forEach(item => item.classList.toggle('active', item === boton));
            if (!categoria) renderizarTodasLasCategorias();
            else mostrarCategoria(categoria.nombre || categoria.carpeta);
        });
        nav.append(boton);
    });

}


/* =========================================================
   FUNCIÓN PÚBLICA
========================================================= */

export function renderizarColecciones(
    catalogo,
    configuracion
){

    catalogoActual =
        catalogo;

    configuracionActual =
        configuracion;


    ultimoFondoColeccion =
        null;


    ocultarCabeceraGeneral();


    configurarCategorias(catalogo);


    activarBotonTodos();


    renderizarTodasLasCategorias();


    console.log(
        '✓ Colecciones cargadas correctamente'
    );

}
