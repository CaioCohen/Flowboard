type UnauthorizedHandler = (() => void) | undefined;

let unauthorizedHandler: UnauthorizedHandler;

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export async function authorizedFetch(input: RequestInfo | URL, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = { ...init.headers, Authorization: `Bearer ${token}` };
  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  return response;
}
