import { NFTMetadata } from "@/types/nft/metadata";

import { User } from "@/generated/prisma";

import { pinata, pinataGateway } from "./pinata-client";
import { generateImage } from "../image/image-generation";
import { parsePinataError } from "../errors";

export const uploadNFTMetadata = async (user: User) => {
  const imageUrl = generateImage();

  try {
    const image = uploadImageToIPFS(imageUrl);

    const metadata: NFTMetadata = {
      name: "Mintify NFT",
      description: "Personal NFT based on your unique music taste",
      image,
    };
    const upload = await pinata.upload.public
      .json(metadata)
      .name(`${user.name}Metadata.json`)
      .keyvalues({ userId: user.id });

    const tokenURI = buildPinataURL(upload.cid);

    await deleteOutdatedNFTMetadata(user, { actualCid: upload.cid });

    return tokenURI;
  } catch (error) {
    const e = parsePinataError(error);
    throw e;
  }
};

const deleteOutdatedNFTMetadata = async (
  user: User,
  { actualCid }: { actualCid: string }
) => {
  const files = await pinata.files.public.list().keyvalues({ userId: user.id });
  const oldFiles = files.files.filter((file) => file.cid !== actualCid);
  const oldFilesIds = oldFiles.map((file) => file.id);

  if (oldFilesIds.length > 0) {
    await pinata.files.public.delete(oldFilesIds);
  }
};

const uploadImageToIPFS = (url: string) => {
  const cid = url;

  return buildPinataURL(cid);
};

const buildPinataURL = (cid: string) => {
  return `${pinataGateway}/ipfs/${cid}`;
};
