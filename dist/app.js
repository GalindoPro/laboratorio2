/**
 * ============================================================================
 * CINEVERSE - PUNTO DE ENTRADA PRINCIPAL (TS STRICT + CAPAS DTO/MAPPER/ENTITY)
 * ----------------------------------------------------------------------------
 * 1. Orquestación Concurrente Resiliente (Promise.allSettled)
 * 2. Mapeadores Puros que convierten DTOs crudos en Entidades saneadas
 * 3. Sistema de Caché Asíncrono Encapsulado mediante Clausuras (Closure Cache)
 * 4. Tipado Estricto con TypeScript (strict, noImplicitAny, noEmitOnError)
 * ============================================================================
 */
import { createMovieStore } from './modules/store.js';
import { fetchAllServices } from './modules/api.js';
import { mapMovieDTOArrayToEntities } from './mappers/movie.mapper.js';
import { mapReviewDTOArrayToEntities } from './mappers/review.mapper.js';
import { mapAdDTOToEntity } from './mappers/ad.mapper.js';
import { galleryContainer, statusContainer, filterBar, searchInput, clearSearchBtn, movieModal, closeModalBtn, langToggleBtn, updateLanguageUI, renderGallery, updateFavoritesBadge, openMovieDetailsModal, renderAdsBanner, renderReviewsWidget } from './modules/ui.js';
export const store = createMovieStore();
let simulateAdFail = false;
let simulateReviewFail = false;
let lastPayload = null;
/**
 * Función principal de inicio de la aplicación.
 * Orquesta la llamada concurrente a los 3 servicios backend y ejecuta el flujo DTO -> Mapper -> Entity.
 */
export async function initApp() {
    console.log("🏁 [InitApp] Inicializando CineVerse con TypeScript Estricto y Arquitectura por Capas...");
    if (statusContainer) {
        statusContainer.hidden = false;
        statusContainer.style.display = 'flex';
    }
    try {
        const rawResults = await fetchAllServices(simulateReviewFail, simulateAdFail);
        const currentLang = store.getLanguage();
        // --- APLICACIÓN DEL PATRÓN DTO -> MAPPER -> ENTITY ---
        // 1. Películas
        const moviesDTO = rawResults.moviesResult.status === 'fulfilled' ? rawResults.moviesResult.value : [];
        const moviesEntities = mapMovieDTOArrayToEntities(moviesDTO, currentLang);
        // 2. Reseñas
        let reviewsEntities = null;
        let reviewsError = null;
        if (rawResults.reviewsResult.status === 'fulfilled') {
            reviewsEntities = mapReviewDTOArrayToEntities(rawResults.reviewsResult.value, currentLang);
        }
        else {
            reviewsError = rawResults.reviewsResult.reason?.message || "Error al cargar reseñas";
        }
        // 3. Anuncios / Publicidad
        let adEntity = null;
        let adsError = null;
        if (rawResults.adsResult.status === 'fulfilled') {
            adEntity = mapAdDTOToEntity(rawResults.adsResult.value, currentLang);
        }
        else {
            adsError = rawResults.adsResult.reason?.message || "Error al cargar anuncios";
        }
        lastPayload = {
            movies: moviesEntities,
            reviews: reviewsEntities,
            reviewsError,
            ad: adEntity,
            adsError
        };
        // Almacenar Entidades saneadas en el Store
        store.setMovies(moviesEntities);
        if (statusContainer) {
            statusContainer.hidden = true;
            statusContainer.style.display = 'none';
        }
        // Actualización de la Interfaz Gráfica
        updateLanguageUI(store);
        renderGallery(store.getFilteredMovies(), store);
        updateFavoritesBadge(store);
        renderAdsBanner(adEntity, adsError, store);
        renderReviewsWidget(reviewsEntities, reviewsError, store);
    }
    catch (error) {
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
    galleryContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (!target)
            return;
        // Botón de Favorito
        const favButton = target.closest('[data-action="favorite"]');
        if (favButton) {
            e.stopPropagation();
            const movieId = Number(favButton.dataset.id);
            const isNowFav = store.toggleFavorite(movieId);
            if (isNowFav) {
                favButton.classList.add('is-active');
                const favIcon = favButton.querySelector('.fav-icon');
                if (favIcon)
                    favIcon.textContent = '❤️';
            }
            else {
                favButton.classList.remove('is-active');
                const favIcon = favButton.querySelector('.fav-icon');
                if (favIcon)
                    favIcon.textContent = '🤍';
            }
            updateFavoritesBadge(store);
            renderGallery(store.getFilteredMovies(), store);
            return;
        }
        // Clic en Tarjeta para ver Detalles (Modal)
        const cardArticle = target.closest('[data-action="detail"]');
        if (cardArticle) {
            const movieId = Number(cardArticle.dataset.id);
            openMovieDetailsModal(movieId, store);
        }
    });
}
if (filterBar) {
    const bar = filterBar;
    bar.addEventListener('click', (e) => {
        const target = e.target;
        if (!target)
            return;
        const filterBtn = target.closest('.filter-btn');
        if (!filterBtn)
            return;
        const allButtons = bar.querySelectorAll('.filter-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');
        const selectedGenre = filterBtn.dataset.genre || 'all';
        store.setGenre(selectedGenre);
        const filteredMovies = store.getFilteredMovies();
        renderGallery(filteredMovies, store);
    });
}
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const inputEl = e.target;
        const value = inputEl.value;
        if (clearSearchBtn)
            clearSearchBtn.hidden = value.trim() === '';
        store.setSearchQuery(value);
        renderGallery(store.getFilteredMovies(), store);
    });
}
if (clearSearchBtn) {
    const clearBtn = clearSearchBtn;
    clearBtn.addEventListener('click', () => {
        if (searchInput)
            searchInput.value = '';
        clearBtn.hidden = true;
        store.setSearchQuery('');
        renderGallery(store.getFilteredMovies(), store);
    });
}
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        store.setLanguage();
        updateLanguageUI(store);
        renderGallery(store.getFilteredMovies(), store);
        if (lastPayload) {
            renderAdsBanner(lastPayload.ad, lastPayload.adsError, store);
            renderReviewsWidget(lastPayload.reviews, lastPayload.reviewsError, store);
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
    modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            modal.close();
        }
    });
}
const toggleAdErrBtn = document.getElementById('toggle-ad-err');
const toggleReviewErrBtn = document.getElementById('toggle-review-err');
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
}
else {
    initApp();
}
