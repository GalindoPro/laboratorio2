/**
 * ============================================================================
 * MÓDULO STORE - GESTIÓN DE ESTADO Y CACHÉ MEDIANTE CLAUSURAS (ESM)
 * ----------------------------------------------------------------------------
 * Requerimiento Técnico 2: Función constructora que retorna una interfaz pública
 * encapsulando una variable interna tipo Objeto (`_genreCache`) como Caché en Memoria.
 * Al filtrar por un género por segunda vez, retorna los datos de forma inmediata
 * leyendo del caché privado del Closure sin volver a reprocesar o consultar.
 * ============================================================================
 */

/**
 * Fabrica el Store central de estado encapsulando los datos y el Caché en memoria.
 * @returns {Object} Interfaz pública con métodos para consultar y manipular el estado.
 */
export function createMovieStore() {
    // --- VARIABLES PRIVADAS ENCAPSULADAS EN EL CLOSURE ---
    let _movies = [];
    let _activeGenre = 'all';
    let _searchQuery = '';
    let _currentLang = 'es'; // 'es' o 'en'
    const _favorites = new Set();

    // 💾 CACHÉ PRIVADO EN MEMORIA (Requerimiento Técnico 2)
    // Objeto interno invisible desde fuera que almacena los resultados de filtrado por género
    const _genreCache = {};

    // --- INTERFAZ PÚBLICA RETORNADA ---
    return {
        /**
         * Almacena el catálogo inicial de películas recibido del servidor y limpia caché.
         * @param {Array} moviesList 
         */
        setMovies(moviesList) {
            _movies = Array.isArray(moviesList) ? moviesList : [];
            this.clearCache();
        },

        /**
         * Actualiza el filtro de género seleccionado.
         * @param {string} genre 
         */
        setGenre(genre) {
            _activeGenre = genre;
        },

        /**
         * Obtiene el género activo actualmente.
         * @returns {string}
         */
        getGenre() {
            return _activeGenre;
        },

        /**
         * Actualiza la consulta de búsqueda por texto.
         * @param {string} query 
         */
        setSearchQuery(query) {
            _searchQuery = query.toLowerCase().trim();
        },

        /**
         * Obtiene la consulta de búsqueda actual.
         * @returns {string}
         */
        getSearchQuery() {
            return _searchQuery;
        },

        /**
         * Obtiene el idioma activo actual ('es' o 'en').
         * @returns {string}
         */
        getLanguage() {
            return _currentLang;
        },

        /**
         * Establece o alterna el idioma activo.
         * @param {string} [lang] 
         * @returns {string} Nuevo idioma activo
         */
        setLanguage(lang) {
            if (lang) {
                _currentLang = lang === 'en' ? 'en' : 'es';
            } else {
                _currentLang = _currentLang === 'es' ? 'en' : 'es';
            }
            this.clearCache(); // Invalida el caché al cambiar idioma
            return _currentLang;
        },

        /**
         * Alterna el estado de favorita para un ID de película (agrega o remueve).
         * @param {number} movieId 
         * @returns {boolean} Nuevo estado
         */
        toggleFavorite(movieId) {
            const numericId = Number(movieId);
            let isFav = false;
            if (_favorites.has(numericId)) {
                _favorites.delete(numericId);
                isFav = false;
            } else {
                _favorites.add(numericId);
                isFav = true;
            }
            this.clearCache(); // Invalida el caché para reflejar cambios en favoritos
            return isFav;
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
         * Vacía el objeto privado de Caché en memoria.
         */
        clearCache() {
            Object.keys(_genreCache).forEach(key => delete _genreCache[key]);
            console.log("🧹 [CLOSURE CACHE] Caché privado en memoria purgado.");
        },

        /**
         * Devuelve el estado actual de las claves del Caché Privado (para inspección en consola).
         * @returns {Array<string>}
         */
        getCacheKeys() {
            return Object.keys(_genreCache);
        },

        /**
         * REQUERIMIENTO TÉCNICO 2: FILTRADO CON CACHÉ EN MEMORIA ENCAPSULADO
         * Si se consulta por un género por 2da vez (sin texto de búsqueda),
         * retorna de inmediato los datos desde `_genreCache` sin filtrar nuevamente.
         * 
         * @returns {Array} Lista de películas filtradas
         */
        getFilteredMovies() {
            // Clave única de caché combinando género e idioma activo
            const cacheKey = `${_activeGenre}_${_currentLang}`;

            // 1. Verificación del Caché Privado en Memoria (Cache Hit)
            if (_searchQuery === '' && _genreCache[cacheKey]) {
                console.log(`⚡ [CACHE HIT - CLOSURE] Retornando películas para género '${_activeGenre}' [${_currentLang.toUpperCase()}] DIRECTAMENTE desde el Caché Privado encapsulado.`, {
                    genre: _activeGenre,
                    cachedCount: _genreCache[cacheKey].length,
                    activeCacheKeys: Object.keys(_genreCache)
                });
                return _genreCache[cacheKey];
            }

            // 2. Si no está en caché o hay búsqueda por texto (Cache Miss), procesamos el filtro
            console.log(`💾 [CACHE MISS - CLOSURE] Calculando y guardando películas en el Caché Privado para género '${_activeGenre}' [${_currentLang.toUpperCase()}]...`);

            const filtered = _movies.filter(movie => {
                // 2a. Filtrado por Género / Favoritas
                let matchesGenre = true;
                if (_activeGenre === 'favorites') {
                    matchesGenre = _favorites.has(movie.id);
                } else if (_activeGenre !== 'all') {
                    matchesGenre = (movie.genreKey === _activeGenre || movie.genre_es === _activeGenre || movie.genre === _activeGenre);
                }

                // 2b. Filtrado por Texto de Búsqueda (Título o Sinopsis)
                let matchesSearch = true;
                if (_searchQuery !== '') {
                    const titleEs = (movie.title_es || movie.title || '').toLowerCase();
                    const titleEn = (movie.title_en || movie.title || '').toLowerCase();
                    const synEs = (movie.synopsis_es || movie.synopsis || '').toLowerCase();
                    const synEn = (movie.synopsis_en || movie.synopsis || '').toLowerCase();

                    matchesSearch = titleEs.includes(_searchQuery) ||
                                    titleEn.includes(_searchQuery) ||
                                    synEs.includes(_searchQuery) ||
                                    synEn.includes(_searchQuery);
                }

                return matchesGenre && matchesSearch;
            });

            // 3. Guardamos en el Caché Privado únicamente si no hay filtro de texto activo
            if (_searchQuery === '') {
                _genreCache[cacheKey] = filtered;
            }

            return filtered;
        }
    };
}
