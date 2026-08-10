"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";

interface MapControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

/** Zoom + recenter overlay for the mock map surface (Google Maps mode uses its own native controls). */
export function MapControls({ zoom, onZoomChange, minZoom = 1, maxZoom = 2.2 }: MapControlsProps) {
  return (
    <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-md border border-black/10 bg-white shadow-sm">
      <button
        type="button"
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-black/5 disabled:opacity-40"
        onClick={() => onZoomChange(Math.min(maxZoom, +(zoom + 0.3).toFixed(2)))}
        disabled={zoom >= maxZoom}
      >
        <Plus size={15} aria-hidden />
      </button>
      <div className="h-px bg-black/10" />
      <button
        type="button"
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-black/5 disabled:opacity-40"
        onClick={() => onZoomChange(Math.max(minZoom, +(zoom - 0.3).toFixed(2)))}
        disabled={zoom <= minZoom}
      >
        <Minus size={15} aria-hidden />
      </button>
      <div className="h-px bg-black/10" />
      <button
        type="button"
        aria-label="Recenter"
        className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-black/5"
        onClick={() => onZoomChange(1)}
      >
        <LocateFixed size={15} aria-hidden />
      </button>
    </div>
  );
}
