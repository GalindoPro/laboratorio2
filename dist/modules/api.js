/**
 * ============================================================================
 * MÓDULO API - ORQUESTACIÓN CONCURRENTE RESILIENTE CON TMDB REAL (TS STRICT)
 * ----------------------------------------------------------------------------
 * Consume de forma paralela la API real de TMDB (The Movie Database) para
 * el catálogo de películas y mantiene microservicios de Reseñas y Anuncios.
 * Devuelve DTOs crudos para ser procesados posteriormente por los Mappers.
 * ============================================================================
 */
// Clave de API de TMDB provista
const TMDB_API_KEY = 'b4f58365d784a4e9883e58dc4cfc55f4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
// Mapeo de ID de géneros TMDB a géneros clave de la app
const GENRE_MAP = {
    28: { es: "Acción", en: "Action", key: "Acción" },
    12: { es: "Aventura", en: "Adventure", key: "Acción" },
    16: { es: "Animación", en: "Animation", key: "Animación" },
    35: { es: "Comedia", en: "Comedy", key: "Drama" },
    80: { es: "Crimen", en: "Crime", key: "Drama" },
    99: { es: "Documental", en: "Documentary", key: "Drama" },
    18: { es: "Drama", en: "Drama", key: "Drama" },
    10751: { es: "Familia", en: "Family", key: "Animación" },
    14: { es: "Fantasía", en: "Fantasy", key: "Ciencia Ficción" },
    36: { es: "Historia", en: "History", key: "Drama" },
    27: { es: "Terror", en: "Horror", key: "Drama" },
    10402: { es: "Música", en: "Music", key: "Drama" },
    9648: { es: "Misterio", en: "Mystery", key: "Drama" },
    10749: { es: "Romance", en: "Romance", key: "Drama" },
    878: { es: "Ciencia Ficción", en: "Sci-Fi", key: "Ciencia Ficción" },
    10770: { es: "Película de TV", en: "TV Movie", key: "Drama" },
    53: { es: "Suspenso", en: "Thriller", key: "Acción" },
    10752: { es: "Bélica", en: "War", key: "Acción" },
    37: { es: "Oeste", en: "Western", key: "Acción" }
};
// Datos MOCK de Respaldo por si falla la conexión a TMDB (Resiliencia)
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
    }
];
/**
 * Servicio 1 (Principal): Consulta la API real de TMDB (Popular Movies).
 * Realiza peticiones concurrentes bilingües (español e inglés) y combina las respuestas en MovieDTO[].
 */
export async function fetchMoviesAPI() {
    try {
        console.log("🌐 [API 1 - TMDB] Solicitando películas populares en tiempo real a TMDB...");
        const urlEs = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-MX&page=1`;
        const urlEn = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        const [resEs, resEn] = await Promise.all([
            fetch(urlEs),
            fetch(urlEn)
        ]);
        if (!resEs.ok || !resEn.ok) {
            throw new Error(`Error en la API de TMDB (Status: ${resEs.status})`);
        }
        const dataEs = await resEs.json();
        const dataEn = await resEn.json();
        const moviesEnMap = new Map();
        dataEn.results.forEach(m => moviesEnMap.set(m.id, m));
        const moviesDTO = dataEs.results.map(movieEs => {
            const movieEn = moviesEnMap.get(movieEs.id);
            const primaryGenreId = movieEs.genre_ids && movieEs.genre_ids.length > 0 ? movieEs.genre_ids[0] : 878;
            const genreInfo = GENRE_MAP[primaryGenreId] || { es: "General", en: "General", key: "all" };
            const releaseYear = movieEs.release_date ? parseInt(movieEs.release_date.split('-')[0], 10) : new Date().getFullYear();
            const posterUrl = movieEs.poster_path ? `${TMDB_IMAGE_BASE}${movieEs.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            return {
                id: movieEs.id,
                title_es: movieEs.title || 'Sin Título',
                title_en: movieEn?.title || movieEs.title || 'Untitled',
                genre_es: genreInfo.es,
                genre_en: genreInfo.en,
                genreKey: genreInfo.key,
                year: isNaN(releaseYear) ? 2026 : releaseYear,
                rating: movieEs.vote_average ? Number(movieEs.vote_average.toFixed(1)) : 0.0,
                director: "TMDB Popular",
                poster: posterUrl,
                synopsis_es: movieEs.overview || 'Sin sinopsis disponible en español.',
                synopsis_en: movieEn?.overview || movieEs.overview || 'No synopsis available.'
            };
        });
        console.log(`✅ [API 1 - TMDB] Se cargaron exitosamente ${moviesDTO.length} películas en tiempo real desde TMDB.`);
        return moviesDTO;
    }
    catch (error) {
        console.warn("⚠️ [API 1 - TMDB] Fallo la conexión con TMDB. Usando datos Mock de respaldo:", error);
        return MOCK_MOVIES_DATA;
    }
}
/**
 * Servicio 2 (Secundario): Simula la consulta del microservicio de Reseñas de Usuarios.
 */
export function fetchReviewsAPI(simulateError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [API 2 - Reviews] 503 Service Unavailable (Simulated Error).");
                reject(new Error("503 Service Unavailable: Microservicio de Reseñas fuera de línea."));
            }
            else {
                console.log("✅ [API 2 - Reviews] Service resolved user reviews DTOs.");
                resolve([
                    {
                        id: 1,
                        movie_id: 550,
                        user: "Carlos R.",
                        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
                        rating: 5,
                        comment_es: "¡Las películas reales cargadas desde la API de TMDB se ven increíbles!",
                        comment_en: "Real movies fetched from TMDB API look amazing!",
                        date: "2026-08-01"
                    },
                    {
                        id: 2,
                        movie_id: 278,
                        user: "Sofia M.",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                        rating: 5,
                        comment_es: "La integración con TypeScript y TMDB es súper fluida.",
                        comment_en: "TypeScript and TMDB integration is super smooth.",
                        date: "2026-08-01"
                    }
                ]);
            }
        }, 1000);
    });
}
/**
 * Servicio 3 (Secundario): Simula la consulta del microservicio de Anuncios Promocionales.
 */
export function fetchAdsAPI(simulateError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [API 3 - Ads] 500 Internal Server Error (Simulated Error).");
                reject(new Error("500 Internal Server Error: Error en el servidor de anuncios promocionales."));
            }
            else {
                console.log("✅ [API 3 - Ads] Service resolved promotional ad DTO.");
                resolve({
                    id: 101,
                    title_es: "🍿 Cartelera TMDB en Vivo en CineVerse",
                    title_en: "🍿 Live TMDB Catalog on CineVerse",
                    image_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
                    click_url: "#",
                    badge_es: "EN VIVO - TMDB API",
                    badge_en: "LIVE - TMDB API",
                    description_es: "¡Películas sincronizadas directamente desde The Movie Database!",
                    description_en: "Movies synced directly from The Movie Database!"
                });
            }
        }, 1200);
    });
}
/**
 * ORQUESTRACIÓN CONCURRENTE CON Promise.allSettled
 * Consume los 3 servicios backend en paralelo (TMDB real + microservicios).
 */
export async function fetchAllServices(simulateReviewFail = false, simulateAdFail = false) {
    console.log("🚀 [Orchestrator] Disparando Promise.allSettled para 3 servicios backend (TMDB + Microservicios)...");
    const [moviesResult, reviewsResult, adsResult] = await Promise.allSettled([
        fetchMoviesAPI(),
        fetchReviewsAPI(simulateReviewFail),
        fetchAdsAPI(simulateAdFail)
    ]);
    console.log("📊 [Orchestrator] Promise.allSettled ha finalizado:", {
        movies: moviesResult.status,
        reviews: reviewsResult.status,
        ads: adsResult.status
    });
    return {
        moviesResult,
        reviewsResult,
        adsResult
    };
}
