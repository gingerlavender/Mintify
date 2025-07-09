import { NextResponse } from "next/server";
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  BaseError,
} from "viem";

export function handleViemErrors(error: unknown) {
  if (error instanceof ContractFunctionExecutionError) {
    return NextResponse.json(
      { error: "Contract function execution failed" },
      { status: 400 }
    );
  }

  if (error instanceof ContractFunctionRevertedError) {
    return NextResponse.json(
      { error: "Contract function reverted" },
      { status: 400 }
    );
  }

  if (error instanceof BaseError) {
    return NextResponse.json(
      { error: "On-chain interaction failed" },
      { status: 400 }
    );
  }

  return undefined;
}
