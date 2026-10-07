import { unstable_rethrow } from "next/navigation";

import { getFeed } from "../api";
import { getFeedAnnouncement } from "../feed-announcement";
import { FEED_ERROR_MESSAGE } from "../feed-copy";
import type { FeedResponse } from "../schemas";

type FeedStatusProps = {
  /** Title search, already normalized by `parseSearchQuery` ("" = no search). */
  q: string;
};

/**
 * Text of the feed's persistent status region (see the feed page). Same request as
 * `FeedResults`: `getFeed` is memoized per request, so this costs no extra backend call.
 *
 * A failed request is caught here, on the server, and announced as text: the visible error and
 * its "Reintentar" button belong to the results' error boundary. A client boundary here would stay
 * stuck on the error after a successful retry, since retrying only resets the results' boundary;
 * this text is recomputed on every refresh instead.
 */
export async function FeedStatus({ q }: FeedStatusProps) {
  let feed: FeedResponse;
  try {
    feed = await getFeed({ q });
  } catch (error) {
    unstable_rethrow(error);
    return FEED_ERROR_MESSAGE;
  }

  return getFeedAnnouncement(q, feed);
}
