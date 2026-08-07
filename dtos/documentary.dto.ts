/**
 * DTO (Data Transfer Object) - Estructura cruda del servicio de Documentales.
 * Payload de red con posibles discrepancias o valores omitidos.
 */
export interface DocumentaryDTO {
    id?: number | string;
    title_es?: string;
    title_en?: string;
    genre_es?: string;
    genre_en?: string;
    genreKey?: string;
    year?: number;
    rating?: number;
    poster?: string;
    synopsis_es?: string;
    synopsis_en?: string;
    topic_es?: string;
    topic_en?: string;
    narrator?: string;
}
