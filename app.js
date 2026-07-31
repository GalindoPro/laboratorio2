/**
 * ============================================================================
 * CINEVERSE - PUNTO DE ENTRADA PRINCIPAL (ESM ARCHITECTURE)
 * ----------------------------------------------------------------------------
 * Demostración Práctica de Conceptos Clave de Arquitectura Frontend:
 * 
 * 1. Orquestación Concurrente Resiliente (Promise.allSettled) de 3 Microservicios
 * 2. Sistema de Caché Asíncrono Encapsulado mediante Clausuras (Closure Cache)
 * 3. Inyección Eficiente del DOM (DocumentFragment y <template>)
 * 4. Delegación de Eventos (Event Delegation)
 * 5. Arquitectura Modular Limpia (ESM - ECMAScript Modules)
 * ============================================================================
 */

import { createMovieStore } from './modules/store.js';
import { fetchAllServices } from './modules/api.js';
import {
    galleryContainer,
    statusContainer,
    statusText,
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

// Instanciamos el store único de la aplicación utilizando la función creadora
export const store = createMovieStore();

// Variables globales para simulación de errores en vivo (útil para la evidencia en video)
let simulateAdFail = false;
let simulateReviewFail = false;

// Almacén local de datos payload devueltos por Promise.allSettled
let lastPayload = null;

/**
 * Función principal de inicio de la aplicación.
 * Orquesta la llamada concurrente a 3 servicios backend con Promise.allSettled.
 */
export async function initApp() {
    console.log("🏁 [InitApp] Inicializando CineVerse con arquitectura ESM...");

    // 1. Mostrar estado de carga
    statusContainer.hidden = false;
    statusContainer.style.display = 'flex';

    // 2. ORQUESTACIÓN CONCURRENTE CON Promise.allSettled
    try {
        const payload = await fetchAllServices(simulateReviewFail, simulateAdFail);
        lastPayload = payload;

        // Guardar catálogo principal en el Store (Closure)
        store.setMovies(payload.movies);

        // Ocultar spinner de carga
        statusContainer.hidden = true;
        statusContainer.style.display = 'none';

        // Actualizar UI con traducciones e inyección de datos
        updateLanguageUI(store);
        renderGallery(store.getFilteredMovies(), store);
        updateFavoritesBadge(store);

        // Renderizar servicios secundarios (Anuncios y Reseñas) demostrando tolerancia a fallos
        renderAdsBanner(payload.ads, payload.adsError, store);
        renderReviewsWidget(payload.reviews, payload.reviewsError, store);

    } catch (error) {
        console.error("❌ [Fatal Error] Fallo crítico al inicializar la app:", error);
        statusContainer.innerHTML = `
            <p style="color: var(--accent-red); font-weight: 600;">⚠️ Error crítico al conectar con el servidor.</p>
        `;
    }
}


/* ============================================================================
 * DELEGACIÓN DE EVENTOS Y LISTENERS CENTRALIZADOS
 * ============================================================================ */

// 1. Delegación de eventos en la Galería de Películas (#gallery-container)
galleryContainer.addEventListener('click', (e) => {
    // Botón de Favorito
    const favButton = e.target.closest('[data-action="favorite"]');
    if (favButton) {
        e.stopPropagation();
        const movieId = favButton.dataset.id;
        const isNowFav = store.toggleFavorite(movieId);
        
        if (isNowFav) {
            favButton.classList.add('is-active');
            favButton.querySelector('.fav-icon').textContent = '❤️';
        } else {
            favButton.classList.remove('is-active');
            favButton.querySelector('.fav-icon').textContent = '🤍';
        }
        
        updateFavoritesBadge(store);
        renderGallery(store.getFilteredMovies(), store);
        return;
    }

    // Clic en Tarjeta para ver Detalles (Modal)
    const cardArticle = e.target.closest('[data-action="detail"]');
    if (cardArticle) {
        const movieId = cardArticle.dataset.id;
        openMovieDetailsModal(movieId, store);
    }
});

// 2. Delegación de eventos en la Barra de Filtros por Género (#filter-bar)
filterBar.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return;

    // Actualizar estilo visual activo
    const allButtons = filterBar.querySelectorAll('.filter-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    // Cambiar filtro en el Store
    const selectedGenre = filterBtn.dataset.genre;
    store.setGenre(selectedGenre);
    
    // Obtener películas filtradas (Aprovecha el CACHÉ EN MEMORIA si se repite la consulta)
    const filteredMovies = store.getFilteredMovies();
    renderGallery(filteredMovies, store);
});

// 3. Búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    clearSearchBtn.hidden = value.trim() === '';
    
    store.setSearchQuery(value);
    renderGallery(store.getFilteredMovies(), store);
});

// 4. Limpiar caja de búsqueda
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.hidden = true;
    store.setSearchQuery('');
    renderGallery(store.getFilteredMovies(), store);
});

// 5. Selector de Idioma (Español / Inglés)
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        store.setLanguage();
        updateLanguageUI(store);
        renderGallery(store.getFilteredMovies(), store);
        if (lastPayload) {
            renderAdsBanner(lastPayload.ads, lastPayload.adsError, store);
            renderReviewsWidget(lastPayload.reviews, lastPayload.reviewsError, store);
        }
    });
}

// 6. Cerrar Modal
closeModalBtn.addEventListener('click', () => {
    movieModal.close();
});

movieModal.addEventListener('click', (e) => {
    const rect = movieModal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
        movieModal.close();
    }
});

// 7. LISTENERS PARA EL PANEL SIMULADOR DE FALLOS (Para grabación del Screencast)
const toggleAdErrBtn = document.getElementById('toggle-ad-err');
const toggleReviewErrBtn = document.getElementById('toggle-review-err');

if (toggleAdErrBtn) {
    toggleAdErrBtn.addEventListener('click', () => {
        simulateAdFail = !simulateAdFail;
        toggleAdErrBtn.classList.toggle('active-err', simulateAdFail);
        toggleAdErrBtn.textContent = simulateAdFail ? "❌ Anuncios: ERROR SIMULADO" : "🟢 Anuncios: Normal";
        initApp(); // Re-ejecuta Promise.allSettled en vivo
    });
}

if (toggleReviewErrBtn) {
    toggleReviewErrBtn.addEventListener('click', () => {
        simulateReviewFail = !simulateReviewFail;
        toggleReviewErrBtn.classList.toggle('active-err', simulateReviewFail);
        toggleReviewErrBtn.textContent = simulateReviewFail ? "❌ Reseñas: ERROR SIMULADO" : "🟢 Reseñas: Normal";
        initApp(); // Re-ejecuta Promise.allSettled en vivo
    });
}

// Inicializamos la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
