export function formatReceiptId(id: string) {
  const sampleMatch = id.match(/(?:demo|sample)-claim-(\d+)/);

  if (sampleMatch?.[1]) {
    return `REC-2026-${sampleMatch[1].padStart(6, "0")}`;
  }

  return `REC-${id.slice(-6).toUpperCase()}`;
}
