import {
  obtenerColores,
  obtenerColor,
  obtenerColoresPorGenero,
  obtenerHexColor,
  colorSoportadoPorGenero
} from '../motor/colores.js';

async function probarColores() {
  console.log('--- PRUEBA COLORES ---');

  const todos = await obtenerColores();

  console.log('Total de colores:', todos.length);

  const fucsia = await obtenerColor('fucsia');

  console.log('Fucsia:', fucsia);

  const caballero = await obtenerColoresPorGenero('caballero');

  console.log(
    'Colores de caballero:',
    caballero.map(color => color.nombre)
  );

  const hex = await obtenerHexColor('fucsia');

  console.log('HEX fucsia:', hex);

  const soportado = await colorSoportadoPorGenero(
    'fucsia',
    'caballero'
  );

  console.log(
    '¿Fucsia soportado por caballero?:',
    soportado
  );
}

probarColores().catch(error => {
  console.error('Error probando colores:', error);
});