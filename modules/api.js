/**
 * ============================================================================
 * MÓDULO API - ORQUESTACIÓN CONCURRENTE RESILIENTE (ESM)
 * ----------------------------------------------------------------------------
 * Requerimiento Técnico 1: Utiliza Promise.allSettled para consumir de forma
 * paralela 3 servicios backend ficticios independientes (Catálogo, Reseñas y Anuncios).
 * Garantiza resiliencia frente a fallos aleatorios o simulados en endpoints secundarios.
 * ============================================================================
 */

// Datos MOCK del Catálogo de Películas (Servicio Principal 1)
export const MOCK_MOVIES_DATA = [
    {
        id: 1,
        title_es: "Inception (Origen)",
        title_en: "Inception",
        genre_es: "Ciencia Ficción",
        genre_en: "Sci-Fi",
        genreKey: "Ciencia Ficción",
        year: 2010,
        rating: 8.8,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de intercambio de sueños recibe la tarea inversa de plantar una idea en la mente de un CEO.",
        synopsis_en: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    {
        id: 2,
        title_es: "The Dark Knight (El Caballero de la Noche)",
        title_en: "The Dark Knight",
        genre_es: "Acción",
        genre_en: "Action",
        genreKey: "Acción",
        year: 2008,
        rating: 9.0,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Cuando la amenaza conocida como el Joker causa el caos en la ciudad de Gotham, Batman debe aceptar una de las mayores pruebas para luchar contra la injusticia.",
        synopsis_en: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests to fight injustice."
    },
    {
        id: 3,
        title_es: "Spider-Man: Across the Spider-Verse",
        title_en: "Spider-Man: Across the Spider-Verse",
        genre_es: "Animación",
        genre_en: "Animation",
        genreKey: "Animación",
        year: 2023,
        rating: 8.7,
        director: "Joaquim Dos Santos, Kemp Powers",
        poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Miles Morales catapultado a través del Multiverso une fuerzas con Gwen Stacy y un nuevo equipo de Spider-Personas para enfrentarse a un villano más poderoso que nada.",
        synopsis_en: "Miles Morales catapulted across the Multiverse joins forces with Gwen Stacy and a new team of Spider-People to face a villain more powerful than anything."
    },
    {
        id: 4,
        title_es: "Interstellar (Interestelar)",
        title_en: "Interstellar",
        genre_es: "Ciencia Ficción",
        genre_en: "Sci-Fi",
        genreKey: "Ciencia Ficción",
        year: 2014,
        rating: 8.7,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por garantizar la supervivencia de la humanidad.",
        synopsis_en: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
        id: 5,
        title_es: "Pulp Fiction (Tiempos Violentos)",
        title_en: "Pulp Fiction",
        genre_es: "Drama",
        genre_en: "Drama",
        genreKey: "Drama",
        year: 1994,
        rating: 8.9,
        director: "Quentin Tarantino",
        poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Las vidas de dos matones a sueldo, un boxeador, la esposa de un gángster y un par de bandidos se entrelazan en cuatro historias de violencia y redención.",
        synopsis_en: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
    },
    {
        id: 6,
        title_es: "The Matrix (Matrix)",
        title_en: "The Matrix",
        genre_es: "Acción",
        genre_en: "Action",
        genreKey: "Acción",
        year: 1999,
        rating: 8.7,
        director: "Lana y Lilly Wachowski",
        poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Un hacker descubre a través de misteriosos rebeldes la verdadera naturaleza de su realidad y su papel en la guerra contra sus controladores.",
        synopsis_en: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    },
    {
        id: 7,
        title_es: "Spirited Away (El Viaje de Chihiro)",
        title_en: "Spirited Away",
        genre_es: "Animación",
        genre_en: "Animation",
        genreKey: "Animación",
        year: 2001,
        rating: 8.6,
        director: "Hayao Miyazaki",
        poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "Durante el traslado de su familia a los suburbios, una niña de 10 años vaga por un mundo gobernado por dioses, brujas y espíritus donde los humanos se transforman en bestias.",
        synopsis_en: "During her family's move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches, and spirits where humans are changed into beasts."
    },
    {
        id: 8,
        title_es: "The Shawshank Redemption (Sueño de Fuga)",
        title_en: "The Shawshank Redemption",
        genre_es: "Drama",
        genre_en: "Drama",
        genreKey: "Drama",
        year: 1994,
        rating: 9.3,
        director: "Frank Darabont",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        synopsis_es: "A lo largo de varios años, dos convictos forman una amistad, buscando consuelo y redención a través de la compasión humana.",
        synopsis_en: "Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion."
    }
];

/**
 * Servicio 1 (Principal): Simula la consulta del catálogo de películas.
 * @returns {Promise<Array>}
 */
export function fetchMoviesAPI() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("✅ [API 1 - Movies] Service successfully resolved movie catalog.");
            resolve(MOCK_MOVIES_DATA);
        }, 800);
    });
}

/**
 * Servicio 2 (Secundario): Simula la consulta del microservicio de Reseñas de Usuarios.
 * @param {boolean} simulateError Si es true, el endpoint falla explícitamente.
 * @returns {Promise<Array>}
 */
export function fetchReviewsAPI(simulateError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [API 2 - Reviews] 503 Service Unavailable (Simulated Error).");
                reject(new Error("503 Service Unavailable: Microservicio de Reseñas fuera de línea."));
            } else {
                console.log("✅ [API 2 - Reviews] Service resolved user reviews.");
                resolve([
                    { user: "Carlos R.", comment_es: "¡Increíble selección de películas!", comment_en: "Awesome movie collection!", rating: 5 },
                    { user: "Sofia M.", comment_es: "La experiencia de la UI es súper fluida.", comment_en: "The UI experience is super smooth.", rating: 5 }
                ]);
            }
        }, 1000);
    });
}

/**
 * Servicio 3 (Secundario): Simula la consulta del microservicio de Anuncios Promocionales.
 * @param {boolean} simulateError Si es true, el endpoint falla explícitamente.
 * @returns {Promise<Object>}
 */
export function fetchAdsAPI(simulateError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [API 3 - Ads] 500 Internal Server Error (Simulated Error).");
                reject(new Error("500 Internal Server Error: Error en el servidor de anuncios promocionales."));
            } else {
                console.log("✅ [API 3 - Ads] Service resolved promotional banner data.");
                resolve({
                    title_es: "🍿 Maratón CineVerse Fin de Semana",
                    title_en: "🍿 CineVerse Weekend Binge Fest",
                    text_es: "¡Obtén 50% de descuento en la compra de entradas con tu tarjeta CineClub!",
                    text_en: "Get 50% off movie tickets with your CineClub card!",
                    code: "CINE50OFF"
                });
            }
        }, 1200);
    });
}

/**
 * ORQUESTRACIÓN CONCURRENTE CON Promise.allSettled
 * Consume los 3 servicios backend en paralelo y maneja los fallos con gracia sin bloquear la UI.
 * 
 * @param {boolean} simulateReviewFail 
 * @param {boolean} simulateAdFail 
 * @returns {Promise<Object>} Resultados validados de los tres servicios.
 */
export async function fetchAllServices(simulateReviewFail = false, simulateAdFail = false) {
    console.log("🚀 [Orchestrator] Disparando Promise.allSettled para 3 servicios backend en paralelo...");

    // Disparo concurrente de las 3 promesas en paralelo
    const results = await Promise.allSettled([
        fetchMoviesAPI(),
        fetchReviewsAPI(simulateReviewFail),
        fetchAdsAPI(simulateAdFail)
    ]);

    const [moviesResult, reviewsResult, adsResult] = results;

    // Inspección resiliente de cada resultado (fulfilled / rejected)
    const payload = {
        movies: moviesResult.status === 'fulfilled' ? moviesResult.value : [],
        reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value : null,
        reviewsError: reviewsResult.status === 'rejected' ? reviewsResult.reason.message : null,
        ads: adsResult.status === 'fulfilled' ? adsResult.value : null,
        adsError: adsResult.status === 'rejected' ? adsResult.reason.message : null
    };

    console.log("📊 [Orchestrator] Promise.allSettled ha finalizado:", {
        movies: moviesResult.status,
        reviews: reviewsResult.status,
        ads: adsResult.status
    });

    return payload;
}
