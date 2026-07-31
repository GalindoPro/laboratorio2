/**
 * ============================================================================
 * MÓDULO UI - INYECCIÓN EFICIENTE DEL DOM Y VISTAS (ESM)
 * ----------------------------------------------------------------------------
 * Manipula la interfaz de usuario mediante DocumentFragment, <template> HTML5,
 * rendering del modal <dialog>, banners de anuncios y widgets de reseñas.
 * ============================================================================
 */

import { getTranslation } from './i18n.js';

// Referencias principales al DOM
export const galleryContainer = document.getElementById('gallery-container');
export const cardTemplate = document.getElementById('movie-card-template');
export const statusContainer = document.getElementById('status-container');
export const statusText = document.getElementById('status-text');
export const emptyState = document.getElementById('empty-state');
export const emptyTitle = document.getElementById('empty-title');
export const emptyText = document.getElementById('empty-text');
export const favoritesCountEl = document.getElementById('favorites-count');
export const favoritesCounterBtn = document.getElementById('favorites-counter-btn');
export const badgeTextFav = document.getElementById('badge-text-fav');
export const langToggleBtn = document.getElementById('lang-toggle-btn');
export const currentLangText = document.getElementById('current-lang-text');
export const footerLab = document.getElementById('footer-lab');
export const footerArch = document.getElementById('footer-arch');

export const filterBar = document.getElementById('filter-bar');
export const searchInput = document.getElementById('search-input');
export const clearSearchBtn = document.getElementById('clear-search');
export const movieModal = document.getElementById('movie-modal');
export const modalBody = document.getElementById('modal-body');
export const closeModalBtn = document.getElementById('close-modal-btn');

export const adsContainer = document.getElementById('ads-container');
export const reviewsContainer = document.getElementById('reviews-container');

/**
 * Actualiza la UI de todos los elementos estáticos según el idioma activo en el Store.
 * @param {Object} store 
 */
export function updateLanguageUI(store) {
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    // Indicador de idioma
    if (currentLangText) currentLangText.textContent = lang.toUpperCase();
    if (langToggleBtn) {
        langToggleBtn.title = t.langBtnTitle;
        langToggleBtn.setAttribute('aria-label', t.langBtnTitle);
    }

    // Buscador y contador
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
        searchInput.setAttribute('aria-label', t.searchPlaceholder);
    }
    if (clearSearchBtn) clearSearchBtn.setAttribute('aria-label', t.clearSearchAria);
    if (badgeTextFav) badgeTextFav.textContent = t.favoritesBadge;
    if (favoritesCounterBtn) favoritesCounterBtn.title = t.favoritesTitle;

    // Estados
    if (statusText) statusText.textContent = t.loadingText;
    if (emptyTitle) emptyTitle.textContent = t.emptyTitle;
    if (emptyText) emptyText.textContent = t.emptyText;

    // Footer
    if (footerLab) footerLab.textContent = t.footerLab;
    if (footerArch) footerArch.textContent = t.footerArch;

    // Botones de filtro
    if (filterBar) {
        const filterButtons = filterBar.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const genre = btn.dataset.genre;
            if (genre === 'all') btn.textContent = t.filterAll;
            else if (genre === 'Acción') btn.textContent = t.filterAction;
            else if (genre === 'Ciencia Ficción') btn.textContent = t.filterSciFi;
            else if (genre === 'Drama') btn.textContent = t.filterDrama;
            else if (genre === 'Animación') btn.textContent = t.filterAnimation;
            else if (genre === 'favorites') btn.textContent = t.filterFavorites;
        });
    }
}

/**
 * Renderiza la galería de tarjetas utilizando DocumentFragment (Inyección atómica del DOM).
 * @param {Array} moviesArray 
 * @param {Object} store 
 */
export function renderGallery(moviesArray, store) {
    galleryContainer.innerHTML = '';

    if (!moviesArray || moviesArray.length === 0) {
        emptyState.hidden = false;
        return;
    }
    emptyState.hidden = true;

    // DocumentFragment en memoria
    const fragment = document.createDocumentFragment();
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    moviesArray.forEach(movie => {
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardArticle = cardClone.querySelector('.movie-card');
        const posterImg = cardClone.querySelector('.movie-poster');
        const ratingVal = cardClone.querySelector('.rating-value');
        const genreSpan = cardClone.querySelector('.movie-genre');
        const titleH3 = cardClone.querySelector('.movie-title');
        const yearP = cardClone.querySelector('.movie-year');
        const favBtn = cardClone.querySelector('.fav-btn');

        cardArticle.dataset.id = movie.id;
        favBtn.dataset.id = movie.id;

        const localizedTitle = movie[`title_${lang}`] || movie.title_es || movie.title;
        const localizedGenre = movie[`genre_${lang}`] || movie.genre_es || movie.genre;

        posterImg.src = movie.poster;
        posterImg.alt = `Póster de la película ${localizedTitle}`;
        ratingVal.textContent = movie.rating.toFixed(1);
        genreSpan.textContent = localizedGenre;
        titleH3.textContent = localizedTitle;
        yearP.textContent = movie.year;
        favBtn.title = t.favBtnAdd;

        if (store.isFavorite(movie.id)) {
            favBtn.classList.add('is-active');
            favBtn.querySelector('.fav-icon').textContent = '❤️';
        }

        fragment.appendChild(cardClone);
    });

    // Inserción única en el DOM
    galleryContainer.appendChild(fragment);
}

/**
 * Actualiza la insignia del contador global de favoritas.
 * @param {Object} store 
 */
export function updateFavoritesBadge(store) {
    if (favoritesCountEl) {
        favoritesCountEl.textContent = store.getFavoritesCount();
    }
}

/**
 * Abre el modal HTML5 <dialog> con la información completa de la película.
 * @param {number} movieId 
 * @param {Object} store 
 */
export function openMovieDetailsModal(movieId, store) {
    const movie = store.getMovieById(movieId);
    if (!movie) return;

    const lang = store.getLanguage();
    const t = getTranslation(lang);
    const isFav = store.isFavorite(movie.id);

    const localizedTitle = movie[`title_${lang}`] || movie.title_es || movie.title;
    const localizedGenre = movie[`genre_${lang}`] || movie.genre_es || movie.genre;
    const localizedSynopsis = movie[`synopsis_${lang}`] || movie.synopsis_es || movie.synopsis;

    modalBody.innerHTML = `
        <div class="modal-detail-layout">
            <div class="modal-poster-col">
                <img src="${movie.poster}" alt="${localizedTitle}">
            </div>
            <div class="modal-info-col">
                <span class="modal-genre-tag">${localizedGenre}</span>
                <h2 class="modal-title">${localizedTitle}</h2>
                <div class="modal-meta">
                    <span class="modal-meta-item">⭐ ${movie.rating.toFixed(1)} ${t.ratingLabel}</span>
                    <span class="modal-meta-item">📅 ${movie.year}</span>
                    <span class="modal-meta-item">${isFav ? t.inFavorites : t.notFavorite}</span>
                </div>
                <p class="modal-synopsis">${localizedSynopsis}</p>
                <p class="modal-director">${t.directorLabel} <strong>${movie.director}</strong></p>
            </div>
        </div>
    `;

    movieModal.showModal();
}

/**
 * Renderiza el Banner del Servicio de Anuncios Promocionales.
 * Demuestra la tolerancia a fallos de Promise.allSettled.
 * @param {Object} adsData 
 * @param {string|null} adsError 
 * @param {Object} store 
 */
export function renderAdsBanner(adsData, adsError, store) {
    if (!adsContainer) return;
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    if (adsError) {
        adsContainer.innerHTML = `
            <div class="banner-box error-fallback">
                <div class="banner-badge warning">⚠️ RESILIENCIA API (Promise.allSettled)</div>
                <p class="banner-error-msg"><strong>Servicio de Anuncios fuera de línea:</strong> ${adsError}</p>
                <p class="banner-subtext">El catálogo principal de películas se mantiene 100% funcional sin interrupciones.</p>
            </div>
        `;
    } else if (adsData) {
        const title = adsData[`title_${lang}`] || adsData.title_es;
        const text = adsData[`text_${lang}`] || adsData.text_es;
        adsContainer.innerHTML = `
            <div class="banner-box success">
                <div class="banner-content">
                    <h4>${title}</h4>
                    <p>${text}</p>
                </div>
                <div class="banner-code">
                    <span>CÓDIGO: <strong>${adsData.code}</strong></span>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza la sección del Servicio de Reseñas de Usuarios.
 * Demuestra la tolerancia a fallos de Promise.allSettled.
 * @param {Array|null} reviewsData 
 * @param {string|null} reviewsError 
 * @param {Object} store 
 */
export function renderReviewsWidget(reviewsData, reviewsError, store) {
    if (!reviewsContainer) return;
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    if (reviewsError) {
        reviewsContainer.innerHTML = `
            <div class="reviews-box error-fallback">
                <h5>${t.reviewsTitle}</h5>
                <p class="reviews-error-msg">⚠️ <strong>Reseñas no disponibles:</strong> ${reviewsError}</p>
            </div>
        `;
    } else if (reviewsData && reviewsData.length > 0) {
        const reviewsHTML = reviewsData.map(rev => {
            const comment = rev[`comment_${lang}`] || rev.comment_es;
            return `
                <div class="review-card">
                    <div class="review-header">
                        <strong>👤 ${rev.user}</strong>
                        <span class="review-stars">{"⭐".repeat(rev.rating)}</span>
                    </div>
                    <p class="review-comment">"${comment}"</p>
                </div>
            `;
        }).join('');

        reviewsContainer.innerHTML = `
            <div class="reviews-box success">
                <h5>${t.reviewsTitle}</h5>
                <div class="reviews-grid">
                    ${reviewsHTML}
                </div>
            </div>
        `;
    }
}
