import OpenAI from "openai";

import { fetchSpotifyData } from "../../spotify/api";
import { RequestError } from "../../errors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const generateSpotifyBasedMetadata = async (
  spotifyAccessToken: string
) => {
  const { artists, tracks } = await fetchSpotifyData(spotifyAccessToken);

  if (artists.length < 5 || tracks.length < 5) {
    throw new RequestError("Not enough Spotify data to generate image");
  }

  const imageBuffer = await generateSpotifyBasedImage(artists, tracks);
  const description = generateSpotifyBasedDescription(artists);

  return { imageBuffer, description };
};

export const generateSpotifyBasedImage = async (
  artists: string[],
  tracks: string[]
) => {
  const prompt = getPrompt(artists, tracks);

  const img = await openai.images.generate({
    model: "gpt-image-1",
    size: "1024x1024",
    quality: "medium",
    prompt,
  });

  if (!img.data || !img.data[0].b64_json) {
    throw new RequestError("Cannot generate image successfully");
  }

  const imageBase64 = img.data[0].b64_json;
  const imageBuffer = Buffer.from(imageBase64, "base64");

  return imageBuffer;
};

export const generateSpotifyBasedDescription = (artists: string[]) => {
  return `Personalized NFT for a devoted fan of ${artists.slice(0, 2).join(", ")} and ${artists[2]}.`;
};

const getPrompt = (artists: string[], tracks: string[]) => {
  return `
    You have very creative task: based on given person's taste in music,
    you'll need to reflect that aesthetics. Exactly aesthetics: you must not generate
    human profile to portrait that person, but you can still add people to image if it is
    justified by provided music. Add some elegant references to artists, tracks or genres: 
    try to create at least 1-2 for every artist. You can use symbolics, logos and album covers,
    but not too much and obvious: references to themes in music, artists biography, 
    genres history and related music instruments are much more appreciated. 
    It is extremely important to not turn picture into simple compilation of artists and track names.
    If possible, avoid using them at all. Also you can do some stylization: 
    VERY carefully borrow some features from corresponding identics. 
    Try to unite all gracefully and end up creating holistic picture. 
    Further you can see person's specific music preferences, 
    which are sorted by number of plays. 
    Favourite artists: ${artists.join(", ")}.
    Favourite tracks: ${tracks.join(", ")}.
  `;
};
