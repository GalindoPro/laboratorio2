/**
 * ============================================================================
 * CINEVERSE - GALERÍA DE PELÍCULAS EN VANILLA JAVASCRIPT (ES6+)
 * ----------------------------------------------------------------------------
 * Demostración Práctica de 4 Conceptos Clave de Arquitectura Frontend:
 * 
 * 1. Encapsulación mediante Closures (Gestión de Estado Privado)
 * 2. Control de Asincronía con Promises (Simulación de Fetch & Latencia de Red)
 * 3. Inyección Eficiente del DOM (Uso de DocumentFragment y <template>)
 * 4. Delegación de Eventos (Manejo Centralizado de Eventos en Contenedores Padre)
 * ============================================================================
 */

'use strict';

/* ============================================================================
 * PILAR 1: ENCAPSULACIÓN MEDIANTE CLOSURES
 * ----------------------------------------------------------------------------
 * Concepto: Una función creadora que retorna un objeto con métodos que tienen
 * acceso al ámbito (scope) léxico interno donde se declaran las variables privadas.
 * Ningún código externo puede modificar las variables _movies, _activeGenre,
 * _searchQuery o _favorites directamente.
 * ============================================================================ */

/**
 * Fabrica el Store central de estado encapsulando los datos mediante un Closure.
 * @returns {Object} Interfaz pública con métodos para consultar y manipular el estado.
 */
function createMovieStore() {
    // --- VARIABLES PRIVADAS (Invisibles desde fuera del Closure) ---
    let _movies = [];
    let _activeGenre = 'all';
    let _searchQuery = '';
    const _favorites = new Set(); // Set privado para almacenar IDs únicos de películas favoritas

    // --- INTERFAZ PÚBLICA RETORNADA ---
    return {
        /**
         * Almacena el catálogo inicial de películas recibido del servidor.
         * @param {Array} moviesList 
         */
        setMovies(moviesList) {
            _movies = Array.isArray(moviesList) ? moviesList : [];
        },

        /**
         * Actualiza el filtro de género seleccionado.
         * @param {string} genre 
         */
        setGenre(genre) {
            _activeGenre = genre;
        },

        /**
         * Actualiza la consulta de búsqueda por texto.
         * @param {string} query 
         */
        setSearchQuery(query) {
            _searchQuery = query.toLowerCase().trim();
        },

        /**
         * Alterna el estado de favorita para un ID de película (agrega o remueve).
         * @param {number} movieId 
         * @returns {boolean} Nuevo estado (true si quedó como favorita, false en caso contrario)
         */
        toggleFavorite(movieId) {
            const numericId = Number(movieId);
            if (_favorites.has(numericId)) {
                _favorites.delete(numericId);
                return false;
            } else {
                _favorites.add(numericId);
                return true;
            }
        },

        /**
         * Consulta si una película específica está marcada como favorita.
         * @param {number} movieId 
         * @returns {boolean}
         */
        isFavorite(movieId) {
            return _favorites.has(Number(movieId));
        },

        /**
         * Obtiene la cantidad total de películas agregadas a favoritas.
         * @returns {number}
         */
        getFavoritesCount() {
            return _favorites.size;
        },

        /**
         * Busca una película por su ID privado.
         * @param {number} movieId 
         * @returns {Object|undefined}
         */
        getMovieById(movieId) {
            return _movies.find(movie => movie.id === Number(movieId));
        },

        /**
         * Retorna la lista filtrada de películas según género, favoritos y texto de búsqueda.
         * Aplica filtrado reactivo combinando múltiples criterios de forma pura.
         * @returns {Array} Lista filtrada de películas
         */
        getFilteredMovies() {
            return _movies.filter(movie => {
                // 1. Filtrado por Género / Favoritas
                let matchesGenre = true;
                if (_activeGenre === 'favorites') {
                    matchesGenre = _favorites.has(movie.id);
                } else if (_activeGenre !== 'all') {
                    matchesGenre = movie.genre === _activeGenre;
                }

                // 2. Filtrado por Texto de Búsqueda (Título o Sinopsis)
                let matchesSearch = true;
                if (_searchQuery !== '') {
                    matchesSearch = movie.title.toLowerCase().includes(_searchQuery) ||
                                    movie.synopsis.toLowerCase().includes(_searchQuery);
                }

                return matchesGenre && matchesSearch;
            });
        }
    };
}

// Instanciamos el store único de la aplicación utilizando la función creadora
const store = createMovieStore();


/* ============================================================================
 * PILAR 2: CONTROL DE ASINCRONÍA CON PROMISES
 * ----------------------------------------------------------------------------
 * Concepto: Simulación de una llamada API HTTP asíncrona mediante objetos Promise.
 * Permite manejar latencia de red, estados de carga y manejo de respuestas.
 * ============================================================================ */

// Datos ficticios que simulan la respuesta en formato JSON de un backend
const MOCK_MOVIES_DATA = [
    {
        id: 1,
        title: "Inception (Origen)",
        genre: "Ciencia Ficción",
        year: 2010,
        rating: 8.8,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        synopsis: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de intercambio de sueños recibe la tarea inversa de plantar una idea en la mente de un CEO."
    },
    {
        id: 2,
        title: "The Dark Knight",
        genre: "Acción",
        year: 2008,
        rating: 9.0,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        synopsis: "Cuando la amenaza conocida como el Joker causa el caos en la ciudad de Gotham, Batman debe aceptar una de las mayores pruebas para luchar contra la injusticia."
    },
    {
        id: 3,
        title: "Spider-Man: Across the Spider-Verse",
        genre: "Animación",
        year: 2023,
        rating: 8.7,
        director: "Joaquim Dos Santos, Kemp Powers",
        poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
        synopsis: "Miles Morales catapultado a través del Multiverso une fuerzas con Gwen Stacy y un nuevo equipo de Spider-Personas para enfrentarse a un villano más poderoso que nada."
    },
    {
        id: 4,
        title: "Interstellar",
        genre: "Ciencia Ficción",
        year: 2014,
        rating: 8.7,
        director: "Christopher Nolan",
        poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        synopsis: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por garantizar la supervivencia de la humanidad."
    },
    {
        id: 5,
        title: "Pulp Fiction",
        genre: "Drama",
        year: 1994,
        rating: 8.9,
        director: "Quentin Tarantino",
        poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80",
        synopsis: "Las vidas de dos matones a sueldo, un boxeador, la esposa de un gángster y un par de bandidos se entrelazan en cuatro historias de violencia y redención."
    },
    {
        id: 6,
        title: "The Matrix",
        genre: "Acción",
        year: 1999,
        rating: 8.7,
        director: "Lana y Lilly Wachowski",
        poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        synopsis: "Un hacker descubre a través de misteriosos rebeldes la verdadera naturaleza de su realidad y su papel en la guerra contra sus controladores."
    },
    {
        id: 7,
        title: "Spirited Away (El Viaje de Chihiro)",
        genre: "Animación",
        year: 2001,
        rating: 8.6,
        director: "Hayao Miyazaki",
        poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        synopsis: "Durante el traslado de su familia a los suburbios, una niña de 10 años vaga por un mundo gobernado por dioses, brujas y espíritus donde los humanos se transforman en bestias."
    },
    {
        id: 8,
        title: "The Shawshank Redemption",
        genre: "Drama",
        year: 1994,
        rating: 9.3,
        director: "Frank Darabont",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        synopsis: "Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion."
    }
];

/**
 * Simula una petición HTTP asíncrona a un servicio web remoto.
 * Devuelve una Promise que resuelve tras una latencia simulada de 1.2 segundos.
 * @returns {Promise<Array>} Promesa que resuelve la lista de películas
 */
function fetchMoviesAPI() {
    return new Promise((resolve, reject) => {
        // Simulamos un retraso de red con setTimeout (1200ms)
        setTimeout(() => {
            const isSuccess = true; // Simulación de estado exitoso de la API
            
            if (isSuccess) {
                resolve(MOCK_MOVIES_DATA);
            } else {
                reject(new Error("Error al obtener los datos del servidor de películas."));
            }
        }, 1200);
    });
}


/* ============================================================================
 * PILAR 3: INYECCIÓN EFICIENTE DEL DOM (DOCUMENTFRAGMENT Y TEMPLATE)
 * ----------------------------------------------------------------------------
 * Concepto: En lugar de modificar el DOM directamente en un ciclo (lo cual
 * provocaría múltiples reflows y repaints del navegador), creamos un
 * DocumentFragment en memoria, construimos allí todos los nodos y los
 * agregamos al DOM en una ÚNICA operación atómica.
 * ============================================================================ */

// Referencias a elementos del DOM principal
const galleryContainer = document.getElementById('gallery-container');
const cardTemplate = document.getElementById('movie-card-template');
const statusContainer = document.getElementById('status-container');
const emptyState = document.getElementById('empty-state');
const favoritesCountEl = document.getElementById('favorites-count');

/**
 * Renderiza el listado de películas de forma eficiente usando DocumentFragment.
 * @param {Array} moviesArray Lista de objetos de películas a renderizar
 */
function renderGallery(moviesArray) {
    // 1. Limpiamos el contenido previo del contenedor
    galleryContainer.innerHTML = '';

    // Si no hay películas que coincidan con el filtro, mostramos el estado vacío
    if (!moviesArray || moviesArray.length === 0) {
        emptyState.hidden = false;
        return;
    }
    emptyState.hidden = true;

    // 2. CREACIÓN DEL DOCUMENTFRAGMENT (Fragmento liviano en memoria)
    const fragment = document.createDocumentFragment();

    // 3. Iteramos sobre las películas construyendo los nodos fuera del árbol principal del DOM
    moviesArray.forEach(movie => {
        // Clonamos el contenido profundo de la plantilla HTML <template>
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardArticle = cardClone.querySelector('.movie-card');
        const posterImg = cardClone.querySelector('.movie-poster');
        const ratingVal = cardClone.querySelector('.rating-value');
        const genreSpan = cardClone.querySelector('.movie-genre');
        const titleH3 = cardClone.querySelector('.movie-title');
        const yearP = cardClone.querySelector('.movie-year');
        const favBtn = cardClone.querySelector('.fav-btn');

        // Asignamos atributos dataset para la delegación de eventos
        cardArticle.dataset.id = movie.id;
        favBtn.dataset.id = movie.id;

        // Rellenamos los campos de texto e imagen respetando la semántica
        posterImg.src = movie.poster;
        posterImg.alt = `Póster de la película ${movie.title}`;
        ratingVal.textContent = movie.rating.toFixed(1);
        genreSpan.textContent = movie.genre;
        titleH3.textContent = movie.title;
        yearP.textContent = movie.year;

        // Si la película está en el Set privado de favoritas, actualizamos la interfaz del botón
        if (store.isFavorite(movie.id)) {
            favBtn.classList.add('is-active');
            favBtn.querySelector('.fav-icon').textContent = '❤️';
        }

        // Agregamos la tarjeta construida al fragmento en memoria
        fragment.appendChild(cardClone);
    });

    // 4. INSERCIÓN ÚNICA EN EL DOM (Provoca un solo Reflow / Repaint en el navegador)
    galleryContainer.appendChild(fragment);
}

/**
 * Actualiza el contador global de favoritas en el header.
 */
function updateFavoritesBadge() {
    favoritesCountEl.textContent = store.getFavoritesCount();
}


/* ============================================================================
 * PILAR 4: DELEGACIÓN DE EVENTOS
 * ----------------------------------------------------------------------------
 * Concepto: En lugar de agregar un addEventListener a cada tarjeta o botón
 * individual (lo cual consumiría mucha memoria y requeriría reconectar eventos
 * en cada renderizado), agregamos UN SOLO listener en el contenedor padre.
 * Usamos event.target y Element.closest() para detectar la acción desencadenada.
 * ============================================================================ */

// Referencias a contenedores padres para delegación
const filterBar = document.getElementById('filter-bar');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');

/**
 * DELEGACIÓN DE EVENTOS EN EL CONTENEDOR DE LA GALERÍA (#gallery-container)
 * Escucha clics en todas las tarjetas de películas dinámicas.
 */
galleryContainer.addEventListener('click', (e) => {
    // 1. Verificamos si el clic ocurrió dentro o sobre el botón de Favorito
    const favButton = e.target.closest('[data-action="favorite"]');
    if (favButton) {
        // Detenemos la propagación para evitar que también abra el modal de detalle
        e.stopPropagation();
        
        const movieId = favButton.dataset.id;
        const isNowFav = store.toggleFavorite(movieId);
        
        // Actualizamos la UI del botón según el nuevo estado retornado por el closure
        if (isNowFav) {
            favButton.classList.add('is-active');
            favButton.querySelector('.fav-icon').textContent = '❤️';
        } else {
            favButton.classList.remove('is-active');
            favButton.querySelector('.fav-icon').textContent = '🤍';
        }
        
        // Actualizamos el número de favoritas en el encabezado
        updateFavoritesBadge();
        
        // Si el filtro activo actual es "Mis Favoritas", re-renderizamos la galería
        const currentFiltered = store.getFilteredMovies();
        renderGallery(currentFiltered);
        return;
    }

    // 2. Verificamos si el clic ocurrió en cualquier parte de la tarjeta para ver los detalles
    const cardArticle = e.target.closest('[data-action="detail"]');
    if (cardArticle) {
        const movieId = cardArticle.dataset.id;
        openMovieDetailsModal(movieId);
    }
});

/**
 * DELEGACIÓN DE EVENTOS EN LA BARRA DE FILTROS (#filter-bar)
 * Escucha clics en los botones de género/categorías.
 */
filterBar.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return; // Si el clic no fue en un botón, ignoramos

    // Remover la clase active de todos los botones de la barra
    const allButtons = filterBar.querySelectorAll('.filter-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Activar el botón presionado
    filterBtn.classList.add('active');

    // Obtener el género del atributo dataset del botón
    const selectedGenre = filterBtn.dataset.genre;
    
    // Actualizar el estado mediante la interfaz pública del closure
    store.setGenre(selectedGenre);
    
    // Re-renderizar la galería optimizada con los datos filtrados
    renderGallery(store.getFilteredMovies());
});

/**
 * Evento de Búsqueda en Tiempo Real (Input handler)
 */
searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    clearSearchBtn.hidden = value.trim() === '';
    
    store.setSearchQuery(value);
    renderGallery(store.getFilteredMovies());
});

/**
 * Evento para limpiar la caja de búsqueda
 */
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.hidden = true;
    store.setSearchQuery('');
    renderGallery(store.getFilteredMovies());
});

/**
 * Abre el modal con el detalle completo de una película seleccionada.
 * @param {number} movieId 
 */
function openMovieDetailsModal(movieId) {
    const movie = store.getMovieById(movieId);
    if (!movie) return;

    const isFav = store.isFavorite(movie.id);

    // Inyectamos el contenido dentro del cuerpo del modal
    modalBody.innerHTML = `
        <div class="modal-detail-layout">
            <div class="modal-poster-col">
                <img src="${movie.poster}" alt="${movie.title}">
            </div>
            <div class="modal-info-col">
                <span class="modal-genre-tag">${movie.genre}</span>
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-meta">
                    <span class="modal-meta-item">⭐ ${movie.rating.toFixed(1)} / 10</span>
                    <span class="modal-meta-item">📅 ${movie.year}</span>
                    <span class="modal-meta-item">${isFav ? '❤️ En Favoritas' : '🤍 No Favorita'}</span>
                </div>
                <p class="modal-synopsis">${movie.synopsis}</p>
                <p class="modal-director">Director: <strong>${movie.director}</strong></p>
            </div>
        </div>
    `;

    // Abrimos el modal semántico con la API nativa de HTML5 <dialog>
    movieModal.showModal();
}

// Evento para cerrar el modal al presionar el botón de cerrar
closeModalBtn.addEventListener('click', () => {
    movieModal.close();
});

// Evento para cerrar el modal al hacer clic en el fondo transparente (backdrop)
movieModal.addEventListener('click', (e) => {
    const rect = movieModal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
        movieModal.close();
    }
});


/* ============================================================================
 * INICIALIZACIÓN DE LA APLICACIÓN (Ciclo de Vida)
 * ============================================================================ */

/**
 * Función principal que inicia la aplicación cargando los datos asíncronamente.
 */
function initApp() {
    // 1. Mostramos el indicador de carga
    statusContainer.hidden = false;

    // 2. LLAMADA ASÍNCRONA A LA PROMISE (Manejo con .then() y .catch())
    fetchMoviesAPI()
        .then((moviesData) => {
            // Guardamos las películas en el estado encapsulado (Closure)
            store.setMovies(moviesData);
            
            // Ocultamos el indicador de carga
            statusContainer.hidden = true;
            statusContainer.style.display = 'none';

            
            // Renderizamos las películas usando DocumentFragment de forma eficiente
            renderGallery(store.getFilteredMovies());
            
            // Actualizamos la insignia de favoritos
            updateFavoritesBadge();
        })
        .catch((error) => {
            // Manejo elegante de errores en consola y pantalla
            console.error("Error al inicializar la aplicación:", error);
            statusContainer.innerHTML = `
                <p style="color: var(--accent-red); font-weight: 600;">⚠️ ${error.message}</p>
                <button onclick="location.reload()" class="filter-btn active" style="margin-top: 1rem;">Reintentar</button>
            `;
        });
}

// Arrancamos la aplicación cuando el DOM esté listo (o inmediatamente si ya se cargó)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

