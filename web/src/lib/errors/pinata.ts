import { NextResponse } from "next/server";

import { ErrorWithStatusCode } from "./common";

export class PinataError extends ErrorWithStatusCode {
  constructor(message: string, statusCode: number) {
    super("PinataError", message, statusCode);
  }
}

export const parsePinataError = (error: unknown) => {
  const e = error as Record<string, unknown>;

  const hasMessage = typeof e.message === "string";
  const hasStatusCode = typeof e.statusCode === "number";

  return new PinataError(
    hasMessage ? (e.message as string) : "Unknown Pinata error",
    hasStatusCode ? (e.statusCode as number) : 500
  );
};

export const handlePinataErrors = (error: unknown) => {
  if (error instanceof PinataError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  return undefined;
};
