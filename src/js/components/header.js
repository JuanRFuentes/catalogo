export function crearHeader() {

    const configuracion = window.configuracion || {};
    const tema = configuracion?.home?.tema || 'default';
    const logo = configuracion?.temas?.[tema]?.logo || configuracion?.marca?.logo || 'hero/logo.png';
    const rutaLogo = `./${String(logo).replace(/^\.\//, '')}`;

    const header = document.createElement('header');

    header.className = 'home-topbar';

    header.innerHTML = `
        <img
            class="home-logo-image"
            src="${rutaLogo}"
            alt="Visión Creativa"
        >

        <div class="home-header-actions">

            <button
                type="button"
                class="home-header-button"
                aria-label="Buscar"
            >
                <span class="home-header-icon">?</span>
            </button>

            <button
                type="button"
                class="home-header-button header-cart-button"
                data-cart-trigger
                aria-label="Carrito"
            >
                <svg
                    class="home-header-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M3 4H5L7.2 14.2C7.4 15.2 8.3 16 9.3 16H17.5C18.4 16 19.2 15.4 19.5 14.5L21 8H6"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <circle cx="10" cy="20" r="1.2" fill="currentColor" />
                    <circle cx="18" cy="20" r="1.2" fill="currentColor" />
                </svg>
                <span class="header-cart-badge" aria-live="polite" hidden>0</span>
            </button>

        </div>
    `;

    return header;
}
