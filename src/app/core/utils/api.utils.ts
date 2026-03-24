export function unwrapData(res: unknown): unknown {
  const x = res as { data?: unknown; Data?: unknown };
  return x?.data ?? x?.Data ?? res;
}
