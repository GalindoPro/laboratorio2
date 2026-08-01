/**
 * ============================================================================
 * MÓDULO I18N - DICCIONARIO Y GESTIÓN DE TRADUCCIONES (TS STRICT)
 * ============================================================================
 */

export type Language = 'es' | 'en';

export interface TranslationDictionary {
    searchPlaceholder: string;
    clearSearchAria: string;
    favoritesBadge: string;
    favoritesTitle: string;
    langBtnTitle: string;
    filterAll: string;
    filterAction: string;
    filterSciFi: string;
    filterDrama: string;
    filterAnimation: string;
    filterFavorites: string;
    loadingText: string;
    emptyTitle: string;
    emptyText: string;
    inFavorites: string;
    notFavorite: string;
    directorLabel: string;
    ratingLabel: string;
    footerLab: string;
    footerArch: string;
    favBtnAdd: string;
    closeModalAria: string;
    simErrorsTitle: string;
    simAdFail: string;
    simReviewFail: string;
    adsTitle: string;
    reviewsTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
    es: {
        searchPlaceholder: "Buscar película por título...",
        clearSearchAria: "Limpiar búsqueda",
        favoritesBadge: "Favoritas",
        favoritesTitle: "Ver mis películas favoritas",
        langBtnTitle: "Cambiar idioma a Inglés",
        filterAll: "Todas",
        filterAction: "Acción",
        filterSciFi: "Ciencia Ficción",
        filterDrama: "Drama",
        filterAnimation: "Animación",
        filterFavorites: "❤️ Mis Favoritas",
        loadingText: "Orquestando servicios backend en paralelo (Promise.allSettled)...",
        emptyTitle: "No se encontraron películas",
        emptyText: "Intenta ajustar la búsqueda o seleccionar otro filtro de género.",
        inFavorites: "❤️ En Favoritas",
        notFavorite: "🤍 No Favorita",
        directorLabel: "Director:",
        ratingLabel: "/ 10",
        footerLab: "Laboratorio 3 • Desarrollo Web • UMG 2026",
        footerArch: "Arquitectura: TypeScript Strict • DTOs • Mappers • Entities • Promise.allSettled",
        favBtnAdd: "Agregar a favoritas",
        closeModalAria: "Cerrar modal",
        simErrorsTitle: "Simulación de Fallos API",
        simAdFail: "Simular error en Anuncios",
        simReviewFail: "Simular error en Reseñas",
        adsTitle: "📢 Promoción Destacada",
        reviewsTitle: "⭐ Reseñas Recientes de Usuarios"
    },
    en: {
        searchPlaceholder: "Search movie by title...",
        clearSearchAria: "Clear search",
        favoritesBadge: "Favorites",
        favoritesTitle: "View my favorite movies",
        langBtnTitle: "Switch language to Spanish",
        filterAll: "All",
        filterAction: "Action",
        filterSciFi: "Sci-Fi",
        filterDrama: "Drama",
        filterAnimation: "Animation",
        filterFavorites: "❤️ My Favorites",
        loadingText: "Orchestrating backend services in parallel (Promise.allSettled)...",
        emptyTitle: "No movies found",
        emptyText: "Try adjusting your search or selecting another genre filter.",
        inFavorites: "❤️ In Favorites",
        notFavorite: "🤍 Not Favorite",
        directorLabel: "Director:",
        ratingLabel: "/ 10",
        footerLab: "Laboratory 3 • Web Development • UMG 2026",
        footerArch: "Architecture: TypeScript Strict • DTOs • Mappers • Entities • Promise.allSettled",
        favBtnAdd: "Add to favorites",
        closeModalAria: "Close modal",
        simErrorsTitle: "API Failure Simulation",
        simAdFail: "Simulate Ads error",
        simReviewFail: "Simulate Reviews error",
        adsTitle: "📢 Featured Promotion",
        reviewsTitle: "⭐ Recent User Reviews"
    }
};

/**
 * Obtiene el objeto de traducción para el idioma dado.
 */
export function getTranslation(lang: Language = 'es'): TranslationDictionary {
    return TRANSLATIONS[lang] || TRANSLATIONS.es;
}
