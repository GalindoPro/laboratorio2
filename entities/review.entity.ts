/**
 * Modelo de Dominio Limpio (Entidad Review)
 * Datos saneados para la renderización del widget de reseñas de usuarios.
 */
export interface Review {
    id: number;
    movieId: number;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
}
