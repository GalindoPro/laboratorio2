/**
 * DTO (Data Transfer Object) - Estructura cruda del servicio de Películas
 * Representa la respuesta tal y como viene de la API/Backend.
 */
export interface MovieDTO {
    id: number;
    title_es: string;
    title_en: string;
    genre_es: string;
    genre_en: string;
    genreKey: string;
    year: number;
    rating: number;
    director: string;
    poster: string;
    synopsis_es: string;
    synopsis_en: string;
}
