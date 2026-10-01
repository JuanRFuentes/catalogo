import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function limpiarDist() {
    if (fs.existsSync(DIST)) {
        fs.rmSync(DIST, {
            recursive: true,
            force: true
        });
    }

    fs.mkdirSync(DIST, {
        recursive: true
    });
}

function copiarArchivo(origen, destino) {
    fs.mkdirSync(path.dirname(destino), {
        recursive: true
    });

    fs.copyFileSync(origen, destino);
}

function copiarCarpeta(origen, destino) {
    if (!fs.existsSync(origen)) {
        console.log(`⚠ No existe: ${origen}`);
        return;
    }

    fs.cpSync(origen, destino, {
        recursive: true
    });
}

function construir() {
    console.log('Construyendo catálogo...');

    limpiarDist();

    // HTML
    copiarArchivo(
        path.join(SRC, 'index.template.html'),
        path.join(DIST, 'index.html')
    );

    // CSS
    copiarCarpeta(
        path.join(SRC, 'css'),
        path.join(DIST, 'css')
    );

    // JavaScript
    copiarCarpeta(
        path.join(SRC, 'js'),
        path.join(DIST, 'js')
    );

    // Datos
    copiarCarpeta(
        path.join(SRC, 'data'),
        path.join(DIST, 'data')
    );

    // Hero
    copiarCarpeta(
        path.join(ROOT, 'hero'),
        path.join(DIST, 'hero')
    );

    // Diseños
    copiarCarpeta(
        path.join(ROOT, 'diseños'),
        path.join(DIST, 'diseños')
    );

    console.log('✓ Build completado');
    console.log(`✓ Salida: ${DIST}`);
}

construir();
