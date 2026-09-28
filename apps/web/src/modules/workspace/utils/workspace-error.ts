interface IErrorWithStatus {
  status?: unknown;
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const { status } = error as IErrorWithStatus;
  return typeof status === "number" ? status : undefined;
}

export function workspaceErrorMessage(error: unknown, action: string): string {
  const status = statusOf(error);

  if (status === 403 || status === 404) {
    return `We couldn't ${action}. The page may be unavailable or you may no longer have access.`;
  }

  if (status !== undefined && status >= 500) {
    return `We couldn't ${action} because our service is temporarily unavailable. Please try again shortly.`;
  }

  return `We couldn't ${action}. Please try again.`;
}
