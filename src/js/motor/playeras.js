/*
==========================================================
MOTOR DE PLAYERAS
==========================================================

Este módulo controla solamente la representación
visual de la playera.

IMPORTANTE:

- No analiza diseños.
- No decide si un estampado "merece" color.
- No usa porcentajeClaro.
- No usa aptoPlayeraColor.
- No depende de cobertura espacial.

La decisión futura:

    presentacion.playeraColor

será realizada por el Panel Admin.

Mientras tanto, el catálogo utiliza las reglas
visuales del tema.

==========================================================
*/


const REGLAS_DEFAULT = {

  playeras: {

    normal: [
      'blanco'
    ],

    estampadoClaro: [
      'rosa',
      'azul'
    ]

  }

};


/*
==========================================================
ARCHIVOS DE PLAYERA
==========================================================
*/

const ARCHIVOS_PLAYERA = {

  frente:
    './hero/playeras/playera-frente.png',

  espalda:
    './hero/playeras/playera-espalda.png'

};


/*
==========================================================
NOTA

Las rutas se resuelven desde la raíz publicada del sitio. Usa ./hero
para que también funcionen cuando GitHub Pages publique el repositorio
bajo una ruta como /catalogo/.
==========================================================
*/


const ARCHIVOS_PLAYERA_REAL = {

  frente:
    './hero/playeras/playera-frente.png',

  espalda:
    './hero/playeras/playera-espalda.png'

};


/*
==========================================================
OBTENER REGLAS DEL TEMA
==========================================================
*/

function obtenerReglasTema(
  configuracion
) {

  const nombreTema =
    configuracion?.home?.tema ||
    'default';


  const temas =
    configuracion?.temas ||
    {};


  return (
    temas[nombreTema] ||
    REGLAS_DEFAULT
  );

}


/*
==========================================================
COLOR COMPATIBLE CON EL FONDO
==========================================================
*/

function colorEsCompatible(
  colorPlayera,
  fondoTarjeta
) {

  const playera =
    String(
      colorPlayera || ''
    )
    .trim()
    .toLowerCase();


  const fondo =
    String(
      fondoTarjeta || ''
    )
    .trim()
    .toLowerCase();


  if (!fondo) {

    return true;

  }


  return playera !== fondo;

}


/*
==========================================================
OBTENER COLOR DE PLAYERA
==========================================================
*/

function obtenerColorPlayeraTema({

  configuracion,

  estampadoClaro = false,

  fondoTarjeta = ''

} = {}) {

  const reglas =
    obtenerReglasTema(
      configuracion
    );


  const grupo =
    estampadoClaro

      ? reglas?.playeras?.estampadoClaro

      : reglas?.playeras?.normal;


  const porFondo =
    reglas?.playeras?.porFondo?.[
      String(fondoTarjeta || '').trim().toLowerCase()
    ];

  const candidatos =
    Array.isArray(porFondo) && porFondo.length

      ? porFondo

      : Array.isArray(grupo) &&
    grupo.length

      ? grupo

      : REGLAS_DEFAULT
          .playeras
          .normal;


  const color =
    candidatos.find(
      candidato =>
        colorEsCompatible(
          candidato,
          fondoTarjeta
        )
    ) ||
    candidatos[0];


  return String(
    color || ''
  )
    .trim()
    .toLowerCase();

}


/*
==========================================================
CONFIGURACIÓN DE PLAYERA
==========================================================

Por ahora:

    playeraColor = false
        ↓
    playera normal

    playeraColor = true
        ↓
    color definido por el tema

El Panel Admin futuro podrá enviar:

    presentacion: {
        playeraColor: true
    }

==========================================================
*/

export function obtenerConfiguracionPlayera({

  configuracion,

  estampadoClaro = false,

  fondoTarjeta = '',

  vista = 'front',

  presentacion = null

} = {}) {


  const vistaNormalizada =
    vista === 'back'
      ? 'back'
      : 'front';


  const archivo =
    vistaNormalizada === 'back'

      ? ARCHIVOS_PLAYERA_REAL
          .espalda

      : ARCHIVOS_PLAYERA_REAL
          .frente;


  /*
  --------------------------------------------------------
  DECISIÓN FUTURA DEL PANEL ADMIN
  --------------------------------------------------------
  */

  const playeraColor =
    presentacion?.playeraColor === true;


  /*
  --------------------------------------------------------
  PLAYERA NORMAL
  --------------------------------------------------------
  */

  if (!playeraColor) {

    return {

      color: 'blanco',

      archivo,

      vista:
        vistaNormalizada

    };

  }


  /*
  --------------------------------------------------------
  PLAYERA DE COLOR
  --------------------------------------------------------

  Solamente aquí interviene el tema.

  El diseño NO se modifica.
  --------------------------------------------------------
  */

  const color =
    obtenerColorPlayeraTema({

      configuracion,

      estampadoClaro,

      fondoTarjeta

    });


  return {

    color,

    archivo,

    vista:
      vistaNormalizada

  };

}
