/**
 * DTO (Data Transfer Object) - Estructura cruda del servicio de Series.
 * Payload de red expuesto a inconsistencias (campos opcionales o nulos).
 */
export interface SeriesDTO {
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
    seasons?: number;
    episodes?: number;
}
