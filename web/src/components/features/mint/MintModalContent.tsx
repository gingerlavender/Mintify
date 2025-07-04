"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  MintMessageWithSignature,
  MintStatus,
  MintStatusInfo,
} from "@/types/mint";
import { useLoading } from "@/hooks/useLoading";
import { apiRequest } from "@/lib/api";
import {
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";
import { assertValidAddress } from "@/lib/validation";
import { parseEther, parseEventLogs, TransactionReceipt } from "viem";

const messages: Record<MintStatus, string> = {
  not_minted:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  minted:
    "You can see yout current NFT below. Remember that you can remint it any time!",
  token_transferred:
    "Here is your minted NFT, but you cannot remint anymore as it has been transferred.",
};

const MintModalContent = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  const chainId = useChainId();

  const { isLoading, startLoading, endLoading } = useLoading(true);

  const [message, setMessage] = useState<string | undefined>();
  const [picture, setPicture] = useState<string>("NFTPlaceholder.png");
  const [price, setPrice] = useState<number | undefined>();
  const [canMint, setCanMint] = useState<boolean>(true);
  const [tokenId, setTokenId] = useState<string | undefined>();

  const handleMint = async () => {
    try {
      if (!price) {
        throw new Error("Missing price");
      }

      const result = await apiRequest<MintMessageWithSignature>("api/mint", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ type: "mint", chainId }),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const mintifyAddress = assertValidAddress(
        process.env.NEXT_PUBLIC_MINTIFY_ADDRESS
      );

      writeContract({
        address: mintifyAddress,
        abi: mintifyAbi,
        functionName: "safeMintWithSignature",
        args: [
          result.data.tokenURI,
          Number(result.data.v),
          result.data.r,
          result.data.s,
        ],
        value: parseEther(price.toString()),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unknown error");
      setPicture("Error.png");
    }
  };

  const handleMintTxSuccess = (receipt: TransactionReceipt) => {
    try {
      const logs = parseEventLogs({
        abi: mintifyAbi,
        logs: receipt.logs,
        eventName: "Minted",
      });

      if (logs.length == 0) {
        throw new Error("Could not find Minted event in transaction logs");
      }

      const mintEvent = logs[0];

      const mintedTokenId = mintEvent.args._tokenId;
      const tokenURI = mintEvent.args._tokenURI;

      if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
        throw new Error(
          "Cannot show your NFT as there is no gateway specified. Try reopening window please"
        );
      }

      setTokenId(mintedTokenId.toString());
      setMessage("Here is your brand new NFT!");
      setPicture(process.env.NEXT_PUBLIC_PINATA_GATEWAY?.concat(tokenURI));

      setCanMint(false);
      setPrice(undefined);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unknown error");
      setPicture("Error.png");
    }
  };

  useEffect(() => {
    if (receipt && isSuccess) {
      handleMintTxSuccess(receipt);
    }
  }, [receipt, isSuccess]);

  useEffect(() => {
    (async () => {
      startLoading();

      const result = await apiRequest<MintStatusInfo>("api/mint/status", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ chainId }),
      });

      if (result.success) {
        setMessage(messages[result.data.mintStatus]);

        if (result.data.mintStatus != "token_transferred") {
          setPrice(result.data.nextPrice);
        } else {
          setCanMint(false);
        }

        if (
          result.data.mintStatus == "minted" ||
          result.data.mintStatus == "token_transferred"
        ) {
          setPicture(result.data.tokenURI);
        }
      } else {
        setMessage(result.error);
        setPicture("Error.png");
      }

      endLoading();
    })();
  }, [chainId, startLoading, endLoading]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>{message}</p>
      {tokenId && `Your minted NFT Id is ${tokenId}`}
      {price && <p>Your current mint price (without fees): {price} ETH</p>}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={picture}
        alt="NFT Preview"
      />
      <div className="flex justify-center gap-4">
        {canMint && (
          <button
            disabled={isPending}
            className="modal-button"
            onClick={handleMint}
          >
            {isPending ? "Pending..." : "Mint"}
          </button>
        )}
      </div>
    </>
  );
};

export default MintModalContent;
