import { fetchMoviesService } from './movie.service.js';
import { fetchSeriesService } from './series.service.js';
import { fetchDocumentariesService } from './documentary.service.js';
import { fetchReviewsService } from './review.service.js';
import { fetchAdsService } from './ad.service.js';
/**
 * Servicio Orquestador - Concurrencia resiliente con Promise.allSettled
 * Coordina la ejecución paralela de los servicios multimedia, reseñas y publicidad.
 */
export async function fetchAllServices(simulateReviewFail = false, simulateAdFail = false) {
    console.log("🚀 [OrchestratorService] Ejecutando solicitudes paralelas en el Orquestador...");
    const [moviesResult, seriesResult, documentariesResult, reviewsResult, adsResult] = await Promise.allSettled([
        fetchMoviesService(),
        fetchSeriesService(),
        fetchDocumentariesService(),
        fetchReviewsService(simulateReviewFail),
        fetchAdsService(simulateAdFail)
    ]);
    return {
        moviesResult,
        seriesResult,
        documentariesResult,
        reviewsResult,
        adsResult
    };
}
