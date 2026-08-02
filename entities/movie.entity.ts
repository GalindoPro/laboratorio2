/**
 * Modelo de Dominio Limpio (Entidad Movie)
 * Datos saneados y adaptados para el consumo de la UI y el Store de la app.
 */
export interface Movie {
    id: number;
    title: string;
    genre: string;
    genreKey: string;
    year: number;
    rating: number;
    director: string;
    poster: string;
    synopsis: string;
}
