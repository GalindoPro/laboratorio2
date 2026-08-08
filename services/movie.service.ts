import { MovieDTO } from '../dtos/movie.dto.js';

const TMDB_API_KEY = 'b4f58365d784a4e9883e58dc4cfc55f4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP: Record<number, { es: string; en: string; key: string }> = {
    28: { es: "Acción", en: "Action", key: "Acción" },
    12: { es: "Aventura", en: "Adventure", key: "Acción" },
    16: { es: "Animación", en: "Animation", key: "Animación" },
    35: { es: "Comedia", en: "Comedy", key: "Drama" },
    80: { es: "Crimen", en: "Crime", key: "Drama" },
    99: { es: "Documental", en: "Documentary", key: "Drama" },
    18: { es: "Drama", en: "Drama", key: "Drama" },
    10751: { es: "Familia", en: "Family", key: "Animación" },
    14: { es: "Fantasía", en: "Fantasy", key: "Ciencia Ficción" },
    36: { es: "Historia", en: "History", key: "Drama" },
    27: { es: "Terror", en: "Horror", key: "Drama" },
    10402: { es: "Música", en: "Music", key: "Drama" },
    9648: { es: "Misterio", en: "Mystery", key: "Drama" },
    10749: { es: "Romance", en: "Romance", key: "Drama" },
    878: { es: "Ciencia Ficción", en: "Sci-Fi", key: "Ciencia Ficción" },
    10770: { es: "Película de TV", en: "TV Movie", key: "Drama" },
    53: { es: "Suspenso", en: "Thriller", key: "Acción" },
    10752: { es: "Bélica", en: "War", key: "Acción" },
    37: { es: "Oeste", en: "Western", key: "Acción" }
};

interface TMDBMovieResult {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
}

interface TMDBResponse {
    results: TMDBMovieResult[];
}

/**
 * Servicio de Películas - Consume la API oficial de TMDB
 */
export async function fetchMoviesService(): Promise<MovieDTO[]> {
    try {
        console.log("🌐 [MovieService] Consultando API de TMDB...");
        const urlEs = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-MX&page=1`;
        const urlEn = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

        const [resEs, resEn] = await Promise.all([
            fetch(urlEs),
            fetch(urlEn)
        ]);

        if (!resEs.ok || !resEn.ok) {
            throw new Error(`Error HTTP TMDB: ${resEs.status}`);
        }

        const dataEs: TMDBResponse = await resEs.json();
        const dataEn: TMDBResponse = await resEn.json();

        const moviesEnMap = new Map<number, TMDBMovieResult>();
        dataEn.results.forEach(m => moviesEnMap.set(m.id, m));

        return dataEs.results.map(movieEs => {
            const movieEn = moviesEnMap.get(movieEs.id);
            const primaryGenreId = movieEs.genre_ids && movieEs.genre_ids.length > 0 ? movieEs.genre_ids[0] : 878;
            const genreInfo = GENRE_MAP[primaryGenreId] || { es: "General", en: "General", key: "all" };
            const releaseYear = movieEs.release_date ? parseInt(movieEs.release_date.split('-')[0], 10) : 2026;
            const posterUrl = movieEs.poster_path ? `${TMDB_IMAGE_BASE}${movieEs.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

            return {
                id: movieEs.id,
                title_es: movieEs.title || 'Sin Título',
                title_en: movieEn?.title || movieEs.title || 'Untitled',
                genre_es: genreInfo.es,
                genre_en: genreInfo.en,
                genreKey: genreInfo.key,
                year: isNaN(releaseYear) ? 2026 : releaseYear,
                rating: movieEs.vote_average ? Number(movieEs.vote_average.toFixed(1)) : 0.0,
                director: "TMDB Popular",
                poster: posterUrl,
                synopsis_es: movieEs.overview || 'Sin sinopsis disponible.',
                synopsis_en: movieEn?.overview || movieEs.overview || 'No synopsis available.'
            };
        });
    } catch (error) {
        console.warn("⚠️ [MovieService] Error al conectar con TMDB:", error);
        return [];
    }
}
