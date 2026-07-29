import { getAdminUserFromRequest } from "#/lib/admin-auth";
import { jsonResponse } from "#/lib/cms-api";

export async function requireAdminSession(request: Request) {
  const admin = await getAdminUserFromRequest(request).catch(() => null);

  return admin ? null : jsonResponse({ error: "Admin authentication required" }, { status: 401 });
}

export function requireCmsAccess(request: Request, _legacyScope?: unknown) {
  return requireAdminSession(request);
}
