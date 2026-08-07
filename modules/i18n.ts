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
    typeAll: string;
    typeMovies: string;
    typeSeries: string;
    typeDocumentaries: string;
    badgeMovie: string;
    badgeSeries: string;
    badgeDocumentary: string;
    loadingText: string;
    emptyTitle: string;
    emptyText: string;
    inFavorites: string;
    notFavorite: string;
    directorLabel: string;
    seasonsLabel: string;
    episodesLabel: string;
    topicLabel: string;
    narratorLabel: string;
    ratingLabel: string;
    footerLab: string;
    footerArch: string;
    favBtnAdd: string;
    closeModalAria: string;
    simErrorsTitle: string;
    simAdNormal: string;
    simAdError: string;
    simReviewNormal: string;
    simReviewError: string;
    adsTitle: string;
    reviewsTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
    es: {
        searchPlaceholder: "Buscar por título...",
        clearSearchAria: "Limpiar búsqueda",
        favoritesBadge: "Favoritos",
        favoritesTitle: "Ver mis contenidos favoritos",
        langBtnTitle: "Cambiar idioma a Inglés / Switch to English",
        filterAll: "Todas las Categorías",
        filterAction: "Acción",
        filterSciFi: "Ciencia Ficción",
        filterDrama: "Drama",
        filterAnimation: "Animación",
        filterFavorites: "❤️ Mis Favoritos",
        typeAll: "🎬 Todos los Medios",
        typeMovies: "🎥 Películas",
        typeSeries: "📺 Series",
        typeDocumentaries: "🌿 Documentales",
        badgeMovie: "🎥 PELÍCULA",
        badgeSeries: "📺 SERIE",
        badgeDocumentary: "🌿 DOCUMENTAL",
        loadingText: "Orquestando servicios backend en paralelo (Promise.allSettled)...",
        emptyTitle: "No se encontraron contenidos",
        emptyText: "Intenta ajustar la búsqueda o seleccionar otro filtro de tipo o categoría.",
        inFavorites: "❤️ En Favoritos",
        notFavorite: "🤍 No Favorito",
        directorLabel: "Director:",
        seasonsLabel: "Temporadas:",
        episodesLabel: "Episodios:",
        topicLabel: "Tema principal:",
        narratorLabel: "Narrador:",
        ratingLabel: "/ 10",
        footerLab: "Laboratorio 4 • Desarrollo Web • UMG 2026",
        footerArch: "Arquitectura: Generic Repository Pattern • TypeScript Utility Types • Strict tsc",
        favBtnAdd: "Agregar a favoritos",
        closeModalAria: "Cerrar modal",
        simErrorsTitle: "🧪 Simular Fallo API (Promise.allSettled):",
        simAdNormal: "🟢 Anuncios: Normal",
        simAdError: "❌ Anuncios: ERROR SIMULADO",
        simReviewNormal: "🟢 Reseñas: Normal",
        simReviewError: "❌ Reseñas: ERROR SIMULADO",
        adsTitle: "📢 Promoción Destacada",
        reviewsTitle: "⭐ Reseñas Recientes de Usuarios"
    },
    en: {
        searchPlaceholder: "Search by title...",
        clearSearchAria: "Clear search",
        favoritesBadge: "Favorites",
        favoritesTitle: "View my favorite content",
        langBtnTitle: "Cambiar idioma a Español / Switch to Spanish",
        filterAll: "All Categories",
        filterAction: "Action",
        filterSciFi: "Sci-Fi",
        filterDrama: "Drama",
        filterAnimation: "Animation",
        filterFavorites: "❤️ My Favorites",
        typeAll: "🎬 All Media",
        typeMovies: "🎥 Movies",
        typeSeries: "📺 TV Series",
        typeDocumentaries: "🌿 Documentaries",
        badgeMovie: "🎥 MOVIE",
        badgeSeries: "📺 SERIES",
        badgeDocumentary: "🌿 DOCUMENTARY",
        loadingText: "Orchestrating backend services in parallel (Promise.allSettled)...",
        emptyTitle: "No content found",
        emptyText: "Try adjusting your search or selecting another type or category filter.",
        inFavorites: "❤️ In Favorites",
        notFavorite: "🤍 Not Favorite",
        directorLabel: "Director:",
        seasonsLabel: "Seasons:",
        episodesLabel: "Episodes:",
        topicLabel: "Main Topic:",
        narratorLabel: "Narrator:",
        ratingLabel: "/ 10",
        footerLab: "Laboratory 4 • Web Development • UMG 2026",
        footerArch: "Architecture: Generic Repository Pattern • TypeScript Utility Types • Strict tsc",
        favBtnAdd: "Add to favorites",
        closeModalAria: "Close modal",
        simErrorsTitle: "🧪 Simulate API Failures (Promise.allSettled):",
        simAdNormal: "🟢 Ads: Normal",
        simAdError: "❌ Ads: SIMULATED ERROR",
        simReviewNormal: "🟢 Reviews: Normal",
        simReviewError: "❌ Reviews: SIMULATED ERROR",
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
