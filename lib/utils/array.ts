/** Add `value` to `list` if it's missing, remove it if it's already there. */
export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
