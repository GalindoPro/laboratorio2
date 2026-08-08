/**
 * DTO (Data Transfer Object) - Estructura cruda del servicio de Reseñas
 * Representa la respuesta sin procesar del microservicio de reseñas de usuarios.
 */
export interface ReviewDTO {
    id: number;
    movie_id: number;
    user: string;
    avatar: string;
    rating: number;
    comment_es: string;
    comment_en: string;
    date: string;
}
