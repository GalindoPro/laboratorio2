/**
 * Modelo de Dominio Limpio (Entidad Ad)
 * Datos saneados para la renderización del banner promocional.
 */
export interface Ad {
    id: number;
    title: string;
    imageUrl: string;
    clickUrl: string;
    badgeText: string;
    description: string;
}
