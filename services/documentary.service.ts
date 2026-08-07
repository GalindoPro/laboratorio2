import { DocumentaryDTO } from '../dtos/documentary.dto.js';

/**
 * Servicio de Documentales - Proporciona payloads crudos bilingües
 * Contiene intencionalmente payloads incompletos para verificar los Utility Types y Fallbacks.
 */
export async function fetchDocumentariesService(): Promise<DocumentaryDTO[]> {
    return [
        {
            id: 'doc-201',
            title_es: 'Nuestro Planeta',
            title_en: 'Our Planet',
            genre_es: 'Documental',
            genre_en: 'Documentary',
            genreKey: 'Drama',
            year: 2019,
            rating: 9.3,
            poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            synopsis_es: 'Experimenta la belleza natural de nuestro planeta y examina cómo el cambio climático afecta a todas las criaturas.',
            synopsis_en: 'Experience our planet\'s natural beauty and examine how climate change impacts all living creatures.',
            topic_es: 'Naturaleza & Biodiversidad',
            topic_en: 'Nature & Biodiversity',
            narrator: 'David Attenborough'
        },
        {
            // DTO INCOMPLETO PARA PROBAR FALLBACKS DE MAPPER
            id: 'doc-202',
            title_es: 'Maravillas del Cosmos',
            title_en: 'Wonders of the Cosmos',
            genreKey: 'Ciencia Ficción'
        }
    ];
}
