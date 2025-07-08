import { ApiResponse } from "@/types/api";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options?: RequestInit,
  logParams = { logErrors: true }
): Promise<ApiResponse<T>> {
  try {
    const resp = await fetch(endpoint, { ...options });
    const data = await resp.json();

    if (!resp.ok) {
      return {
        success: false,
        error: data.error ?? resp.statusText,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (logParams.logErrors) {
      console.error(error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
