export type MapEntry = {
  id: string;
  name: string;
  subdomain: string;
  lat: number;
  lng: number;
  approximate: boolean;
  mode: string;
  page: number;
  category: string;
  address: string;
  phone: string | null;
};

export function clusterMarkers(entries: MapEntry[], zoom: number) {
  const scale = 256 * 2 ** Math.max(2, zoom);
  const radius = 56;
  type Group = { x: number; y: number; entries: MapEntry[] };
  const buckets = new Map<string, Group[]>();
  const groups: Group[] = [];
  for (const entry of entries) {
    if (!Number.isFinite(entry.lat) || !Number.isFinite(entry.lng)) continue;
    const sine = Math.sin(
      (Math.max(-85, Math.min(85, entry.lat)) * Math.PI) / 180,
    );
    const x = ((entry.lng + 180) / 360) * scale;
    const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale;
    const column = Math.floor(x / radius),
      row = Math.floor(y / radius);
    // Check neighbouring cells as well: points beside a grid boundary must not
    // render overlapping pins just because they fell into different buckets.
    let group: Group | undefined;
    for (let dx = -1; dx <= 1 && !group; dx++)
      for (let dy = -1; dy <= 1 && !group; dy++) {
        group = buckets
          .get(`${column + dx}:${row + dy}`)
          ?.find(
            (candidate) =>
              Math.hypot(candidate.x - x, candidate.y - y) < radius,
          );
      }
    if (group) group.entries.push(entry);
    else {
      const created = { x, y, entries: [entry] };
      groups.push(created);
      const key = `${column}:${row}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(created);
      else buckets.set(key, [created]);
    }
  }
  return groups.map((group) => group.entries);
}
