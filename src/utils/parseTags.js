export function parseTags(tags) {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : String(tags).split(',');
  return list.map((tag) => String(tag).trim()).filter(Boolean);
}
