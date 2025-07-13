import { NFTMetadata } from "@/types/nft/metadata";

import { User } from "@/generated/prisma";

import { pinata, pinataGateway } from "./pinata-client";
import { generateSpotifyBasedMetadata } from "./generation";
import { parsePinataError } from "../../errors";
import { getSpotifyAccessToken } from "@/lib/spotify/tokens";

type PinataStoredDataType = "metadata" | "picture";

const METADATA_SUFFIX = "Metadata.json" as const;
const IMAGE_SUFFIX = "Image.png";

export const generateAndUploadSpotifyBasedMetadata = async (user: User) => {
  const spotifyAccessToken = await getSpotifyAccessToken(user.id);

  const { imageBuffer, description } =
    await generateSpotifyBasedMetadata(spotifyAccessToken);

  try {
    const image = await uploadImageToIPFS(user, imageBuffer);

    const metadata: NFTMetadata = {
      name: "Mintify NFT",
      description,
      image: buildPinataURL(image),
    };

    const upload = await pinata.upload.public
      .json(metadata)
      .name(`${user.name}${METADATA_SUFFIX}`)
      .keyvalues({ userId: user.id, type: "metadata" });

    await deleteOutdatedData(user, {
      actualCid: upload.cid,
      type: "metadata",
    });

    return upload.cid;
  } catch (error) {
    const e = parsePinataError(error);
    throw e;
  }
};

const uploadImageToIPFS = async (
  user: User,
  imageBuffer: Buffer<ArrayBuffer>
) => {
  const blob = new Blob([imageBuffer]);
  const file = new File([blob], `${user.name}${IMAGE_SUFFIX}`, {
    type: "image/png",
  });

  const upload = await pinata.upload.public
    .file(file)
    .keyvalues({ userId: user.id, type: "picture" });

  await deleteOutdatedData(user, {
    actualCid: upload.cid,
    type: "picture",
  });

  return upload.cid;
};

const deleteOutdatedData = async (
  user: User,
  { actualCid, type }: { actualCid: string; type: PinataStoredDataType }
) => {
  const files = await pinata.files.public
    .list()
    .keyvalues({ userId: user.id, type });
  const oldFiles = files.files.filter((file) => file.cid !== actualCid);
  const oldFilesIds = oldFiles.map((file) => file.id);

  if (oldFilesIds.length > 0) {
    await pinata.files.public.delete(oldFilesIds);
  }
};

const buildPinataURL = (cid: string) => {
  return `${pinataGateway}/ipfs/${cid}`;
};
