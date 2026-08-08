import { AdDTO } from '../dtos/ad.dto.js';
import { Ad } from '../entities/ad.entity.js';

/**
 * Mapper adaptador puro para la entidad Ad.
 * Sanea y adapta la publicidad devuelta por el microservicio 3.
 */
export function mapAdDTOToEntity(dto: AdDTO, lang: 'es' | 'en' = 'es'): Ad {
    const isEn = lang === 'en';

    return {
        id: dto.id || 0,
        title: (isEn ? dto.title_en : dto.title_es) || dto.title_es || 'Promoción Especial',
        imageUrl: dto.image_url || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
        clickUrl: dto.click_url || '#',
        badgeText: (isEn ? dto.badge_en : dto.badge_es) || dto.badge_es || 'Patrocinado',
        description: (isEn ? dto.description_en : dto.description_es) || dto.description_es || '¡Aprovecha nuestras ofertas exclusivas!'
    };
}

export function mapAdDTOArrayToEntities(dtos: AdDTO[], lang: 'es' | 'en' = 'es'): Ad[] {
    if (!Array.isArray(dtos)) return [];
    return dtos.map(dto => mapAdDTOToEntity(dto, lang));
}
