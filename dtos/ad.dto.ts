/**
 * DTO (Data Transfer Object) - Estructura cruda del servicio de Anuncios / Publicidad
 * Representa la respuesta sin procesar del microservicio promocional.
 */
export interface AdDTO {
    id: number;
    title_es: string;
    title_en: string;
    image_url: string;
    click_url: string;
    badge_es: string;
    badge_en: string;
    description_es: string;
    description_en: string;
}
