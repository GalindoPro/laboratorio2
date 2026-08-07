/**
 * ============================================================================
 * MÓDULO UI - INYECCIÓN EFICIENTE DEL DOM Y VISTAS (TS STRICT)
 * ----------------------------------------------------------------------------
 * Manipula la interfaz de usuario mediante DocumentFragment y <template> HTML5.
 * Renderizado polimórfico y traducción i18n dinámica de MediaItem (Movie, Series, Documentary).
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
export const mediaTypeBar = document.getElementById('media-type-bar');
export const searchInput = document.getElementById('search-input');
export const clearSearchBtn = document.getElementById('clear-search');
export const movieModal = document.getElementById('movie-modal');
export const modalBody = document.getElementById('modal-body');
export const closeModalBtn = document.getElementById('close-modal-btn');
export const adsContainer = document.getElementById('ads-container');
export const reviewsContainer = document.getElementById('reviews-container');
export const simulationLabel = document.querySelector('.simulation-label');
/**
 * Actualiza la UI de todos los elementos estáticos según el idioma activo en el Store.
 */
export function updateLanguageUI(store) {
    const lang = store.getLanguage();
    const t = getTranslation(lang);
    if (currentLangText)
        currentLangText.textContent = lang.toUpperCase();
    if (langToggleBtn) {
        langToggleBtn.title = t.langBtnTitle;
        langToggleBtn.setAttribute('aria-label', t.langBtnTitle);
    }
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
        searchInput.setAttribute('aria-label', t.searchPlaceholder);
    }
    if (clearSearchBtn)
        clearSearchBtn.setAttribute('aria-label', t.clearSearchAria);
    if (badgeTextFav)
        badgeTextFav.textContent = t.favoritesBadge;
    if (favoritesCounterBtn)
        favoritesCounterBtn.title = t.favoritesTitle;
    if (statusText)
        statusText.textContent = t.loadingText;
    if (emptyTitle)
        emptyTitle.textContent = t.emptyTitle;
    if (emptyText)
        emptyText.textContent = t.emptyText;
    if (simulationLabel)
        simulationLabel.textContent = t.simErrorsTitle;
    if (footerLab)
        footerLab.textContent = t.footerLab;
    if (footerArch)
        footerArch.textContent = t.footerArch;
    // Actualización de barra de botones de Tipo de Medio
    if (mediaTypeBar) {
        const typeButtons = mediaTypeBar.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            const type = btn.dataset.type;
            if (type === 'all')
                btn.textContent = t.typeAll;
            else if (type === 'movie')
                btn.textContent = t.typeMovies;
            else if (type === 'series')
                btn.textContent = t.typeSeries;
            else if (type === 'documentary')
                btn.textContent = t.typeDocumentaries;
        });
    }
    // Actualización de barra de botones de Género
    if (filterBar) {
        const filterButtons = filterBar.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const genre = btn.dataset.genre;
            if (genre === 'all')
                btn.textContent = t.filterAll;
            else if (genre === 'Acción')
                btn.textContent = t.filterAction;
            else if (genre === 'Ciencia Ficción')
                btn.textContent = t.filterSciFi;
            else if (genre === 'Drama')
                btn.textContent = t.filterDrama;
            else if (genre === 'Animación')
                btn.textContent = t.filterAnimation;
            else if (genre === 'favorites')
                btn.textContent = t.filterFavorites;
        });
    }
}
/**
 * Renderiza la galería multimedia utilizando DocumentFragment e Entidades `MediaItem` saneadas.
 */
export function renderGallery(itemsArray, store) {
    if (!galleryContainer || !cardTemplate)
        return;
    galleryContainer.innerHTML = '';
    if (!itemsArray || itemsArray.length === 0) {
        if (emptyState)
            emptyState.hidden = false;
        return;
    }
    if (emptyState)
        emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    const lang = store.getLanguage();
    const t = getTranslation(lang);
    itemsArray.forEach(item => {
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardArticle = cardClone.querySelector('.movie-card');
        const posterImg = cardClone.querySelector('.movie-poster');
        const ratingVal = cardClone.querySelector('.rating-value');
        const typeBadge = cardClone.querySelector('.media-type-badge');
        const genreSpan = cardClone.querySelector('.movie-genre');
        const titleH3 = cardClone.querySelector('.movie-title');
        const yearP = cardClone.querySelector('.movie-year');
        const favBtn = cardClone.querySelector('.fav-btn');
        cardArticle.dataset.id = String(item.id);
        favBtn.dataset.id = String(item.id);
        posterImg.src = item.poster;
        posterImg.alt = `Póster de ${item.title}`;
        ratingVal.textContent = item.rating.toFixed(1);
        if (typeBadge) {
            typeBadge.textContent = item.type === 'movie'
                ? t.badgeMovie
                : item.type === 'series'
                    ? t.badgeSeries
                    : t.badgeDocumentary;
            typeBadge.className = `media-type-badge type-${item.type}`;
        }
        genreSpan.textContent = item.genre;
        titleH3.textContent = item.title;
        yearP.textContent = String(item.year);
        favBtn.title = t.favBtnAdd;
        if (store.isFavorite(item.id)) {
            favBtn.classList.add('is-active');
            const favIcon = favBtn.querySelector('.fav-icon');
            if (favIcon)
                favIcon.textContent = '❤️';
        }
        fragment.appendChild(cardClone);
    });
    galleryContainer.appendChild(fragment);
}
/**
 * Actualiza el contador de favoritos.
 */
export function updateFavoritesBadge(store) {
    if (favoritesCountEl) {
        favoritesCountEl.textContent = String(store.getFavoritesCount());
    }
}
/**
 * Abre el modal con renderizado polimórfico traducido según el tipo de entidad (Movie, Series, Documentary).
 */
export function openMediaDetailsModal(itemId, store) {
    const item = store.getById(itemId);
    if (!item || !modalBody || !movieModal)
        return;
    const lang = store.getLanguage();
    const t = getTranslation(lang);
    const isFav = store.isFavorite(item.id);
    let specificDetailHTML = '';
    if (item.type === 'movie') {
        const movie = item;
        specificDetailHTML = `<p class="modal-director">${t.directorLabel} <strong>${movie.director}</strong></p>`;
    }
    else if (item.type === 'series') {
        const series = item;
        specificDetailHTML = `
            <p class="modal-director">${t.seasonsLabel} <strong>${series.seasons}</strong> | ${t.episodesLabel} <strong>${series.episodes}</strong></p>
        `;
    }
    else if (item.type === 'documentary') {
        const doc = item;
        specificDetailHTML = `
            <p class="modal-director">${t.topicLabel} <strong>${doc.topic}</strong> | ${t.narratorLabel} <strong>${doc.narrator ?? 'N/A'}</strong></p>
        `;
    }
    const typeBadgeText = item.type === 'movie'
        ? t.badgeMovie
        : item.type === 'series'
            ? t.badgeSeries
            : t.badgeDocumentary;
    modalBody.innerHTML = `
        <div class="modal-detail-layout">
            <div class="modal-poster-col">
                <img src="${item.poster}" alt="${item.title}">
            </div>
            <div class="modal-info-col">
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                    <span class="modal-genre-tag">${item.genre}</span>
                    <span class="modal-genre-tag" style="background: rgba(255, 255, 255, 0.1);">${typeBadgeText}</span>
                </div>
                <h2 class="modal-title">${item.title}</h2>
                <div class="modal-meta">
                    <span class="modal-meta-item">⭐ ${item.rating.toFixed(1)} ${t.ratingLabel}</span>
                    <span class="modal-meta-item">📅 ${item.year}</span>
                    <span class="modal-meta-item">${isFav ? t.inFavorites : t.notFavorite}</span>
                </div>
                <p class="modal-synopsis">${item.synopsis}</p>
                ${specificDetailHTML}
            </div>
        </div>
    `;
    movieModal.showModal();
}
/**
 * Renderiza el Banner de la Entidad de Anuncios Promocionales.
 */
export function renderAdsBanner(adEntity, adsError, store) {
    if (!adsContainer)
        return;
    if (adsError) {
        adsContainer.innerHTML = `
            <div class="banner-box error-fallback">
                <div class="banner-badge warning">⚠️ RESILIENCIA API (Promise.allSettled)</div>
                <p class="banner-error-msg"><strong>Servicio de Anuncios fuera de línea:</strong> ${adsError}</p>
                <p class="banner-subtext">El catálogo principal de medios se mantiene 100% funcional sin interrupciones.</p>
            </div>
        `;
    }
    else if (adEntity) {
        adsContainer.innerHTML = `
            <div class="banner-box success">
                <div class="banner-content">
                    <h4>${adEntity.title}</h4>
                    <p>${adEntity.description}</p>
                </div>
                <div class="banner-code">
                    <span>ETIQUETA: <strong>${adEntity.badgeText}</strong></span>
                </div>
            </div>
        `;
    }
}
/**
 * Renderiza la sección del Servicio de Reseñas utilizando Entidades Review.
 */
export function renderReviewsWidget(reviewsEntities, reviewsError, store) {
    if (!reviewsContainer)
        return;
    const lang = store.getLanguage();
    const t = getTranslation(lang);
    if (reviewsError) {
        reviewsContainer.innerHTML = `
            <div class="reviews-box error-fallback">
                <h5>${t.reviewsTitle}</h5>
                <p class="reviews-error-msg">⚠️ <strong>Reseñas no disponibles:</strong> ${reviewsError}</p>
            </div>
        `;
    }
    else if (reviewsEntities && reviewsEntities.length > 0) {
        const reviewsHTML = reviewsEntities.map(rev => {
            return `
                <div class="review-card">
                    <div class="review-header">
                        <strong>👤 ${rev.user}</strong>
                        <span class="review-stars">${"⭐".repeat(rev.rating)}</span>
                    </div>
                    <p class="review-comment">"${rev.comment}"</p>
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
