/**
 * ============================================================================
 * MÓDULO STORE - GESTIÓN DE ESTADO Y CACHÉ MEDIANTE CLAUSURAS (TS STRICT)
 * ----------------------------------------------------------------------------
 * Función constructora que encapsula el estado centralizado y un Caché Privado
 * trabajando con Entidades saneadas `Movie`.
 * ============================================================================
 */

import { Movie } from '../entities/movie.entity.js';
import { Language } from './i18n.js';

export interface MovieStore {
    setMovies(moviesList: Movie[]): void;
    setGenre(genre: string): void;
    getGenre(): string;
    setSearchQuery(query: string): void;
    getSearchQuery(): string;
    getLanguage(): Language;
    setLanguage(lang?: Language): Language;
    toggleFavorite(movieId: number): boolean;
    isFavorite(movieId: number): boolean;
    getFavoritesCount(): number;
    getMovieById(movieId: number): Movie | undefined;
    clearCache(): void;
    getCacheKeys(): string[];
    getFilteredMovies(): Movie[];
}

/**
 * Fabrica el Store central de estado encapsulando los datos y el Caché en memoria.
 */
export function createMovieStore(): MovieStore {
    // --- VARIABLES PRIVADAS ENCAPSULADAS EN EL CLOSURE ---
    let _movies: Movie[] = [];
    let _activeGenre: string = 'all';
    let _searchQuery: string = '';
    let _currentLang: Language = 'es';
    const _favorites: Set<number> = new Set<number>();

    // 💾 CACHÉ PRIVADO EN MEMORIA
    const _genreCache: Record<string, Movie[]> = {};

    return {
        setMovies(moviesList: Movie[]): void {
            _movies = Array.isArray(moviesList) ? moviesList : [];
            this.clearCache();
        },

        setGenre(genre: string): void {
            _activeGenre = genre;
        },

        getGenre(): string {
            return _activeGenre;
        },

        setSearchQuery(query: string): void {
            _searchQuery = query.toLowerCase().trim();
        },

        getSearchQuery(): string {
            return _searchQuery;
        },

        getLanguage(): Language {
            return _currentLang;
        },

        setLanguage(lang?: Language): Language {
            if (lang) {
                _currentLang = lang === 'en' ? 'en' : 'es';
            } else {
                _currentLang = _currentLang === 'es' ? 'en' : 'es';
            }
            this.clearCache();
            return _currentLang;
        },

        toggleFavorite(movieId: number): boolean {
            const numericId = Number(movieId);
            let isFav = false;
            if (_favorites.has(numericId)) {
                _favorites.delete(numericId);
                isFav = false;
            } else {
                _favorites.add(numericId);
                isFav = true;
            }
            this.clearCache();
            return isFav;
        },

        isFavorite(movieId: number): boolean {
            return _favorites.has(Number(movieId));
        },

        getFavoritesCount(): number {
            return _favorites.size;
        },

        getMovieById(movieId: number): Movie | undefined {
            return _movies.find(movie => movie.id === Number(movieId));
        },

        clearCache(): void {
            Object.keys(_genreCache).forEach(key => delete _genreCache[key]);
            console.log("🧹 [CLOSURE CACHE] Caché privado en memoria purgado.");
        },

        getCacheKeys(): string[] {
            return Object.keys(_genreCache);
        },

        getFilteredMovies(): Movie[] {
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
                } else if (_activeGenre !== 'all') {
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
