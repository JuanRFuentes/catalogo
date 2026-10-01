export async function crearHome(
    configuracion,
    catalogo,
    homeApp
) {

    if (!homeApp) {
        throw new Error(
            'No se encontró .home-app'
        );
    }

    /*
     * PRUEBA ESTÁTICA
     *
     * No usamos catálogo.
     * No usamos configuración.
     * No generamos componentes.
     * No hacemos cálculos.
     *
     * Solo colocamos el HTML original del HOME.
     */

    homeApp.innerHTML = `

        <div class="home-dots d1">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
        </div>

        <div class="home-dots d2">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span>
        </div>

        <div class="home-dots d3">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span>
        </div>

        <div class="home-dots d4">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span>
        </div>

        <div class="home-pill-decor home-pill-a"></div>

        <div class="home-pill-decor home-pill-b"></div>


        <header class="home-topbar">

            <img
                class="home-logo-image"
                src="logo.png"
                alt="Visión Creativa"
            >

        </header>


        <section class="home-hero">

            <div class="home-hero-copy">

                <div class="home-kicker">
                    N U E V O S &nbsp; L A N Z A M I E N T O S
                </div>

                <h1 class="home-headline">
                    ELEVA
                    <span class="blue">
                        TU ESTILO
                    </span>
                </h1>

                <div class="home-brush">
                    <span>
                        CADA DÍA
                    </span>
                </div>

                <div class="home-sub">
                    Explora lo último en<br>
                    moda y estilo de vida
                </div>

            </div>


            <div class="home-hero-art">

                <div class="home-hero-pink"></div>

                <img
                    src="hero/personaje.png"
                    alt="Modelo Visión Creativa"
                >

            </div>

        </section>


        <nav
            class="home-categories"
            id="homeCategoryNav"
            aria-label="Categorías"
        ></nav>


        <section
            class="home-recs"
            id="homeRecommendations"
        >

            <div class="home-rec-head">

                <div>

                    <h2 class="home-rec-title">

                        <span class="home-star">
                            ✦
                        </span>

                        Recomendaciones del mes

                    </h2>

                    <p class="home-rec-sub">
                        Una selección especial de diseños.
                    </p>

                </div>

            </div>


            <div
                class="home-grid home-recommendation-carousel"
                id="homeRecommendationGrid"
            ></div>

        </section>


        <section
            class="home-all-section"
            id="homeAllSection"
        >

            <div class="home-rec-head">

                <div>

                    <h2 class="home-rec-title">
                        Todos
                    </h2>

                    <p class="home-rec-sub">
                        Explora todos nuestros diseños.
                    </p>

                </div>

                <button
                    type="button"
                    class="home-see"
                    id="homeSeeAll"
                >
                    Ver todo
                </button>

            </div>


            <div
                class="home-grid home-all-grid"
                id="homeDesignGrid"
            ></div>

        </section>


        <nav
            class="home-bottom"
            aria-label="Navegación"
        >

            <button
                type="button"
                class="home-navitem active"
                id="homeNavInicio"
            >

                <div class="home-navicon">
                    ⌂
                </div>

                Inicio

            </button>


            <button
                type="button"
                class="home-navitem"
                id="homeNavCategorias"
            >

                <div class="home-navicon">
                    ⊞
                </div>

                Categorías

            </button>


            <button
                type="button"
                class="home-navitem"
                id="homeNavCarrito"
            >

                <div class="home-navicon">
                    🛒
                </div>

                Carrito

                <span
                    class="home-navbadge"
                    id="homeCartCount"
                ></span>

            </button>


            <button
                type="button"
                class="home-navitem"
                id="homeNavPerfil"
            >

                <div class="home-navicon">
                    ♙
                </div>

                Perfil

            </button>

        </nav>

    `;


    /*
     * Para esta prueba no hacemos absolutamente nada más.
     */

    if (window.lucide) {
        window.lucide.createIcons();
    }


    return homeApp;
}
