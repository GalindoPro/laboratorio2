import { MovieDTO } from './movie.dto.js';
import { ReviewDTO } from './review.dto.js';
import { AdDTO } from './ad.dto.js';

/**
 * Payload crudo consolidado retornado por la orquestación concurrente (Promise.allSettled)
 */
export interface ServicesPayloadDTO {
    moviesResult: PromiseSettledResult<MovieDTO[]>;
    reviewsResult: PromiseSettledResult<ReviewDTO[]>;
    adsResult: PromiseSettledResult<AdDTO[]>;
}
