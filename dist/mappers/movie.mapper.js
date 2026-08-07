/**
 * Mapper adaptador robusto para la entidad Movie.
 * Acepta DTOs potencialmente parciales/incompletos (Partial<MovieDTO>) provenientes de la red
 * y garantiza una entidad Movie blindada con valores por defecto de negocio.
 *
 * @param dto Payload crudo del backend (parcial o completo)
 * @param lang Idioma seleccionado ('es' | 'en')
 * @returns Entidad Movie formateada y segura
 */
export function mapMovieDTOToEntity(dto, lang = 'es') {
    const isEn = lang === 'en';
    const title = isEn
        ? (dto.title_en || dto.title_es || 'Sin título')
        : (dto.title_es || dto.title_en || 'Sin título');
    const genre = isEn
        ? (dto.genre_en || dto.genre_es || 'Acción')
        : (dto.genre_es || dto.genre_en || 'Acción');
    const synopsis = isEn
        ? (dto.synopsis_en || dto.synopsis_es || 'Sin sinopsis disponible.')
        : (dto.synopsis_es || dto.synopsis_en || 'Sin sinopsis disponible.');
    return {
        id: dto.id ?? Math.floor(Math.random() * 100000),
        title,
        genre,
        genreKey: dto.genreKey || 'action',
        year: dto.year || new Date().getFullYear(),
        rating: typeof dto.rating === 'number' && !isNaN(dto.rating) ? dto.rating : 0.0,
        director: dto.director || 'Director no especificado',
        poster: dto.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        synopsis,
        type: 'movie'
    };
}
/**
 * Mapeador de arreglos de DTOs de Películas a Entidades de Dominio saneadas
 */
export function mapMovieDTOArrayToEntities(dtos, lang = 'es') {
    if (!Array.isArray(dtos))
        return [];
    return dtos.map(dto => mapMovieDTOToEntity(dto, lang));
}
