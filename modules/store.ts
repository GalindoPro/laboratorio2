/**
 * ============================================================================
 * MÓDULO STORE - GESTIÓN DE ESTADO Y CATALOGO MEDIANTE REPOSITORIO GENÉRICO
 * ----------------------------------------------------------------------------
 * Utiliza DataCatalogManager<MediaItem> como repositorio genérico en memoria,
 * soportando películas (Movie), series (Series) y documentales (Documentary).
 * Incluye persistencia de favoritos mediante localStorage.
 * ============================================================================
 */

import { MediaItem, Movie } from '../entities/media.entity.js';
import { DataCatalogManager } from '../services/data-catalog-manager.js';
import { Language } from './i18n.js';

const FAVORITES_STORAGE_KEY = 'cineverse_favorites_v1';
const LANG_STORAGE_KEY = 'cineverse_lang_v1';

function loadFavoritesFromStorage(): Set<string> {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return new Set(parsed.map(id => String(id)));
            }
        }
    } catch (e) {
        console.warn('⚠️ [Store] Error al cargar favoritos desde localStorage:', e);
    }
    return new Set<string>();
}

function saveFavoritesToStorage(favorites: Set<string>): void {
    try {
        const arrayData = Array.from(favorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(arrayData));
    } catch (e) {
        console.warn('⚠️ [Store] Error al guardar favoritos en localStorage:', e);
    }
}

function loadLangFromStorage(): Language {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'en' || saved === 'es') return saved;
    } catch (e) {
        console.warn('⚠️ [Store] Error al cargar idioma desde localStorage:', e);
    }
    return 'es';
}

function saveLangToStorage(lang: Language): void {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
        console.warn('⚠️ [Store] Error al guardar idioma en localStorage:', e);
    }
}

export interface MediaStore {
    catalog: DataCatalogManager<MediaItem>;
    setMediaItems(items: MediaItem[]): void;
    addMediaItem(item: MediaItem): void;
    updateMediaPartial(id: string | number, changes: Partial<MediaItem>): MediaItem | undefined;
    setGenre(genre: string): void;
    getGenre(): string;
    setTypeFilter(type: 'all' | 'movie' | 'series' | 'documentary'): void;
    getTypeFilter(): string;
    setSearchQuery(query: string): void;
    getSearchQuery(): string;
    getLanguage(): Language;
    setLanguage(lang?: Language): Language;
    toggleFavorite(id: string | number): boolean;
    isFavorite(id: string | number): boolean;
    getFavoritesCount(): number;
    getById(id: string | number): MediaItem | undefined;
    clearCache(): void;
    getCacheKeys(): string[];
    getFilteredItems(): MediaItem[];
    getFilteredMovies(): Movie[]; // Retrocompatibilidad
}

/**
 * Fabrica el Store central de estado encapsulando los datos y el Repositorio Genérico.
 */
export function createMediaStore(): MediaStore {
    const catalog = new DataCatalogManager<MediaItem>();
    let _activeGenre: string = 'all';
    let _activeType: 'all' | 'movie' | 'series' | 'documentary' = 'all';
    let _searchQuery: string = '';
    let _currentLang: Language = loadLangFromStorage();
    const _favorites: Set<string> = loadFavoritesFromStorage();

    // 💾 CACHÉ PRIVADO EN MEMORIA
    const _cache: Record<string, MediaItem[]> = {};

    return {
        catalog,

        setMediaItems(items: MediaItem[]): void {
            catalog.clear();
            catalog.addMany(items);
            this.clearCache();
        },

        addMediaItem(item: MediaItem): void {
            catalog.add(item);
            this.clearCache();
        },

        updateMediaPartial(id: string | number, changes: Partial<MediaItem>): MediaItem | undefined {
            const updated = catalog.update(id, changes);
            if (updated) {
                this.clearCache();
            }
            return updated;
        },

        setGenre(genre: string): void {
            _activeGenre = genre;
        },

        getGenre(): string {
            return _activeGenre;
        },

        setTypeFilter(type: 'all' | 'movie' | 'series' | 'documentary'): void {
            _activeType = type;
        },

        getTypeFilter(): string {
            return _activeType;
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
            saveLangToStorage(_currentLang);
            this.clearCache();
            return _currentLang;
        },

        toggleFavorite(id: string | number): boolean {
            const key = String(id);
            let isFav = false;
            if (_favorites.has(key)) {
                _favorites.delete(key);
                isFav = false;
            } else {
                _favorites.add(key);
                isFav = true;
            }
            saveFavoritesToStorage(_favorites);
            this.clearCache();
            return isFav;
        },

        isFavorite(id: string | number): boolean {
            const key = String(id);
            return _favorites.has(key);
        },

        getFavoritesCount(): number {
            return _favorites.size;
        },

        getById(id: string | number): MediaItem | undefined {
            return catalog.getById(id);
        },

        clearCache(): void {
            Object.keys(_cache).forEach(key => delete _cache[key]);
            console.log("🧹 [CATALOG CACHE] Caché de catálogo purgado.");
        },

        getCacheKeys(): string[] {
            return Object.keys(_cache);
        },

        getFilteredItems(): MediaItem[] {
            const cacheKey = `${_activeGenre}_${_activeType}_${_currentLang}`;

            if (_searchQuery === '' && _cache[cacheKey]) {
                return _cache[cacheKey];
            }

            const items = catalog.filter(item => {
                const itemKey = String(item.id);

                // Filtro por tipo (movie, series, documentary)
                if (_activeType !== 'all' && item.type !== _activeType) {
                    return false;
                }

                // Filtro por género o favoritos
                if (_activeGenre === 'favorites') {
                    if (!_favorites.has(itemKey)) return false;
                } else if (_activeGenre !== 'all') {
                    if (item.genreKey !== _activeGenre && item.genre !== _activeGenre) return false;
                }

                // Filtro por término de búsqueda
                if (_searchQuery !== '') {
                    const title = item.title.toLowerCase();
                    const synopsis = item.synopsis.toLowerCase();
                    if (!title.includes(_searchQuery) && !synopsis.includes(_searchQuery)) {
                        return false;
                    }
                }

                return true;
            });

            if (_searchQuery === '') {
                _cache[cacheKey] = items;
            }

            return items;
        },

        getFilteredMovies(): Movie[] {
            return this.getFilteredItems().filter((item): item is Movie => item.type === 'movie');
        }
    };
}
