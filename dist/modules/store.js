/**
 * ============================================================================
 * MÓDULO STORE - GESTIÓN DE ESTADO Y CATALOGO MEDIANTE REPOSITORIO GENÉRICO
 * ----------------------------------------------------------------------------
 * Utiliza DataCatalogManager<MediaItem> como repositorio genérico en memoria,
 * soportando películas (Movie), series (Series) y documentales (Documentary).
 * Incluye persistencia de favoritos mediante localStorage.
 * ============================================================================
 */
import { DataCatalogManager } from '../services/data-catalog-manager.js';
const FAVORITES_STORAGE_KEY = 'cineverse_favorites_v1';
const LANG_STORAGE_KEY = 'cineverse_lang_v1';
function loadFavoritesFromStorage() {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return new Set(parsed.map(id => String(id)));
            }
        }
    }
    catch (e) {
        console.warn('⚠️ [Store] Error al cargar favoritos desde localStorage:', e);
    }
    return new Set();
}
function saveFavoritesToStorage(favorites) {
    try {
        const arrayData = Array.from(favorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(arrayData));
    }
    catch (e) {
        console.warn('⚠️ [Store] Error al guardar favoritos en localStorage:', e);
    }
}
function loadLangFromStorage() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'en' || saved === 'es')
            return saved;
    }
    catch (e) {
        console.warn('⚠️ [Store] Error al cargar idioma desde localStorage:', e);
    }
    return 'es';
}
function saveLangToStorage(lang) {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
    catch (e) {
        console.warn('⚠️ [Store] Error al guardar idioma en localStorage:', e);
    }
}
/**
 * Fabrica el Store central de estado encapsulando los datos y el Repositorio Genérico.
 */
export function createMediaStore() {
    const catalog = new DataCatalogManager();
    let _activeGenre = 'all';
    let _activeType = 'all';
    let _searchQuery = '';
    let _currentLang = loadLangFromStorage();
    const _favorites = loadFavoritesFromStorage();
    // 💾 CACHÉ PRIVADO EN MEMORIA
    const _cache = {};
    return {
        catalog,
        setMediaItems(items) {
            catalog.clear();
            catalog.addMany(items);
            this.clearCache();
        },
        addMediaItem(item) {
            catalog.add(item);
            this.clearCache();
        },
        updateMediaPartial(id, changes) {
            const updated = catalog.update(id, changes);
            if (updated) {
                this.clearCache();
            }
            return updated;
        },
        setGenre(genre) {
            _activeGenre = genre;
        },
        getGenre() {
            return _activeGenre;
        },
        setTypeFilter(type) {
            _activeType = type;
        },
        getTypeFilter() {
            return _activeType;
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
            saveLangToStorage(_currentLang);
            this.clearCache();
            return _currentLang;
        },
        toggleFavorite(id) {
            const key = String(id);
            let isFav = false;
            if (_favorites.has(key)) {
                _favorites.delete(key);
                isFav = false;
            }
            else {
                _favorites.add(key);
                isFav = true;
            }
            saveFavoritesToStorage(_favorites);
            this.clearCache();
            return isFav;
        },
        isFavorite(id) {
            const key = String(id);
            return _favorites.has(key);
        },
        getFavoritesCount() {
            return _favorites.size;
        },
        getById(id) {
            return catalog.getById(id);
        },
        clearCache() {
            Object.keys(_cache).forEach(key => delete _cache[key]);
            console.log("🧹 [CATALOG CACHE] Caché de catálogo purgado.");
        },
        getCacheKeys() {
            return Object.keys(_cache);
        },
        getFilteredItems() {
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
                    if (!_favorites.has(itemKey))
                        return false;
                }
                else if (_activeGenre !== 'all') {
                    if (item.genreKey !== _activeGenre && item.genre !== _activeGenre)
                        return false;
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
        getFilteredMovies() {
            return this.getFilteredItems().filter((item) => item.type === 'movie');
        }
    };
}
