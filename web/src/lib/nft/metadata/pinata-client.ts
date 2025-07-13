import { PinataSDK } from "pinata";

export const pinataGateway = "https://crimson-bitter-horse-871.mypinata.cloud";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway,
});
