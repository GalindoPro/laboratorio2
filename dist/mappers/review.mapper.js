/**
 * Mapper adaptador puro para la entidad Review.
 * Sanea y adapta las reseñas de usuarios provenientes del microservicio 2.
 */
export function mapReviewDTOToEntity(dto, lang = 'es') {
    const isEn = lang === 'en';
    return {
        id: dto.id || 0,
        movieId: dto.movie_id || 0,
        user: dto.user || 'Usuario Anónimo',
        avatar: dto.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        rating: typeof dto.rating === 'number' ? dto.rating : 5.0,
        comment: (isEn ? dto.comment_en : dto.comment_es) || dto.comment_es || 'Sin comentario.',
        date: dto.date || new Date().toISOString().split('T')[0]
    };
}
export function mapReviewDTOArrayToEntities(dtos, lang = 'es') {
    if (!Array.isArray(dtos))
        return [];
    return dtos.map(dto => mapReviewDTOToEntity(dto, lang));
}
