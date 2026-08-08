/**
 * Mapper adaptador para la entidad Documentary.
 * Sanea payloads incompletos tipo Partial<DocumentaryDTO> asignando valores de fallback de negocio.
 */
export function mapDocumentaryDTOToEntity(dto, lang = 'es') {
    const isEn = lang === 'en';
    const title = isEn
        ? (dto.title_en || dto.title_es || 'Documental sin título')
        : (dto.title_es || dto.title_en || 'Documental sin título');
    const genre = isEn
        ? (dto.genre_en || dto.genre_es || 'Ciencia & Naturaleza')
        : (dto.genre_es || dto.genre_en || 'Ciencia & Naturaleza');
    const topic = isEn
        ? (dto.topic_en || dto.topic_es || 'Tema General')
        : (dto.topic_es || dto.topic_en || 'Tema General');
    const synopsis = isEn
        ? (dto.synopsis_en || dto.synopsis_es || 'Sin sinopsis disponible.')
        : (dto.synopsis_es || dto.synopsis_en || 'Sin sinopsis disponible.');
    return {
        id: dto.id ?? `doc-${Math.floor(Math.random() * 100000)}`,
        title,
        genre,
        genreKey: dto.genreKey || 'documentary',
        year: dto.year || new Date().getFullYear(),
        rating: typeof dto.rating === 'number' && !isNaN(dto.rating) ? dto.rating : 0.0,
        poster: dto.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        synopsis,
        topic,
        narrator: dto.narrator || 'Narrador no especificado',
        type: 'documentary'
    };
}
export function mapDocumentaryDTOArrayToEntities(dtos, lang = 'es') {
    if (!Array.isArray(dtos))
        return [];
    return dtos.map(dto => mapDocumentaryDTOToEntity(dto, lang));
}
