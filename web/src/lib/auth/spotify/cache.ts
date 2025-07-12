import { createCache } from "async-cache-dedupe";

import { getSpotifyAccessToken } from "./tokens";

const cache = createCache({
  ttl: 3300,
  stale: 0,
});

export const spotifyCache = cache.define(
  "accessToken",
  async (userId: string) => {
    return await getSpotifyAccessToken(userId);
  }
);
