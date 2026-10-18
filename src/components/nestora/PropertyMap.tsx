import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Property } from "@/data/properties";
import { formatPrice } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { MapPin, Layers3 } from "lucide-react";

type PropertyMapProps = {
  listings: Property[];
  onQuickView: (property: Property) => void;
};

const formatMapPrice = (price: number) =>
  price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}m` : `$${Math.round(price / 1_000)}k`;

const labelIcon = (price: number) =>
  L.divIcon({
    className: "nestora-map-marker",
    html: `<span>${formatMapPrice(price)}</span>`,
    iconSize: [90, 32],
    iconAnchor: [45, 16],
  });

const areaCenters = [
  { name: "Lakeside", position: [41.409, -70.61] as [number, number], fill: "var(--primary)" },
  { name: "Old Town", position: [41.427, -70.626] as [number, number], fill: "var(--accent)" },
  { name: "Hillcrest", position: [41.442, -70.593] as [number, number], fill: "var(--primary)" },
  { name: "Harbour", position: [41.398, -70.638] as [number, number], fill: "var(--accent)" },
];

function FitListings({ listings }: { listings: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;
    const bounds = L.latLngBounds(listings.map((property) => [property.latitude, property.longitude]));
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14, animate: false });
  }, [listings, map]);

  return null;
}

export function PropertyMap({ listings, onQuickView }: PropertyMapProps) {
  const [heatmap, setHeatmap] = useState(false);
  const neighborhoodStats = useMemo(
    () => areaCenters.map((area) => {
      const homes = listings.filter((listing) => listing.area === area.name);
      const average = homes.length ? homes.reduce((sum, home) => sum + home.price, 0) / homes.length : 0;
      return { ...area, count: homes.length, average };
    }),
    [listings],
  );
  const initialBounds = useMemo(
    () => listings.length > 0
      ? L.latLngBounds(listings.map((property) => [property.latitude, property.longitude]))
      : undefined,
    // MapContainer uses bounds only on its first render; FitListings handles updates.
    [],
  );

  return (
    <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
      <div className="absolute left-4 top-4 z-[500] flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-card" role="group" aria-label="Map display">
        <Button size="sm" variant={heatmap ? "outline" : "default"} onClick={() => setHeatmap(false)} aria-pressed={!heatmap}>
          <MapPin /> Map
        </Button>
        <Button size="sm" variant={heatmap ? "default" : "outline"} onClick={() => setHeatmap(true)} aria-pressed={heatmap}>
          <Layers3 /> Price areas
        </Button>
      </div>
      <MapContainer center={[41.419, -70.617]} bounds={initialBounds} boundsOptions={{ padding: [44, 44] }} zoom={13} scrollWheelZoom={false} className="h-[480px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitListings listings={listings} />
        {!heatmap && listings.map((property) => (
          <Marker
            key={property.id}
            center={[property.latitude, property.longitude]}
            icon={labelIcon(property.price)}
          >
            <Popup>
              <div className="w-52 overflow-hidden rounded-lg">
                <img src={property.images[0]} alt={property.name} className="mb-2 h-24 w-full rounded-md object-cover" />
                <p className="font-display text-sm font-bold">{property.name}</p>
                <p className="mb-2 text-sm font-semibold text-primary">{formatPrice(property.price)}</p>
                <Button size="sm" className="w-full" onClick={() => onQuickView(property)}>Quick view</Button>
              </div>
            </Popup>
          </Marker>
        ))}
        {heatmap && neighborhoodStats.map((area) => (
          <CircleMarker
            key={area.name}
            center={area.position}
            radius={Math.max(16, Math.min(36, 12 + area.average / 55000))}
            pathOptions={{ color: area.fill, fillColor: area.fill, fillOpacity: 0.34, weight: 2 }}
          >
            <Popup>
              <p className="font-display font-bold">{area.name}</p>
              <p>{area.count ? `${area.count} matching homes` : "No matching homes"}</p>
              <p>{area.count ? `Avg. ${formatPrice(area.average)}` : "Try another filter"}</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[500] rounded-full border border-border bg-surface/95 px-3 py-2 text-xs text-muted-foreground shadow-card">
        {listings.length} homes across four neighborhoods
      </div>
    </div>
  );
}