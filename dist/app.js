/**
 * ============================================================================
 * CINEVERSE - PUNTO DE ENTRADA PRINCIPAL (TS STRICT + GENERIC REPOSITORY)
 * ----------------------------------------------------------------------------
 * 1. Orquestación Concurrente Resiliente (Promise.allSettled)
 * 2. Mappers Puros con TypeScript Utility Types (Partial<T>, Pick<T, K>, Omit<T, K>)
 * 3. Repositorio Genérico DataCatalogManager<T extends { id: string | number }>
 * 4. Tipado Estricto con TypeScript (strict, noImplicitAny, noEmitOnError)
 * ============================================================================
 */
import { createMediaStore } from './modules/store.js';
import { getTranslation } from './modules/i18n.js';
import { fetchAllServices } from './services/orchestrator.service.js';
import { mapMovieDTOArrayToEntities } from './mappers/movie.mapper.js';
import { mapSeriesDTOArrayToEntities } from './mappers/series.mapper.js';
import { mapDocumentaryDTOArrayToEntities } from './mappers/documentary.mapper.js';
import { mapReviewDTOArrayToEntities } from './mappers/review.mapper.js';
import { mapAdDTOToEntity } from './mappers/ad.mapper.js';
import { galleryContainer, statusContainer, favoritesCounterBtn, filterBar, mediaTypeBar, searchInput, clearSearchBtn, movieModal, closeModalBtn, langToggleBtn, updateLanguageUI, renderGallery, updateFavoritesBadge, openMediaDetailsModal, renderAdsBanner, renderReviewsWidget } from './modules/ui.js';
export const store = createMediaStore();
let simulateAdFail = false;
let simulateReviewFail = false;
// Almacén local de los DTOs crudos devueltos por Promise.allSettled
let lastRawResults = null;
/**
 * Transforma los DTOs crudos a Entidades según el idioma activo en el Store
 * y carga el Repositorio Genérico DataCatalogManager.
 */
function applyPayloadForLanguage(rawResults) {
    const currentLang = store.getLanguage();
    // 1. Películas: DTO -> Mapper (Partial<MovieDTO>) -> Movie Entity
    const moviesDTO = rawResults.moviesResult.status === 'fulfilled' ? rawResults.moviesResult.value : [];
    const moviesEntities = mapMovieDTOArrayToEntities(moviesDTO, currentLang);
    // 2. Series: DTO -> Mapper (Partial<SeriesDTO>) -> Series Entity
    const seriesDTO = rawResults.seriesResult.status === 'fulfilled' ? rawResults.seriesResult.value : [];
    const seriesEntities = mapSeriesDTOArrayToEntities(seriesDTO, currentLang);
    // 3. Documentales: DTO -> Mapper (Partial<DocumentaryDTO>) -> Documentary Entity
    const docsDTO = rawResults.documentariesResult.status === 'fulfilled' ? rawResults.documentariesResult.value : [];
    const docsEntities = mapDocumentaryDTOArrayToEntities(docsDTO, currentLang);
    // Combinar todas las entidades multimedia polimórficas (MediaItem)
    const allMediaItems = [...moviesEntities, ...seriesEntities, ...docsEntities];
    // Cargar en el DataCatalogManager<MediaItem> a través del Store
    store.setMediaItems(allMediaItems);
    // 4. Reseñas: DTO -> Mapper -> Entity
    let reviewsEntities = null;
    let reviewsError = null;
    if (rawResults.reviewsResult.status === 'fulfilled') {
        reviewsEntities = mapReviewDTOArrayToEntities(rawResults.reviewsResult.value, currentLang);
    }
    else {
        reviewsError = rawResults.reviewsResult.reason?.message || "Error al cargar reseñas";
    }
    // 5. Anuncios: DTO -> Mapper -> Entity
    let adEntity = null;
    let adsError = null;
    if (rawResults.adsResult.status === 'fulfilled') {
        adEntity = mapAdDTOToEntity(rawResults.adsResult.value, currentLang);
    }
    else {
        adsError = rawResults.adsResult.reason?.message || "Error al cargar anuncios";
    }
    // Actualizar la Interfaz Gráfica
    updateLanguageUI(store);
    updateSimulationButtonsUI();
    renderGallery(store.getFilteredItems(), store);
    updateFavoritesBadge(store);
    renderAdsBanner(adEntity, adsError, store);
    renderReviewsWidget(reviewsEntities, reviewsError, store);
}
/**
 * Función principal de inicio de la aplicación.
 * Orquesta la llamada concurrente a los servicios backend y ejecuta el flujo DTO -> Mapper -> DataCatalogManager.
 */
export async function initApp() {
    console.log("🏁 [InitApp] Inicializando CineVerse con Repositorio Genérico y TypeScript Estricto...");
    if (statusContainer) {
        statusContainer.hidden = false;
        statusContainer.style.display = 'flex';
    }
    try {
        const rawResults = await fetchAllServices(simulateReviewFail, simulateAdFail);
        lastRawResults = rawResults;
        if (statusContainer) {
            statusContainer.hidden = true;
            statusContainer.style.display = 'none';
        }
        applyPayloadForLanguage(rawResults);
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
            const rawId = favButton.dataset.id || '';
            const isNowFav = store.toggleFavorite(rawId);
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
            renderGallery(store.getFilteredItems(), store);
            return;
        }
        // Clic en Tarjeta para ver Detalles (Modal)
        const cardArticle = target.closest('[data-action="detail"]');
        if (cardArticle) {
            const rawId = cardArticle.dataset.id || '';
            openMediaDetailsModal(rawId, store);
        }
    });
}
// Filtro por Tipo de Medio (Películas, Series, Documentales, Todos)
if (mediaTypeBar) {
    const bar = mediaTypeBar;
    bar.addEventListener('click', (e) => {
        const target = e.target;
        if (!target)
            return;
        const typeBtn = target.closest('.type-btn');
        if (!typeBtn)
            return;
        const allButtons = bar.querySelectorAll('.type-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        typeBtn.classList.add('active');
        const selectedType = (typeBtn.dataset.type || 'all');
        store.setTypeFilter(selectedType);
        renderGallery(store.getFilteredItems(), store);
    });
}
// Filtro por Género
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
        renderGallery(store.getFilteredItems(), store);
    });
}
// Clic en la insignia de favoritos del Header
if (favoritesCounterBtn) {
    favoritesCounterBtn.addEventListener('click', () => {
        store.setGenre('favorites');
        if (filterBar) {
            const allButtons = filterBar.querySelectorAll('.filter-btn');
            allButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.genre === 'favorites');
            });
        }
        renderGallery(store.getFilteredItems(), store);
    });
}
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const inputEl = e.target;
        const value = inputEl.value;
        if (clearSearchBtn)
            clearSearchBtn.hidden = value.trim() === '';
        store.setSearchQuery(value);
        renderGallery(store.getFilteredItems(), store);
    });
}
if (clearSearchBtn) {
    const clearBtn = clearSearchBtn;
    clearBtn.addEventListener('click', () => {
        if (searchInput)
            searchInput.value = '';
        clearBtn.hidden = true;
        store.setSearchQuery('');
        renderGallery(store.getFilteredItems(), store);
    });
}
// Alternador de Idioma (Español <-> Inglés)
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        store.setLanguage();
        if (lastRawResults) {
            applyPayloadForLanguage(lastRawResults);
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
function updateSimulationButtonsUI() {
    const lang = store.getLanguage();
    const t = getTranslation(lang);
    if (toggleAdErrBtn) {
        toggleAdErrBtn.textContent = simulateAdFail ? t.simAdError : t.simAdNormal;
    }
    if (toggleReviewErrBtn) {
        toggleReviewErrBtn.textContent = simulateReviewFail ? t.simReviewError : t.simReviewNormal;
    }
}
if (toggleAdErrBtn) {
    toggleAdErrBtn.addEventListener('click', () => {
        simulateAdFail = !simulateAdFail;
        toggleAdErrBtn.classList.toggle('active-err', simulateAdFail);
        updateSimulationButtonsUI();
        initApp();
    });
}
if (toggleReviewErrBtn) {
    toggleReviewErrBtn.addEventListener('click', () => {
        simulateReviewFail = !simulateReviewFail;
        toggleReviewErrBtn.classList.toggle('active-err', simulateReviewFail);
        updateSimulationButtonsUI();
        initApp();
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
}
else {
    initApp();
}
