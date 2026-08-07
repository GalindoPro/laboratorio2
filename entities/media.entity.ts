/**
 * Contrato Base y Dominio Limpio para la Plataforma Multimedia
 * Jerarquía de tipos utilizando interfaces extensibles y utility types.
 */

export type MediaType = 'movie' | 'series' | 'documentary';

/**
 * Interfaz Base para cualquier contenido del catálogo multimedia.
 * Garantiza que toda entidad posea un identificador único (id) y atributos comunes.
 */
export interface MediaItem {
    id: number | string;
    title: string;
    genre: string;
    genreKey: string;
    year: number;
    rating: number;
    poster: string;
    synopsis: string;
    type: MediaType;
}

/**
 * Entidad de Dominio: Movie (Película)
 */
export interface Movie extends MediaItem {
    type: 'movie';
    director: string;
    durationMinutes?: number;
}

/**
 * Entidad de Dominio: Series (Serie)
 */
export interface Series extends MediaItem {
    type: 'series';
    seasons: number;
    episodes: number;
}

/**
 * Entidad de Dominio: Documentary (Documental)
 */
export interface Documentary extends MediaItem {
    type: 'documentary';
    topic: string;
    narrator?: string;
}

/**
 * Utility Types de Dominio
 * Representación recortada de una tarjeta de medios para componentes de interfaz.
 */
export type MediaCardSummary = Pick<MediaItem, 'id' | 'title' | 'rating' | 'poster' | 'type' | 'genre'>;

/**
 * Payload para creación rápida de contenido donde id o rating pueden ser opcionales
 */
export type CreateMediaPayload<T extends MediaItem> = Omit<T, 'id'> & Partial<Pick<T, 'id' | 'rating'>>;
