import { apiRequest } from "../api/requests";
import { AuthError, RequestError } from "../errors";

interface SpotifyTopItemsResponse {
  items: { name: string }[];
}

export const fetchSpotifyData = async (spotifyAccessToken: string) => {
  if (!spotifyAccessToken) {
    throw new AuthError("Missing Spotify access token");
  }

  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${spotifyAccessToken}`,
  };

  const artistsResult = await apiRequest<SpotifyTopItemsResponse>(
    "https://api.spotify.com/v1/me/top/artists?limit=5",
    { headers }
  );
  if (!artistsResult.success) {
    throw new RequestError(artistsResult.error);
  }

  const tracksResult = await apiRequest<SpotifyTopItemsResponse>(
    "https://api.spotify.com/v1/me/top/tracks?limit=5",
    { headers }
  );
  if (!tracksResult.success) {
    throw new RequestError(tracksResult.error);
  }

  const artistNames = artistsResult.data.items.map((artist) => artist.name);
  const trackNames = tracksResult.data.items.map((track) => track.name);

  return { artists: artistNames, tracks: trackNames };
};
