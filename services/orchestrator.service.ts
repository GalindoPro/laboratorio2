import { MovieDTO } from '../dtos/movie.dto.js';
import { SeriesDTO } from '../dtos/series.dto.js';
import { DocumentaryDTO } from '../dtos/documentary.dto.js';
import { ReviewDTO } from '../dtos/review.dto.js';
import { AdDTO } from '../dtos/ad.dto.js';

import { fetchMoviesService } from './movie.service.js';
import { fetchSeriesService } from './series.service.js';
import { fetchDocumentariesService } from './documentary.service.js';
import { fetchReviewsService } from './review.service.js';
import { fetchAdsService } from './ad.service.js';

export interface RawPayloadResults {
    moviesResult: PromiseSettledResult<MovieDTO[]>;
    seriesResult: PromiseSettledResult<SeriesDTO[]>;
    documentariesResult: PromiseSettledResult<DocumentaryDTO[]>;
    reviewsResult: PromiseSettledResult<ReviewDTO[]>;
    adsResult: PromiseSettledResult<AdDTO>;
}

/**
 * Servicio Orquestador - Concurrencia resiliente con Promise.allSettled
 * Coordina la ejecución paralela de los servicios multimedia, reseñas y publicidad.
 */
export async function fetchAllServices(
    simulateReviewFail: boolean = false, 
    simulateAdFail: boolean = false
): Promise<RawPayloadResults> {
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
