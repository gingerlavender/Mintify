import { AuthError } from "../errors";

export const generateSpotifyBasedImage = (spotifyAccessToken: string) => {
  if (!spotifyAccessToken) {
    throw new AuthError("Missing Spotify access token");
  }

  return "bafkreib2imobphpiera2ldobkxdcfij4e7clkc3z7ftghwsng357t4gdka";
};
