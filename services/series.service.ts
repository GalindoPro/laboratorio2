import { SeriesDTO } from '../dtos/series.dto.js';

/**
 * Servicio de Series - Proporciona payloads crudos bilingües (simulando API externa)
 * Incluye intencionalmente DTOs con datos incompletos para probar la sanitización.
 */
export async function fetchSeriesService(): Promise<SeriesDTO[]> {
    return [
        {
            id: 'ser-101',
            title_es: 'Stranger Things',
            title_en: 'Stranger Things',
            genre_es: 'Ciencia Ficción',
            genre_en: 'Sci-Fi',
            genreKey: 'Ciencia Ficción',
            year: 2016,
            rating: 8.7,
            poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80',
            synopsis_es: 'A la búsqueda de un niño desaparecido, un pueblo descubre un misterio relacionado con experimentos secretos.',
            synopsis_en: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
            seasons: 4,
            episodes: 34
        },
        {
            id: 'ser-102',
            title_es: 'Breaking Bad',
            title_en: 'Breaking Bad',
            genre_es: 'Drama',
            genre_en: 'Drama',
            genreKey: 'Drama',
            year: 2008,
            rating: 9.5,
            poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
            synopsis_es: 'Un profesor de química con cáncer se asocia con un exalumno para fabricar metanfetamina.',
            synopsis_en: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.',
            seasons: 5,
            episodes: 62
        },
        {
            // DTO INCOMPLETO PARA PROBAR SANITIZACIÓN / FALLBACKS DE MAPPER
            id: 'ser-103',
            title_es: 'Serie Incompleta de Prueba',
            title_en: 'Incomplete Test Series',
            genreKey: 'Acción'
        }
    ];
}
