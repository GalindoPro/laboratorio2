/**
 * ============================================================================
 * MÓDULO UI - INYECCIÓN EFICIENTE DEL DOM Y VISTAS (TS STRICT)
 * ----------------------------------------------------------------------------
 * Manipula la interfaz de usuario mediante DocumentFragment y <template> HTML5.
 * Renderizado polimórfico y traducción i18n dinámica de MediaItem (Movie, Series, Documentary).
 * ============================================================================
 */

import { MediaItem, Movie, Series, Documentary } from '../entities/media.entity.js';
import { Review } from '../entities/review.entity.js';
import { Ad } from '../entities/ad.entity.js';
import { MediaStore } from './store.js';
import { getTranslation } from './i18n.js';

// Referencias principales al DOM
export const galleryContainer = document.getElementById('gallery-container') as HTMLDivElement | null;
export const cardTemplate = document.getElementById('movie-card-template') as HTMLTemplateElement | null;
export const statusContainer = document.getElementById('status-container') as HTMLDivElement | null;
export const statusText = document.getElementById('status-text') as HTMLParagraphElement | null;
export const emptyState = document.getElementById('empty-state') as HTMLDivElement | null;
export const emptyTitle = document.getElementById('empty-title') as HTMLHeadingElement | null;
export const emptyText = document.getElementById('empty-text') as HTMLParagraphElement | null;
export const favoritesCountEl = document.getElementById('favorites-count') as HTMLSpanElement | null;
export const favoritesCounterBtn = document.getElementById('favorites-counter-btn') as HTMLDivElement | null;
export const badgeTextFav = document.getElementById('badge-text-fav') as HTMLSpanElement | null;
export const langToggleBtn = document.getElementById('lang-toggle-btn') as HTMLButtonElement | null;
export const currentLangText = document.getElementById('current-lang-text') as HTMLSpanElement | null;
export const footerLab = document.getElementById('footer-lab') as HTMLParagraphElement | null;
export const footerArch = document.getElementById('footer-arch') as HTMLParagraphElement | null;

export const filterBar = document.getElementById('filter-bar') as HTMLDivElement | null;
export const mediaTypeBar = document.getElementById('media-type-bar') as HTMLDivElement | null;
export const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
export const clearSearchBtn = document.getElementById('clear-search') as HTMLButtonElement | null;
export const movieModal = document.getElementById('movie-modal') as HTMLDialogElement | null;
export const modalBody = document.getElementById('modal-body') as HTMLDivElement | null;
export const closeModalBtn = document.getElementById('close-modal-btn') as HTMLButtonElement | null;

export const adsContainer = document.getElementById('ads-container') as HTMLDivElement | null;
export const reviewsContainer = document.getElementById('reviews-container') as HTMLDivElement | null;

export const simulationLabel = document.querySelector('.simulation-label') as HTMLSpanElement | null;

/**
 * Actualiza la UI de todos los elementos estáticos según el idioma activo en el Store.
 */
export function updateLanguageUI(store: MediaStore): void {
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    if (currentLangText) currentLangText.textContent = lang.toUpperCase();
    if (langToggleBtn) {
        langToggleBtn.title = t.langBtnTitle;
        langToggleBtn.setAttribute('aria-label', t.langBtnTitle);
    }

    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
        searchInput.setAttribute('aria-label', t.searchPlaceholder);
    }
    if (clearSearchBtn) clearSearchBtn.setAttribute('aria-label', t.clearSearchAria);
    if (badgeTextFav) badgeTextFav.textContent = t.favoritesBadge;
    if (favoritesCounterBtn) favoritesCounterBtn.title = t.favoritesTitle;

    if (statusText) statusText.textContent = t.loadingText;
    if (emptyTitle) emptyTitle.textContent = t.emptyTitle;
    if (emptyText) emptyText.textContent = t.emptyText;

    if (simulationLabel) simulationLabel.textContent = t.simErrorsTitle;

    if (footerLab) footerLab.textContent = t.footerLab;
    if (footerArch) footerArch.textContent = t.footerArch;

    // Actualización de barra de botones de Tipo de Medio
    if (mediaTypeBar) {
        const typeButtons = mediaTypeBar.querySelectorAll<HTMLButtonElement>('.type-btn');
        typeButtons.forEach(btn => {
            const type = btn.dataset.type;
            if (type === 'all') btn.textContent = t.typeAll;
            else if (type === 'movie') btn.textContent = t.typeMovies;
            else if (type === 'series') btn.textContent = t.typeSeries;
            else if (type === 'documentary') btn.textContent = t.typeDocumentaries;
        });
    }

    // Actualización de barra de botones de Género
    if (filterBar) {
        const filterButtons = filterBar.querySelectorAll<HTMLButtonElement>('.filter-btn');
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
 * Renderiza la galería multimedia utilizando DocumentFragment e Entidades `MediaItem` saneadas.
 */
export function renderGallery(itemsArray: MediaItem[], store: MediaStore): void {
    if (!galleryContainer || !cardTemplate) return;
    galleryContainer.innerHTML = '';

    if (!itemsArray || itemsArray.length === 0) {
        if (emptyState) emptyState.hidden = false;
        return;
    }
    if (emptyState) emptyState.hidden = true;

    const fragment = document.createDocumentFragment();
    const lang = store.getLanguage();
    const t = getTranslation(lang);

    itemsArray.forEach(item => {
        const cardClone = cardTemplate.content.cloneNode(true) as DocumentFragment;
        const cardArticle = cardClone.querySelector('.movie-card') as HTMLElement;
        const posterImg = cardClone.querySelector('.movie-poster') as HTMLImageElement;
        const ratingVal = cardClone.querySelector('.rating-value') as HTMLSpanElement;
        const typeBadge = cardClone.querySelector('.media-type-badge') as HTMLSpanElement;
        const genreSpan = cardClone.querySelector('.movie-genre') as HTMLSpanElement;
        const titleH3 = cardClone.querySelector('.movie-title') as HTMLHeadingElement;
        const yearP = cardClone.querySelector('.movie-year') as HTMLParagraphElement;
        const favBtn = cardClone.querySelector('.fav-btn') as HTMLButtonElement;

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
            if (favIcon) favIcon.textContent = '❤️';
        }

        fragment.appendChild(cardClone);
    });

    galleryContainer.appendChild(fragment);
}

/**
 * Actualiza el contador de favoritos.
 */
export function updateFavoritesBadge(store: MediaStore): void {
    if (favoritesCountEl) {
        favoritesCountEl.textContent = String(store.getFavoritesCount());
    }
}

/**
 * Abre el modal con diseño premium y renderizado polimórfico traducido según el tipo de entidad.
 */
export function openMediaDetailsModal(itemId: string | number, store: MediaStore): void {
    const item = store.getById(itemId);
    if (!item || !modalBody || !movieModal) return;

    const lang = store.getLanguage();
    const t = getTranslation(lang);
    const isFav = store.isFavorite(item.id);

    // Estrellas visuales de rating
    const stars = Math.round(item.rating / 2);
    const starsHTML = Array.from({ length: 5 }, (_, i) =>
        `<span class="modal-star${i < stars ? ' filled' : ''}">${i < stars ? '★' : '☆'}</span>`
    ).join('');

    // Color del tipo
    const typeColor = item.type === 'movie' ? '#e50914' : item.type === 'series' ? '#3b82f6' : '#10b981';
    const typeLabel = item.type === 'movie' ? t.badgeMovie : item.type === 'series' ? t.badgeSeries : t.badgeDocumentary;

    // Detalles específicos del tipo
    let specificDetailHTML = '';
    if (item.type === 'movie') {
        const movie = item as Movie;
        specificDetailHTML = `
            <div class="modal-detail-row">
                <span class="modal-detail-icon">🎬</span>
                <span><strong>${t.directorLabel}</strong> ${movie.director}</span>
            </div>`;
    } else if (item.type === 'series') {
        const series = item as Series;
        specificDetailHTML = `
            <div class="modal-detail-row">
                <span class="modal-detail-icon">📺</span>
                <span><strong>${t.seasonsLabel}</strong> ${series.seasons} &nbsp;|&nbsp; <strong>${t.episodesLabel}</strong> ${series.episodes}</span>
            </div>`;
    } else if (item.type === 'documentary') {
        const doc = item as Documentary;
        specificDetailHTML = `
            <div class="modal-detail-row">
                <span class="modal-detail-icon">🎙️</span>
                <span><strong>${t.topicLabel}</strong> ${doc.topic}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-icon">🎤</span>
                <span><strong>${t.narratorLabel}</strong> ${doc.narrator ?? 'N/A'}</span>
            </div>`;
    }

    modalBody.innerHTML = `
        <!-- Fondo con imagen en blur -->
        <div class="modal-backdrop-img" style="background-image: url('${item.poster}')"></div>
        <div class="modal-backdrop-overlay"></div>

        <!-- Contenido del modal -->
        <div class="modal-inner">
            <!-- Poster + columna info -->
            <div class="modal-layout">
                <div class="modal-poster-wrap">
                    <img class="modal-poster-img" src="${item.poster}" alt="${item.title}">
                    <div class="modal-type-pill" style="background: ${typeColor}22; border-color: ${typeColor};">
                        <span style="color: ${typeColor};">${typeLabel}</span>
                    </div>
                </div>

                <div class="modal-info">
                    <p class="modal-genre-label">${item.genre} · ${item.year}</p>
                    <h2 class="modal-heading">${item.title}</h2>

                    <!-- Rating con estrellas -->
                    <div class="modal-rating-row">
                        <div class="modal-stars">${starsHTML}</div>
                        <span class="modal-rating-num">${item.rating.toFixed(1)}<span class="modal-rating-max">/10</span></span>
                    </div>

                    <!-- Sinopsis -->
                    <p class="modal-synopsis-text">${item.synopsis}</p>

                    <!-- Detalles específicos -->
                    <div class="modal-details-block">
                        ${specificDetailHTML}
                        <div class="modal-detail-row">
                            <span class="modal-detail-icon">📅</span>
                            <span><strong>${lang === 'es' ? 'Año:' : 'Year:'}</strong> ${item.year}</span>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="modal-actions">
                        <button class="modal-fav-btn modal-fav-toggle" data-id="${String(item.id)}">
                            <span class="modal-fav-icon">${isFav ? '❤️' : '🤍'}</span>
                            <span class="modal-fav-label">${isFav ? t.inFavorites : t.favBtnAdd}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Botón de favorito DENTRO del modal
    const modalFavBtn = modalBody.querySelector<HTMLButtonElement>('.modal-fav-toggle');
    if (modalFavBtn) {
        modalFavBtn.addEventListener('click', () => {
            const rawId = modalFavBtn.dataset.id || '';
            const isNowFav = store.toggleFavorite(rawId);
            const iconEl = modalFavBtn.querySelector('.modal-fav-icon');
            const labelEl = modalFavBtn.querySelector('.modal-fav-label');
            if (iconEl) iconEl.textContent = isNowFav ? '❤️' : '🤍';
            if (labelEl) labelEl.textContent = isNowFav ? t.inFavorites : t.favBtnAdd;
            modalFavBtn.classList.toggle('is-fav', isNowFav);
        });
    }

    movieModal.showModal();
}

/**
 * Renderiza el Banner de la Entidad de Anuncios Promocionales.
 */
export function renderAdsBanner(adEntity: Ad | null, adsError: string | null, store: MediaStore): void {
    if (!adsContainer) return;

    if (adsError) {
        adsContainer.innerHTML = `
            <div class="banner-box error-fallback">
                <div class="banner-badge warning">⚠️ RESILIENCIA API (Promise.allSettled)</div>
                <p class="banner-error-msg"><strong>Servicio de Anuncios fuera de línea:</strong> ${adsError}</p>
                <p class="banner-subtext">El catálogo principal de medios se mantiene 100% funcional sin interrupciones.</p>
            </div>
        `;
    } else if (adEntity) {
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
export function renderReviewsWidget(reviewsEntities: Review[] | null, reviewsError: string | null, store: MediaStore): void {
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
    } else if (reviewsEntities && reviewsEntities.length > 0) {
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
