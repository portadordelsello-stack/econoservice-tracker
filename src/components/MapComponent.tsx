/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { LatLng, DeliveryStatus } from '../types';
import { MapPin, Navigation, Info, Layers, Eye } from 'lucide-react';

interface MapComponentProps {
  currentCoords: LatLng;
  routePoints: LatLng[];
  startCoords: LatLng;
  endCoords: LatLng;
  status: DeliveryStatus;
  customerName: string;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_GOOGLE_MAPS_PLATFORM_KEY';

export default function MapComponent({
  currentCoords,
  routePoints,
  startCoords,
  endCoords,
  status,
  customerName,
}: MapComponentProps) {
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google'>(hasValidKey ? 'google' : 'leaflet');
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);

  // Leaflet references
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletTruckMarkerRef = useRef<L.Marker | null>(null);
  const leafletRouteLineRef = useRef<L.Polyline | null>(null);
  const leafletStartMarkerRef = useRef<L.Marker | null>(null);
  const leafletEndMarkerRef = useRef<L.Marker | null>(null);

  // Re-sync engine choice if key suddenly becomes available during hot rebuild
  useEffect(() => {
    if (hasValidKey) {
      setMapEngine('google');
    }
  }, [hasValidKey]);

  // Leaflet Lifecycle
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !leafletContainerRef.current) {
      // Clean up if we switch away
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    // Initialize Leaflet map
    const map = L.map(leafletContainerRef.current, {
      zoomControl: true,
      zoomSnap: 0.1,
    }).setView([currentCoords.lat, currentCoords.lng], 14);

    leafletMapRef.current = map;

    // Add CartoDB Voyager tiles (beautiful, clean, minimal, responsive)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Create start marker (Workshop)
    const workshopIcon = L.divIcon({
      className: 'custom-workshop-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 bg-slate-900 border-2 border-white rounded-lg flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div class="absolute -bottom-5 bg-slate-900 text-[9px] text-white font-medium px-1 py-0.5 rounded shadow whitespace-nowrap">EconoService</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: workshopIcon }).addTo(map);
    leafletStartMarkerRef.current = startMarker;

    // Create end marker (Customer)
    const customerIcon = L.divIcon({
      className: 'custom-customer-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-rose-500/20 rounded-full animate-ping"></div>
          <div class="w-8 h-8 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="absolute -bottom-5 bg-rose-600 text-[9px] text-white font-medium px-1 py-0.5 rounded shadow whitespace-nowrap">${customerName}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const endMarker = L.marker([endCoords.lat, endCoords.lng], { icon: customerIcon }).addTo(map);
    leafletEndMarkerRef.current = endMarker;

    // Create route line
    const polylineCoords = routePoints.map((p) => [p.lat, p.lng] as L.LatLngExpression);
    const routeLine = L.polyline(polylineCoords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.8,
      dashArray: '1, 10', // Dashed line effect
      lineCap: 'round',
    }).addTo(map);
    leafletRouteLineRef.current = routeLine;

    // Create active truck marker
    const truckIcon = L.divIcon({
      className: 'custom-truck-marker',
      html: `
        <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
          <div class="absolute w-12 h-12 bg-sky-500/30 rounded-full animate-ping"></div>
          <div class="relative w-10 h-10 bg-sky-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><rect width="16" height="13" x="2" y="6" rx="2"/><path d="M16 8h4l3 3v7h-7V8z"/><circle cx="9" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const truckMarker = L.marker([currentCoords.lat, currentCoords.lng], { icon: truckIcon }).addTo(map);
    leafletTruckMarkerRef.current = truckMarker;

    // Center map on bounds
    const bounds = L.latLngBounds([
      [startCoords.lat, startCoords.lng],
      [endCoords.lat, endCoords.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (map) {
        map.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapEngine, startCoords, endCoords, routePoints]);

  // Update Leaflet marker and panning when currentCoords shifts
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !leafletMapRef.current) return;

    if (leafletTruckMarkerRef.current) {
      leafletTruckMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    }

    // Dynamic panning - focus on truck
    if (leafletMapRef.current) {
      leafletMapRef.current.panTo([currentCoords.lat, currentCoords.lng], { animate: true });
    }
  }, [currentCoords, mapEngine]);

  const toggleEngine = () => {
    if (mapEngine === 'leaflet') {
      if (hasValidKey) {
        setMapEngine('google');
      } else {
        setShowKeyInstructions(true);
      }
    } else {
      setMapEngine('leaflet');
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-50">
      {/* Engine selection and Notice panel */}
      <div className="absolute top-4 left-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        <div className="flex justify-between items-center w-full">
          {/* Map Status Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg flex items-center gap-2 pointer-events-auto">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Ubicación Santa Fe Ciudad</span>
            <span className="text-slate-400 px-1">|</span>
            <span className="text-sky-400 capitalize">{mapEngine === 'google' ? 'Google Maps' : 'Leaflet OSM'}</span>
          </div>

          {/* Engine toggle */}
          <button
            onClick={toggleEngine}
            className="bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 pointer-events-auto"
          >
            {mapEngine === 'leaflet' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span>Ver en Google Maps</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ver en Leaflet (Offline)</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Google Maps instructions banner if they click and don't have a key */}
        {!hasValidKey && showKeyInstructions && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg shadow-xl pointer-events-auto max-w-lg transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <p className="font-bold text-amber-800 mb-1">Clave de Google Maps requerida</p>
                <p className="mb-2">
                  El prototipo está funcionando con <strong>Leaflet</strong>. Para ver el mapa oficial de Google Maps:
                </p>
                <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-600">
                  <li>
                    Haz clic en el engranaje de <strong>Ajustes (Settings)</strong> arriba a la derecha.
                  </li>
                  <li>
                    Ve a <strong>Secrets</strong> y agrega un secreto llamado <code>GOOGLE_MAPS_PLATFORM_KEY</code>.
                  </li>
                  <li>Pega tu API Key de Google Maps como valor y guarda.</li>
                </ol>
                <div className="flex gap-2 justify-end">
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-medium py-1 px-2.5 rounded transition"
                  >
                    Obtener Clave Gratis
                  </a>
                  <button
                    onClick={() => setShowKeyInstructions(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-medium py-1 px-2"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RENDER LEAFLET MAP CONTAINER */}
      {mapEngine === 'leaflet' && (
        <div id="leaflet-map-container" ref={leafletContainerRef} className="w-full h-full min-h-[400px] z-10" />
      )}

      {/* RENDER GOOGLE MAP ENGINE */}
      {mapEngine === 'google' && (
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={currentCoords}
            defaultZoom={14}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={true}
            zoomControl={true}
          >
            {/* Workshop Marker */}
            <AdvancedMarker position={startCoords}>
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-900 border-2 border-white rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xs">🔧</span>
                </div>
                <div className="bg-slate-900 text-[9px] text-white font-medium px-1 py-0.5 rounded shadow whitespace-nowrap mt-1">
                  EconoService
                </div>
              </div>
            </AdvancedMarker>

            {/* Customer Marker */}
            <AdvancedMarker position={endCoords}>
              <div className="relative flex flex-col items-center">
                <div className="absolute w-8 h-8 bg-rose-500/20 rounded-full animate-ping"></div>
                <div className="w-8 h-8 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="bg-rose-600 text-[9px] text-white font-medium px-1 py-0.5 rounded shadow whitespace-nowrap mt-1">
                  {customerName}
                </div>
              </div>
            </AdvancedMarker>

            {/* Active Truck Marker */}
            <AdvancedMarker position={currentCoords}>
              <div className="relative flex items-center justify-center" style={{ width: '44px', height: '44px' }}>
                <div className="absolute w-12 h-12 bg-sky-500/30 rounded-full animate-ping"></div>
                <div className="relative w-10 h-10 bg-sky-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                  <Navigation className="w-5 h-5 text-white transform rotate-45" />
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      )}
    </div>
  );
}
