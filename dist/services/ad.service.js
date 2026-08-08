/**
 * Servicio de Anuncios - Microservicio promocional
 */
export function fetchAdsService(simulateError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [AdService] 500 Internal Server Error (Simulado).");
                reject(new Error("500 Internal Server Error: Servidor de anuncios fuera de línea."));
            }
            else {
                console.log("✅ [AdService] Anuncio promocional cargado.");
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
