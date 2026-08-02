import { MovieDTO } from '../dtos/movie.dto.js';
import { ReviewDTO } from '../dtos/review.dto.js';
import { AdDTO } from '../dtos/ad.dto.js';
import { fetchMoviesService } from './movie.service.js';
import { fetchReviewsService } from './review.service.js';
import { fetchAdsService } from './ad.service.js';

export interface RawPayloadResults {
    moviesResult: PromiseSettledResult<MovieDTO[]>;
    reviewsResult: PromiseSettledResult<ReviewDTO[]>;
    adsResult: PromiseSettledResult<AdDTO>;
}

/**
 * Servicio Orquestador - Concurrencia resiliente con Promise.allSettled
 * Coordina la ejecución paralela de los tres servicios independientes.
 */
export async function fetchAllServices(simulateReviewFail: boolean = false, simulateAdFail: boolean = false): Promise<RawPayloadResults> {
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
