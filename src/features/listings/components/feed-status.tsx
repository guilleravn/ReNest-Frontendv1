import { getFeed } from "../api";
import { getFeedAnnouncement } from "../feed-announcement";

type FeedStatusProps = {
  /** Title search, already normalized by `parseSearchQuery` ("" = no search). */
  q: string;
};

/**
 * Text of the feed's persistent status region (see the feed page). Same request as
 * `FeedResults`: `getFeed` is memoized per request, so this costs no extra backend call.
 */
export async function FeedStatus({ q }: FeedStatusProps) {
  return getFeedAnnouncement(q, await getFeed({ q }));
}
