import { HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'

function toMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/** Every callable function's code path funnels through here: an HttpsError thrown
 *  deliberately is passed through as-is, and anything unexpected gets logged (so it's
 *  visible in Cloud Logging even though the client only ever sees a short message) and
 *  turned into an HttpsError so it never reaches the client as a bare, message-less
 *  crash. */
export function toHttpsError(err: unknown, fallback: string): HttpsError {
  if (err instanceof HttpsError) return err
  logger.error(fallback, err)
  return new HttpsError('internal', toMessage(err, fallback))
}
