"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { VehicleCard } from "@/components/vehicle-card";

const filters = ["All", "Lexus", "Mercedes-Benz", "Toyota"] as const;

export function InventoryList({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedMake, setSelectedMake] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const visibleVehicles = useMemo(
    () => vehicles.filter(vehicle => (selectedMake === "All" || vehicle.make === selectedMake) && vehicle.name.toLowerCase().includes(query.trim().toLowerCase())),
    [selectedMake, query, vehicles],
  );

  return <>
    <div className="inventory-filter-bar">
      <div>
        <p className="inventory-filter-label" id="inventory-filter-label">Filter by make</p>
        <div className="inventory-filter-list" aria-labelledby="inventory-filter-label">
          {filters.map((make) => <button
            className={`inventory-filter-button${selectedMake === make ? " active" : ""}`}
            type="button"
            aria-pressed={selectedMake === make}
            onClick={() => setSelectedMake(make)}
            key={make}
          >{make}</button>)}
        </div>
      </div>
      <div className="inventory-search"><label htmlFor="inventory-search" className="sr-only">Search model or year</label><input id="inventory-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a model or year" maxLength={100} />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div><p className="inventory-results-count" aria-live="polite">{visibleVehicles.length} {visibleVehicles.length === 1 ? "vehicle" : "vehicles"}</p>
    </div>

    <div className="inventory-page-grid">
      {visibleVehicles.length === 0 && <div className="inventory-search-empty"><h2>No vehicles match this search.</h2><p>Try another model or view the complete collection.</p><button className="gold-button" type="button" onClick={() => { setQuery(""); setSelectedMake("All"); }}>View all vehicles</button></div>}
      {visibleVehicles.map(vehicle => <VehicleCard key={vehicle.slug} vehicle={vehicle} variant="inventory" />)}
    </div>
  </>;
}
