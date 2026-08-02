/**
 * ============================================================================
 * CINEVERSE - PUNTO DE ENTRADA PRINCIPAL (TS STRICT + CAPAS DTO/MAPPER/ENTITY)
 * ----------------------------------------------------------------------------
 * 1. Orquestación Concurrente Resiliente (Promise.allSettled)
 * 2. Mapeadores Puros que convierten DTOs crudos en Entidades saneadas
 * 3. Re-mapeo dinámico i18n al cambiar de idioma (Español / Inglés)
 * 4. Tipado Estricto con TypeScript (strict, noImplicitAny, noEmitOnError)
 * ============================================================================
 */

import { createMovieStore, MovieStore } from './modules/store.js';
import { fetchAllServices, RawPayloadResults } from './services/orchestrator.service.js';
import { mapMovieDTOArrayToEntities } from './mappers/movie.mapper.js';
import { mapReviewDTOArrayToEntities } from './mappers/review.mapper.js';
import { mapAdDTOToEntity } from './mappers/ad.mapper.js';
import { Movie } from './entities/movie.entity.js';
import { Review } from './entities/review.entity.js';
import { Ad } from './entities/ad.entity.js';
import {
    galleryContainer,
    statusContainer,
    filterBar,
    searchInput,
    clearSearchBtn,
    movieModal,
    closeModalBtn,
    langToggleBtn,
    updateLanguageUI,
    renderGallery,
    updateFavoritesBadge,
    openMovieDetailsModal,
    renderAdsBanner,
    renderReviewsWidget
} from './modules/ui.js';

export const store: MovieStore = createMovieStore();

let simulateAdFail = false;
let simulateReviewFail = false;

// Almacén local de los DTOs crudos devueltos por Promise.allSettled
let lastRawResults: RawPayloadResults | null = null;

/**
 * Transforma los DTOs crudos a Entidades según el idioma activo en el Store
 * y actualiza los componentes dinámicos de la interfaz.
 */
function applyPayloadForLanguage(rawResults: RawPayloadResults): void {
    const currentLang = store.getLanguage();

    // 1. Películas: DTO -> Mapper -> Entity (para el idioma activo)
    const moviesDTO = rawResults.moviesResult.status === 'fulfilled' ? rawResults.moviesResult.value : [];
    const moviesEntities: Movie[] = mapMovieDTOArrayToEntities(moviesDTO, currentLang);

    // 2. Reseñas: DTO -> Mapper -> Entity
    let reviewsEntities: Review[] | null = null;
    let reviewsError: string | null = null;
    if (rawResults.reviewsResult.status === 'fulfilled') {
        reviewsEntities = mapReviewDTOArrayToEntities(rawResults.reviewsResult.value, currentLang);
    } else {
        reviewsError = rawResults.reviewsResult.reason?.message || "Error al cargar reseñas";
    }

    // 3. Anuncios: DTO -> Mapper -> Entity
    let adEntity: Ad | null = null;
    let adsError: string | null = null;
    if (rawResults.adsResult.status === 'fulfilled') {
        adEntity = mapAdDTOToEntity(rawResults.adsResult.value, currentLang);
    } else {
        adsError = rawResults.adsResult.reason?.message || "Error al cargar anuncios";
    }

    // Actualizar Store centralizado con las Entidades formateadas para el idioma activo
    store.setMovies(moviesEntities);

    // Actualizar la Interfaz Gráfica
    updateLanguageUI(store);
    renderGallery(store.getFilteredMovies(), store);
    updateFavoritesBadge(store);

    renderAdsBanner(adEntity, adsError, store);
    renderReviewsWidget(reviewsEntities, reviewsError, store);
}

/**
 * Función principal de inicio de la aplicación.
 * Orquesta la llamada concurrente a los 3 servicios backend y ejecuta el flujo DTO -> Mapper -> Entity.
 */
export async function initApp(): Promise<void> {
    console.log("🏁 [InitApp] Inicializando CineVerse con TypeScript Estricto y Arquitectura por Capas...");

    if (statusContainer) {
        statusContainer.hidden = false;
        statusContainer.style.display = 'flex';
    }

    try {
        const rawResults: RawPayloadResults = await fetchAllServices(simulateReviewFail, simulateAdFail);
        lastRawResults = rawResults;

        if (statusContainer) {
            statusContainer.hidden = true;
            statusContainer.style.display = 'none';
        }

        applyPayloadForLanguage(rawResults);

    } catch (error) {
        console.error("❌ [Fatal Error] Fallo crítico al inicializar la app:", error);
        if (statusContainer) {
            statusContainer.innerHTML = `
                <p style="color: var(--accent-red); font-weight: 600;">⚠️ Error crítico al conectar con el servidor.</p>
            `;
        }
    }
}

/* ============================================================================
 * DELEGACIÓN DE EVENTOS Y LISTENERS CENTRALIZADOS
 * ============================================================================ */

if (galleryContainer) {
    galleryContainer.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Botón de Favorito
        const favButton = target.closest<HTMLButtonElement>('[data-action="favorite"]');
        if (favButton) {
            e.stopPropagation();
            const movieId = Number(favButton.dataset.id);
            const isNowFav = store.toggleFavorite(movieId);
            
            if (isNowFav) {
                favButton.classList.add('is-active');
                const favIcon = favButton.querySelector('.fav-icon');
                if (favIcon) favIcon.textContent = '❤️';
            } else {
                favButton.classList.remove('is-active');
                const favIcon = favButton.querySelector('.fav-icon');
                if (favIcon) favIcon.textContent = '🤍';
            }
            
            updateFavoritesBadge(store);
            renderGallery(store.getFilteredMovies(), store);
            return;
        }

        // Clic en Tarjeta para ver Detalles (Modal)
        const cardArticle = target.closest<HTMLElement>('[data-action="detail"]');
        if (cardArticle) {
            const movieId = Number(cardArticle.dataset.id);
            openMovieDetailsModal(movieId, store);
        }
    });
}

if (filterBar) {
    const bar = filterBar;
    bar.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const filterBtn = target.closest<HTMLButtonElement>('.filter-btn');
        if (!filterBtn) return;

        const allButtons = bar.querySelectorAll<HTMLButtonElement>('.filter-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');

        const selectedGenre = filterBtn.dataset.genre || 'all';
        store.setGenre(selectedGenre);
        
        const filteredMovies = store.getFilteredMovies();
        renderGallery(filteredMovies, store);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e: Event) => {
        const inputEl = e.target as HTMLInputElement;
        const value = inputEl.value;
        if (clearSearchBtn) clearSearchBtn.hidden = value.trim() === '';
        
        store.setSearchQuery(value);
        renderGallery(store.getFilteredMovies(), store);
    });
}

if (clearSearchBtn) {
    const clearBtn = clearSearchBtn;
    clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        clearBtn.hidden = true;
        store.setSearchQuery('');
        renderGallery(store.getFilteredMovies(), store);
    });
}

// Alternador de Idioma (Español <-> Inglés)
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        store.setLanguage(); // Cambia de 'es' a 'en' o viceversa
        if (lastRawResults) {
            applyPayloadForLanguage(lastRawResults); // Re-mapea todas las DTOs al nuevo idioma activo
        }
    });
}

if (closeModalBtn && movieModal) {
    const modal = movieModal;
    closeModalBtn.addEventListener('click', () => {
        modal.close();
    });
}

if (movieModal) {
    const modal = movieModal;
    modal.addEventListener('click', (e: MouseEvent) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            modal.close();
        }
    });
}

const toggleAdErrBtn = document.getElementById('toggle-ad-err') as HTMLButtonElement | null;
const toggleReviewErrBtn = document.getElementById('toggle-review-err') as HTMLButtonElement | null;

if (toggleAdErrBtn) {
    toggleAdErrBtn.addEventListener('click', () => {
        simulateAdFail = !simulateAdFail;
        toggleAdErrBtn.classList.toggle('active-err', simulateAdFail);
        toggleAdErrBtn.textContent = simulateAdFail ? "❌ Anuncios: ERROR SIMULADO" : "🟢 Anuncios: Normal";
        initApp();
    });
}

if (toggleReviewErrBtn) {
    toggleReviewErrBtn.addEventListener('click', () => {
        simulateReviewFail = !simulateReviewFail;
        toggleReviewErrBtn.classList.toggle('active-err', simulateReviewFail);
        toggleReviewErrBtn.textContent = simulateReviewFail ? "❌ Reseñas: ERROR SIMULADO" : "🟢 Reseñas: Normal";
        initApp();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
