import type { MapEntry } from "@/lib/directory-map";

export type MapPin = {
  overlay: google.maps.OverlayView;
  button: HTMLButtonElement;
  entries: MapEntry[];
};

// Construct after loadMaps(): the Google namespace is unavailable during SSR.
export function createMapPin(
  map: google.maps.Map,
  entries: MapEntry[],
  label: string,
  onClick: () => void,
): MapPin {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `directory-pin ${entries.length > 1 ? "is-cluster" : ""}`;
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", "false");
  button.title = label;
  if (entries.length > 1) button.textContent = String(entries.length);
  else {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<path d="m3 10 2-6h14l2 6M4 14v6h16v-6M3 10c0 4 4 4 4 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 4 4 4 0M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
    button.append(svg);
  }
  button.onclick = (event) => {
    event.stopPropagation();
    onClick();
  };
  const position = new google.maps.LatLng(
    entries.reduce((sum, entry) => sum + entry.lat, 0) / entries.length,
    entries.reduce((sum, entry) => sum + entry.lng, 0) / entries.length,
  );
  class Pin extends google.maps.OverlayView {
    onAdd() {
      this.getPanes()?.overlayMouseTarget.append(button);
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(button);
    }
    draw() {
      const pixel = this.getProjection()?.fromLatLngToDivPixel(position);
      if (!pixel) return;
      button.style.left = `${pixel.x}px`;
      button.style.top = `${pixel.y}px`;
    }
    onRemove() {
      button.remove();
      button.onclick = null;
    }
  }
  const overlay = new Pin();
  overlay.setMap(map);
  return { overlay, button, entries };
}
