import { fetchMoviesService } from './movie.service.js';
import { fetchReviewsService } from './review.service.js';
import { fetchAdsService } from './ad.service.js';
/**
 * Servicio Orquestador - Concurrencia resiliente con Promise.allSettled
 * Coordina la ejecución paralela de los tres servicios independientes.
 */
export async function fetchAllServices(simulateReviewFail = false, simulateAdFail = false) {
    console.log("🚀 [OrchestratorService] Ejecutando Promise.allSettled en paralelo...");
    const [moviesResult, reviewsResult, adsResult] = await Promise.allSettled([
        fetchMoviesService(),
        fetchReviewsService(simulateReviewFail),
        fetchAdsService(simulateAdFail)
    ]);
    return {
        moviesResult,
        reviewsResult,
        adsResult
    };
}
