/**
 * Every dummy entity (lib/dummy/*.dummy.ts) gets an id prefixed "dummy-"
 * — the cheapest possible way to tell a placeholder apart from something
 * a real query returned, without adding an `isDummy` flag to the actual
 * Restaurant/Shop/Market/MenuItem/Product types (those types describe
 * what the backend sends; a frontend-only placeholder marker doesn't
 * belong on that contract).
 */
export function isDummyId(id: string): boolean {
  return id.startsWith("dummy-");
}
