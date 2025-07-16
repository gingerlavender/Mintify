import { NFTMetadata } from "@/types/nft/metadata";

import { User } from "@/generated/prisma";

import { pinata, pinataGateway } from "./pinata-client";
import { generateSpotifyBasedMetadata } from "./generation";
import { parsePinataError } from "../../errors";
import { getSpotifyAccessToken } from "@/lib/spotify/tokens";

const METADATA_SUFFIX = "Metadata.json" as const;
const IMAGE_SUFFIX = "Image.png";

export const generateAndUploadSpotifyBasedMetadata = async (user: User) => {
  const spotifyAccessToken = await getSpotifyAccessToken(user.id);

  const { imageBuffer, description } =
    await generateSpotifyBasedMetadata(spotifyAccessToken);

  try {
    const { imageCid, imageId } = await uploadImageToIPFS(user, imageBuffer);

    const metadata: NFTMetadata = {
      name: "Mintify NFT",
      description,
      image: buildPinataURL(imageCid),
    };

    const upload = await pinata.upload.public
      .json(metadata)
      .name(`${user.name}${METADATA_SUFFIX}`)
      .keyvalues({ userId: user.id, type: "metadata", imageId });

    return upload.cid;
  } catch (error) {
    const e = parsePinataError(error);
    throw e;
  }
};

export const deleteOutdatedData = async (
  user: User,
  { actualMetadataCid }: { actualMetadataCid: string }
) => {
  const metadataFiles = await pinata.files.public
    .list()
    .keyvalues({ userId: user.id, type: "metadata" });

  const oldMetadataFiles = metadataFiles.files.filter(
    (file) => file.cid !== actualMetadataCid
  );
  const oldMetadataFilesIds = oldMetadataFiles.map((file) => file.id);
  const oldImageFilesIds = oldMetadataFiles
    .map((file) => file.keyvalues.imageId)
    .filter(Boolean);

  console.log("Actual cid: ", actualMetadataCid);
  console.log("Old metadata files:", oldMetadataFiles);
  console.log("Extracted image IDs:", oldImageFilesIds);

  if (oldMetadataFilesIds.length > 0) {
    await pinata.files.public.delete(oldMetadataFilesIds);
  }
  if (oldImageFilesIds.length > 0) {
    await pinata.files.public.delete(oldImageFilesIds);
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

  return { imageCid: upload.cid, imageId: upload.id };
};

const buildPinataURL = (cid: string) => {
  return `${pinataGateway}/ipfs/${cid}`;
};
