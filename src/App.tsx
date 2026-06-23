/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DELIVERIES, STATUS_DATA } from './data';
import { Delivery, DeliveryStatus, SimulationState } from './types';
import MapComponent from './components/MapComponent';
import TrackerCard from './components/TrackerCard';
import SimulatorControls from './components/SimulatorControls';
import { 
  Wrench, 
  Share2, 
  Check, 
  Link as LinkIcon, 
  Info, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Compass,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';

const Logo = () => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-300 hover:rotate-12">
        <Wrench className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src="/econo.png"
      alt="Econo Service Logo"
      className="w-10 h-10 object-contain rounded-lg shadow-sm transition-transform duration-300 hover:rotate-12 bg-white p-1 border border-slate-100"
      onError={() => setImgFailed(true)}
      referrerPolicy="no-referrer"
    />
  );
};

export default function App() {
  const [simulation, setSimulation] = useState<SimulationState>({
    currentStepIndex: 0,
    status: 'en_camino',
    isPlaying: true, // Start playing automatically for the client view
    speedMultiplier: 2,
    selectedDeliveryId: DELIVERIES[0].id,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false); // Default to false
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);

  // Parse URL query parameter for live link tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deliveryId = params.get('deliveryId');
    if (deliveryId) {
      const exists = DELIVERIES.some((d) => d.id === deliveryId);
      if (exists) {
        setSimulation({
          selectedDeliveryId: deliveryId,
          currentStepIndex: 3, // Start slightly on the road
          status: 'en_camino',
          isPlaying: true, // Auto-play the tracking
          speedMultiplier: 1,
        });
        setIsUrlLoaded(true);
        // Hide simulator initially so they see the clean client view
        setShowSimulator(false);
      }
    }
  }, []);

  const selectedDelivery = DELIVERIES.find((d) => d.id === simulation.selectedDeliveryId) || DELIVERIES[0];
  const currentCoords = selectedDelivery.routePoints[simulation.currentStepIndex] || selectedDelivery.routePoints[0];
  const startCoords = selectedDelivery.workshopCoords;
  const endCoords = selectedDelivery.routePoints[selectedDelivery.routePoints.length - 1];

  // Core simulation timer
  useEffect(() => {
    if (!simulation.isPlaying) return;

    // Reduced simulation speed by 70% (interval is 3.33x longer to make movement slower)
    const intervalTime = (1000 / simulation.speedMultiplier) * 3.333;
    const timer = setInterval(() => {
      setSimulation((prev) => {
        const activeDel = DELIVERIES.find((d) => d.id === prev.selectedDeliveryId) || DELIVERIES[0];
        const totalSteps = activeDel.routePoints.length;

        if (prev.currentStepIndex >= totalSteps - 1) {
          clearInterval(timer);
          return {
            ...prev,
            isPlaying: false,
            currentStepIndex: totalSteps - 1,
            status: 'entregado',
          };
        }

        const nextIndex = prev.currentStepIndex + 1;
        let nextStatus: DeliveryStatus = 'en_camino';

        if (nextIndex >= totalSteps - 1) {
          nextStatus = 'entregado';
        } else {
          const progress = nextIndex / (totalSteps - 1);
          if (progress >= 0.9) {
            nextStatus = 'llegando';
          } else if (progress >= 0.7) {
            nextStatus = 'proximo';
          }
        }

        return {
          ...prev,
          currentStepIndex: nextIndex,
          status: nextStatus,
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulation.isPlaying, simulation.speedMultiplier, simulation.selectedDeliveryId]);

  const handleUpdateSimulation = (updates: Partial<SimulationState>) => {
    setSimulation((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectDelivery = (id: string) => {
    setSimulation({
      selectedDeliveryId: id,
      currentStepIndex: 0,
      status: 'reparation',
      isPlaying: false,
      speedMultiplier: simulation.speedMultiplier,
    });
  };

  // Direct status override triggers vehicle placement
  const handleTriggerStatus = (status: DeliveryStatus) => {
    const totalSteps = selectedDelivery.routePoints.length;
    let targetIndex = 0;

    switch (status) {
      case 'reparation':
        targetIndex = 0;
        break;
      case 'en_camino':
        targetIndex = Math.round(totalSteps * 0.35);
        break;
      case 'proximo':
        targetIndex = Math.round(totalSteps * 0.75);
        break;
      case 'llegando':
        targetIndex = Math.round(totalSteps * 0.92);
        break;
      case 'entregado':
        targetIndex = totalSteps - 1;
        break;
    }

    setSimulation((prev) => ({
      ...prev,
      currentStepIndex: targetIndex,
      status,
      isPlaying: false, // pause on manual jump
    }));
  };

  const handleCopyLink = (deliveryId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?deliveryId=${deliveryId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(deliveryId);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex flex-col selection:bg-blue-500/30 selection:text-blue-900">
      
      {/* Top Professional Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-xl tracking-tight text-slate-800">
                  Econo Service
                </h1>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Servicio Técnico de Lavarropas · Seguimiento de Envíos
              </p>
            </div>
          </div>

          {/* Quick instructions or status badge */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-blue-700 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Monitoreo de Reparto Activo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Map Container (Dominant visual area) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex-1 min-h-[480px] lg:min-h-0 bg-white rounded-2xl relative shadow-md overflow-hidden border border-slate-200/60 p-1">
            <MapComponent
              currentCoords={currentCoords}
              routePoints={selectedDelivery.routePoints}
              startCoords={startCoords}
              endCoords={endCoords}
              status={simulation.status}
              customerName={selectedDelivery.customerName}
            />
          </div>

          {/* Quick Santa Fe Context info bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Info className="w-4 h-4 shrink-0" />
              </div>
              <p className="font-medium">
                Ruta activa desde el taller de <strong className="text-slate-900">EconoService</strong> (Vélez Sarsfield 2569, Santo Tomé) hasta la entrega en <strong className="text-slate-900">{selectedDelivery.address}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono font-semibold text-slate-500 shadow-inner">
              <span>LAT: {currentCoords.lat.toFixed(5)}</span>
              <span className="text-slate-300">|</span>
              <span>LNG: {currentCoords.lng.toFixed(5)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Card details */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-start">
          
          {/* Tracking Card for the customer */}
          <TrackerCard
            delivery={selectedDelivery}
            currentStepIndex={simulation.currentStepIndex}
            status={simulation.status}
          />

          {/* Toggle Button for Simulator Controls */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span>{showSimulator ? 'Ocultar Consola de Simulación' : 'Abrir Consola de Simulación'}</span>
            </button>
          </div>

          {showSimulator && (
            <SimulatorControls
              deliveries={DELIVERIES}
              selectedDelivery={selectedDelivery}
              simulation={simulation}
              onUpdateSimulation={handleUpdateSimulation}
              onSelectDelivery={handleSelectDelivery}
              onTriggerStatus={handleTriggerStatus}
            />
          )}
        </div>
      </main>

      {/* Footer / Credentials */}
      <footer className="bg-white border-t border-slate-200/80 p-5 text-center text-xs text-slate-500 mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-medium">© 2026 Econo Service. Todos los derechos reservados · Servicio Técnico Oficial Autorizado.</p>
          <div className="flex gap-4 font-semibold text-slate-400">
            <span className="hover:text-blue-600 transition cursor-pointer">Soporte Técnico</span>
            <span>·</span>
            <span className="hover:text-blue-600 transition cursor-pointer">Términos de Garantía</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
