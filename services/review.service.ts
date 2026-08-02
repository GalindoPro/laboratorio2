import { ReviewDTO } from '../dtos/review.dto.js';

/**
 * Servicio de Reseñas - Microservicio secundario de comentarios de usuarios
 */
export function fetchReviewsService(simulateError: boolean = false): Promise<ReviewDTO[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (simulateError) {
                console.warn("⚠️ [ReviewService] 503 Service Unavailable (Simulado).");
                reject(new Error("503 Service Unavailable: Microservicio de Reseñas fuera de línea."));
            } else {
                console.log("✅ [ReviewService] Reseñas obtenidas correctamente.");
                resolve([
                    {
                        id: 1,
                        movie_id: 550,
                        user: "Carlos R.",
                        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
                        rating: 5,
                        comment_es: "¡Increíble catálogo en tiempo real desde la API de TMDB!",
                        comment_en: "Awesome live catalog from TMDB API!",
                        date: "2026-08-01"
                    },
                    {
                        id: 2,
                        movie_id: 278,
                        user: "Sofia M.",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                        rating: 5,
                        comment_es: "La arquitectura por capas con servicios y TypeScript es impecable.",
                        comment_en: "Layered architecture with services and TypeScript is spot on.",
                        date: "2026-08-01"
                    }
                ]);
            }
        }, 1000);
    });
}
