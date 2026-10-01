const RUTA_COLORES = './data/colores.js';

let colores = null;


/**
 * Carga el catálogo universal de colores.
 *
 * La carga se hace una sola vez y después
 * se reutiliza en memoria.
 */
export async function cargarColores() {
  if (colores) {
    return colores;
  }

  const respuesta = await fetch(RUTA_COLORES);

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo cargar colores.json (${respuesta.status})`
    );
  }

  const datos = await respuesta.json();

  colores = Array.isArray(datos?.colores)
    ? datos.colores
    : [];

  return colores;
}


/**
 * Devuelve todos los colores registrados.
 */
export async function obtenerColores() {
  return cargarColores();
}


/**
 * Busca un color por su ID.
 *
 * Ejemplo:
 * obtenerColor('fucsia')
 */
export async function obtenerColor(id) {
  const lista = await cargarColores();

  const colorBuscado =
    String(id || '')
      .trim()
      .toLowerCase();

  return (
    lista.find(
      color =>
        String(color?.id || '')
          .trim()
          .toLowerCase() === colorBuscado
    ) || null
  );
}


/**
 * Devuelve los colores soportados
 * por un género.
 *
 * Ejemplo:
 * obtenerColoresPorGenero('dama')
 */
export async function obtenerColoresPorGenero(genero) {
  const lista = await cargarColores();

  const generoBuscado =
    String(genero || '')
      .trim()
      .toLowerCase();

  return lista.filter(color =>
    Array.isArray(color?.generos) &&
    color.generos.some(
      item =>
        String(item || '')
          .trim()
          .toLowerCase() === generoBuscado
    )
  );
}


/**
 * Devuelve el HEX de un color.
 *
 * Ejemplo:
 * obtenerHexColor('fucsia')
 *
 * Resultado:
 * '#B0197A'
 */
export async function obtenerHexColor(id) {
  const color = await obtenerColor(id);

  return color?.hex || null;
}


/**
 * Comprueba si un género soporta un color.
 *
 * Ejemplo:
 * colorSoportadoPorGenero('fucsia', 'dama')
 */
export async function colorSoportadoPorGenero(
  colorId,
  genero
) {
  const color = await obtenerColor(colorId);

  if (!color) {
    return false;
  }

  const generoBuscado =
    String(genero || '')
      .trim()
      .toLowerCase();

  return (
    Array.isArray(color.generos) &&
    color.generos.some(
      item =>
        String(item || '')
          .trim()
          .toLowerCase() === generoBuscado
    )
  );
}
