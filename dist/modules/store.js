/**
 * ============================================================================
 * MÓDULO STORE - GESTIÓN DE ESTADO Y CACHÉ MEDIANTE CLAUSURAS (TS STRICT)
 * ----------------------------------------------------------------------------
 * Función constructora que encapsula el estado centralizado y un Caché Privado
 * trabajando con Entidades saneadas `Movie`.
 * ============================================================================
 */
/**
 * Fabrica el Store central de estado encapsulando los datos y el Caché en memoria.
 */
export function createMovieStore() {
    // --- VARIABLES PRIVADAS ENCAPSULADAS EN EL CLOSURE ---
    let _movies = [];
    let _activeGenre = 'all';
    let _searchQuery = '';
    let _currentLang = 'es';
    const _favorites = new Set();
    // 💾 CACHÉ PRIVADO EN MEMORIA
    const _genreCache = {};
    return {
        setMovies(moviesList) {
            _movies = Array.isArray(moviesList) ? moviesList : [];
            this.clearCache();
        },
        setGenre(genre) {
            _activeGenre = genre;
        },
        getGenre() {
            return _activeGenre;
        },
        setSearchQuery(query) {
            _searchQuery = query.toLowerCase().trim();
        },
        getSearchQuery() {
            return _searchQuery;
        },
        getLanguage() {
            return _currentLang;
        },
        setLanguage(lang) {
            if (lang) {
                _currentLang = lang === 'en' ? 'en' : 'es';
            }
            else {
                _currentLang = _currentLang === 'es' ? 'en' : 'es';
            }
            this.clearCache();
            return _currentLang;
        },
        toggleFavorite(movieId) {
            const numericId = Number(movieId);
            let isFav = false;
            if (_favorites.has(numericId)) {
                _favorites.delete(numericId);
                isFav = false;
            }
            else {
                _favorites.add(numericId);
                isFav = true;
            }
            this.clearCache();
            return isFav;
        },
        isFavorite(movieId) {
            return _favorites.has(Number(movieId));
        },
        getFavoritesCount() {
            return _favorites.size;
        },
        getMovieById(movieId) {
            return _movies.find(movie => movie.id === Number(movieId));
        },
        clearCache() {
            Object.keys(_genreCache).forEach(key => delete _genreCache[key]);
            console.log("🧹 [CLOSURE CACHE] Caché privado en memoria purgado.");
        },
        getCacheKeys() {
            return Object.keys(_genreCache);
        },
        getFilteredMovies() {
            const cacheKey = `${_activeGenre}_${_currentLang}`;
            if (_searchQuery === '' && _genreCache[cacheKey]) {
                console.log(`⚡ [CACHE HIT - CLOSURE] Retornando películas para género '${_activeGenre}' [${_currentLang.toUpperCase()}] DIRECTAMENTE desde el Caché Privado.`, {
                    genre: _activeGenre,
                    cachedCount: _genreCache[cacheKey].length,
                    activeCacheKeys: Object.keys(_genreCache)
                });
                return _genreCache[cacheKey];
            }
            console.log(`💾 [CACHE MISS - CLOSURE] Calculando y guardando películas en el Caché Privado para género '${_activeGenre}' [${_currentLang.toUpperCase()}]...`);
            const filtered = _movies.filter(movie => {
                let matchesGenre = true;
                if (_activeGenre === 'favorites') {
                    matchesGenre = _favorites.has(movie.id);
                }
                else if (_activeGenre !== 'all') {
                    matchesGenre = (movie.genreKey === _activeGenre || movie.genre === _activeGenre);
                }
                let matchesSearch = true;
                if (_searchQuery !== '') {
                    const title = movie.title.toLowerCase();
                    const synopsis = movie.synopsis.toLowerCase();
                    matchesSearch = title.includes(_searchQuery) || synopsis.includes(_searchQuery);
                }
                return matchesGenre && matchesSearch;
            });
            if (_searchQuery === '') {
                _genreCache[cacheKey] = filtered;
            }
            return filtered;
        }
    };
}
