/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delivery, DeliveryStatus, SimulationState } from '../types';
import { DELIVERIES, STATUS_DATA } from '../data';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Layers, 
  Truck, 
  User, 
  Wrench, 
  Check,
  AlertCircle
} from 'lucide-react';

interface SimulatorControlsProps {
  deliveries: Delivery[];
  selectedDelivery: Delivery;
  simulation: SimulationState;
  onUpdateSimulation: (updates: Partial<SimulationState>) => void;
  onSelectDelivery: (id: string) => void;
  onTriggerStatus: (status: DeliveryStatus) => void;
}

export default function SimulatorControls({
  deliveries,
  selectedDelivery,
  simulation,
  onUpdateSimulation,
  onSelectDelivery,
  onTriggerStatus,
}: SimulatorControlsProps) {
  const { currentStepIndex, isPlaying, speedMultiplier, status } = simulation;
  const totalSteps = selectedDelivery.routePoints.length;
  const progressPercent = Math.round((currentStepIndex / (totalSteps - 1 || 1)) * 100);

  const togglePlay = () => {
    onUpdateSimulation({ isPlaying: !isPlaying });
  };

  const handleReset = () => {
    onUpdateSimulation({ 
      currentStepIndex: 0, 
      status: 'reparation', 
      isPlaying: false 
    });
  };

  const handleStepSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    let newStatus: DeliveryStatus = 'en_camino';
    
    if (newIndex === 0) {
      newStatus = 'reparation';
    } else if (newIndex >= totalSteps - 1) {
      newStatus = 'entregado';
    } else {
      const progress = newIndex / (totalSteps - 1);
      if (progress >= 0.9) {
        newStatus = 'llegando';
      } else if (progress >= 0.7) {
        newStatus = 'proximo';
      }
    }

    onUpdateSimulation({ 
      currentStepIndex: newIndex,
      status: newStatus
    });
  };

  return (
    <div className="bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-200/80 p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="font-display font-extrabold text-sm tracking-wide text-slate-800">TABLERO DE CONTROL</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulación en Tiempo Real</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[9px] font-bold uppercase tracking-wider">
          Santa Fe Ciudad
        </span>
      </div>

      {/* Select Delivery Stop in Santa Fe */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          1. Seleccionar Cliente de Prueba
        </label>
        <div className="grid grid-cols-1 gap-2">
          {deliveries.map((del) => {
            const isSelected = del.id === selectedDelivery.id;
            return (
              <button
                key={del.id}
                onClick={() => onSelectDelivery(del.id)}
                className={`w-full p-3.5 text-left rounded-2xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/75 border-blue-400 shadow-md shadow-blue-100 text-blue-900'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50 hover:border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <span className={isSelected ? 'text-blue-700' : 'text-slate-800'}>
                      {del.customerName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-white border border-slate-200 text-slate-400 rounded font-mono font-bold">
                      {del.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 font-semibold">{del.address}</p>
                  <p className="text-[9px] text-slate-400 font-mono font-bold uppercase">
                    {del.machineModel} ({del.estimatedTotalDistance} km)
                  </p>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator playback status control */}
      <div className="space-y-3.5 bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            2. Avance de la Camioneta
          </label>
          <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
            Punto {currentStepIndex + 1} de {totalSteps}
          </span>
        </div>

        {/* Step Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={handleStepSliderChange}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Taller (0%)</span>
            <span>Ruta ({progressPercent}%)</span>
            <span>Entregado</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-between gap-2.5 pt-2">
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition active:scale-95 shadow-sm cursor-pointer"
              title="Reiniciar ruta al taller"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl text-[10px] shadow-sm">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => onUpdateSimulation({ speedMultiplier: speed })}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  speedMultiplier === speed
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Overrides (Manual trigger buttons requested by user) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            3. Notificaciones Instantáneas
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STATUS_DATA) as DeliveryStatus[]).map((stateKey) => {
            const stateInfo = STATUS_DATA[stateKey];
            const isActive = status === stateKey;
            return (
              <button
                key={stateKey}
                onClick={() => onTriggerStatus(stateKey)}
                className={`py-2.5 px-3 rounded-xl text-left text-[11px] font-bold border transition-all flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-md shadow-blue-100'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/60 hover:text-slate-700'
                }`}
              >
                <span className="block truncate">{stateInfo.label}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">Progreso {stateInfo.progress}%</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 text-center font-medium leading-normal italic bg-slate-50 border border-slate-100 rounded-xl p-3">
          Presiona cualquier estado para simular el mensaje de alerta correspondiente al celular del cliente.
        </p>
      </div>
    </div>
  );
}
