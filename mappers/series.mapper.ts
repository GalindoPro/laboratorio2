import { SeriesDTO } from '../dtos/series.dto.js';
import { Series } from '../entities/media.entity.js';

/**
 * Mapper adaptador para la entidad Series.
 * Sanea payloads incompletos tipo Partial<SeriesDTO> asignando valores de fallback seguros.
 */
export function mapSeriesDTOToEntity(dto: Partial<SeriesDTO>, lang: 'es' | 'en' = 'es'): Series {
    const isEn = lang === 'en';

    const title = isEn 
        ? (dto.title_en || dto.title_es || 'Serie sin título') 
        : (dto.title_es || dto.title_en || 'Serie sin título');

    const genre = isEn 
        ? (dto.genre_en || dto.genre_es || 'Drama') 
        : (dto.genre_es || dto.genre_en || 'Drama');

    const synopsis = isEn 
        ? (dto.synopsis_en || dto.synopsis_es || 'Sin sinopsis de la serie disponible.') 
        : (dto.synopsis_es || dto.synopsis_en || 'Sin sinopsis de la serie disponible.');

    return {
        id: dto.id ?? `series-${Math.floor(Math.random() * 100000)}`,
        title,
        genre,
        genreKey: dto.genreKey || 'drama',
        year: dto.year || new Date().getFullYear(),
        rating: typeof dto.rating === 'number' && !isNaN(dto.rating) ? dto.rating : 0.0,
        poster: dto.poster || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80',
        synopsis,
        seasons: dto.seasons || 1,
        episodes: dto.episodes || 10,
        type: 'series'
    };
}

export function mapSeriesDTOArrayToEntities(dtos: Partial<SeriesDTO>[], lang: 'es' | 'en' = 'es'): Series[] {
    if (!Array.isArray(dtos)) return [];
    return dtos.map(dto => mapSeriesDTOToEntity(dto, lang));
}
