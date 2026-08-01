/**
 * Mapper adaptador puro para la entidad Movie.
 * Transforma un DTO crudo de la API en una entidad saneada para la interfaz de usuario.
 *
 * @param dto Payload crudo del backend
 * @param lang Idioma seleccionado ('es' | 'en')
 * @returns Entidad Movie formateada y segura
 */
export function mapMovieDTOToEntity(dto, lang = 'es') {
    const isEn = lang === 'en';
    return {
        id: dto.id || 0,
        title: (isEn ? dto.title_en : dto.title_es) || dto.title_es || 'Sin título',
        genre: (isEn ? dto.genre_en : dto.genre_es) || dto.genre_es || 'General',
        genreKey: dto.genreKey || 'all',
        year: dto.year || new Date().getFullYear(),
        rating: typeof dto.rating === 'number' ? dto.rating : 0.0,
        director: dto.director || 'Desconocido',
        poster: dto.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        synopsis: (isEn ? dto.synopsis_en : dto.synopsis_es) || dto.synopsis_es || 'Sin sinopsis disponible.'
    };
}
/**
 * Mapeador de arreglos de DTOs de Películas a Entidades
 */
export function mapMovieDTOArrayToEntities(dtos, lang = 'es') {
    if (!Array.isArray(dtos))
        return [];
    return dtos.map(dto => mapMovieDTOToEntity(dto, lang));
}
