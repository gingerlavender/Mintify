import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from "viem";
import { BaseError } from "wagmi";
import { z } from "zod";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public statusCode = 403
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

export function handleCommonErrors(error: unknown) {
  if (
    error instanceof AuthError ||
    error instanceof ValidationError ||
    error instanceof PermissionError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Unexpected internal server error" },
    { status: 500 }
  );
}

export function handleDatabaseErrors(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "You have already saved your NFT or this token id is not unique",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return undefined;
}

export function handleContractErrors(error: unknown) {
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
