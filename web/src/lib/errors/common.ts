import { NextResponse } from "next/server";
import { z } from "zod";

export class ErrorWithStatusCode extends Error {
  constructor(
    name: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class AuthError extends ErrorWithStatusCode {
  constructor(message: string, statusCode = 401) {
    super("AuthError", message, statusCode);
  }
}

export class ValidationError extends ErrorWithStatusCode {
  constructor(message: string, statusCode = 400) {
    super("ValidationError", message, statusCode);
  }
}

export class PermissionError extends ErrorWithStatusCode {
  constructor(message: string, statusCode = 403) {
    super("PermissionError", message, statusCode);
  }
}

export class RequestError extends ErrorWithStatusCode {
  constructor(message: string, statusCode = 400) {
    super("RequestError", message, statusCode);
  }
}
export function handleCommonErrors(error: unknown) {
  if (
    error instanceof AuthError ||
    error instanceof ValidationError ||
    error instanceof PermissionError ||
    error instanceof RequestError
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
