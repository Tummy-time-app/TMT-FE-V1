import { mockDelay } from "@/lib/dev/devMode";
import type { CreateShopperRequestPayload, ShopperRequest, ShopperRequestStatus } from "@/features/personalShopper/types";
import type { Paginated } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Backed by localStorage so requests persist across a reload, same pattern
 * as orders.mock.ts. adminShopperRequestsApi.ts's dev-mode branch reads/
 * writes this same storage so a customer's request and the admin's status
 * view agree on one dev-mode source of truth.
 * ═══════════════════════════════════════════════════════════════════════
 */

const STORAGE_KEY = "tummytime_mock_shopper_requests";

function loadRequests(): ShopperRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ShopperRequest[];
  } catch {
    return [];
  }
}

function saveRequests(requests: ShopperRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export async function mockCreateShopperRequest(payload: CreateShopperRequestPayload): Promise<ShopperRequest> {
  await mockDelay();
  const request: ShopperRequest = {
    id: crypto.randomUUID(),
    customerId: payload.customerId,
    itemName: payload.itemName,
    quantity: payload.quantity || 1,
    preferredBrand: payload.preferredBrand,
    budget: payload.budget,
    preferredStore: payload.preferredStore,
    deliveryAddress: payload.deliveryAddress,
    photoDataUrl: payload.photoDataUrl,
    status: "submitted",
    assignedShopperName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const requests = loadRequests();
  requests.unshift(request);
  saveRequests(requests);
  return request;
}

export async function mockListMyShopperRequests(customerId: string): Promise<ShopperRequest[]> {
  await mockDelay();
  return loadRequests().filter((r) => r.customerId === customerId);
}

export async function mockGetShopperRequest(id: string): Promise<ShopperRequest> {
  await mockDelay();
  const request = loadRequests().find((r) => r.id === id);
  if (!request) throw { status: 404, message: "Request not found" };
  return request;
}

export async function mockListAllShopperRequests(page: number, limit: number): Promise<Paginated<ShopperRequest>> {
  await mockDelay();
  const all = loadRequests();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) } };
}

export async function mockUpdateShopperRequestStatus(
  id: string,
  status: ShopperRequestStatus,
  assignedShopperName?: string,
): Promise<ShopperRequest> {
  await mockDelay();
  const requests = loadRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) throw { status: 404, message: "Request not found" };
  requests[idx] = {
    ...requests[idx],
    status,
    ...(assignedShopperName !== undefined && { assignedShopperName }),
    updatedAt: new Date().toISOString(),
  };
  saveRequests(requests);
  return requests[idx];
}
