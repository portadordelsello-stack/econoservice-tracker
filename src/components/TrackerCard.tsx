/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Delivery, DeliveryStatus } from '../types';
import { STATUS_DATA } from '../data';
import { 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Compass, 
  CheckCircle2, 
  Settings, 
  ExternalLink,
  Share2,
  Check
} from 'lucide-react';

interface TrackerCardProps {
  delivery: Delivery;
  currentStepIndex: number;
  status: DeliveryStatus;
}

export default function TrackerCard({
  delivery,
  currentStepIndex,
  status,
}: TrackerCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (deliveryId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?deliveryId=${deliveryId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const totalSteps = delivery.routePoints.length;
  const statusInfo = STATUS_DATA[status];

  // Calculate dynamic ETA and Distance based on the route progress
  let remainingTime = delivery.estimatedTotalDuration;
  let remainingDistance = delivery.estimatedTotalDistance;

  if (status === 'reparation') {
    remainingTime = delivery.estimatedTotalDuration;
    remainingDistance = delivery.estimatedTotalDistance;
  } else if (status === 'entregado') {
    remainingTime = 0;
    remainingDistance = 0;
  } else {
    const fractionRemaining = 1 - (currentStepIndex / (totalSteps - 1 || 1));
    remainingTime = Math.max(1, Math.round(delivery.estimatedTotalDuration * fractionRemaining));
    remainingDistance = Math.max(0.1, Math.round(delivery.estimatedTotalDistance * fractionRemaining * 10) / 10);
  }

  // Get current status icon
  const getStatusIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package':
        return <Wrench className="w-6 h-6 text-amber-500 animate-pulse" />;
      case 'Truck':
        return <Compass className="w-6 h-6 text-sky-500 animate-spin-slow" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-indigo-600 animate-pulse" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-pink-500 animate-bounce" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default:
        return <Compass className="w-6 h-6" />;
    }
  };

  // Simulated WhatsApp link for Santa Fe clients to connect with Carlos the driver
  const whatsappUrl = `https://wa.me/543424119876?text=Hola%20Carlos,%20soy%20el%20cliente%20de%20la%20entrega%20${delivery.id}.%20Quiero%20consultar%20sobre%20mi%20lavarropas%20${encodeURIComponent(delivery.machineModel)}.`;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 transition-all duration-300 hover:shadow-3xl">
      
      {/* Dynamic Main Notice Bubble */}
      <div className={`p-5 rounded-2xl mb-5 flex items-start gap-4 transition-colors duration-500 border ${
        status === 'proximo' || status === 'llegando' 
          ? 'bg-amber-50 border-amber-200 text-amber-900' 
          : status === 'entregado'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : status === 'en_camino'
          ? 'bg-blue-50 border-blue-200 text-blue-900'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className={`p-2.5 rounded-full bg-white shadow-sm shrink-0`}>
          {getStatusIcon(statusInfo.icon)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${
              status === 'entregado' ? 'bg-emerald-200/60 text-emerald-800' :
              status === 'reparation' ? 'bg-amber-200/60 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {statusInfo.label}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Actualizado hace instantes</span>
          </div>
          
          {/* Main big headline from template */}
          <h2 className="text-xl font-black tracking-tight leading-tight mb-1 text-slate-800">
            {status === 'reparation' && "¡Preparando equipo!"}
            {status === 'en_camino' && "¡Tu lavarropas está en camino!"}
            {status === 'proximo' && "¡Ya falta poco!"}
            {status === 'llegando' && "¡Repartidor en la puerta!"}
            {status === 'entregado' && "¡Entrega completada!"}
          </h2>
          <p className="text-slate-600 text-xs leading-normal font-medium">
            {statusInfo.message}
          </p>
        </div>
      </div>

      {/* Primary Metrics: ETA Block (styled exactly like the template) */}
      <div className="space-y-3 mb-5">
        <div className="bg-blue-50/75 rounded-2xl p-5 flex items-center justify-between border border-blue-100/60">
          <div>
            <p className="text-blue-800 text-xs font-bold uppercase mb-1 opacity-80 tracking-wide">Tiempo de llegada estimado</p>
            {status === 'entregado' ? (
              <p className="text-3xl font-black text-emerald-700 tracking-tighter">Entregado</p>
            ) : (
              <p className="text-4xl font-black text-blue-900 tracking-tighter flex items-baseline gap-1">
                {remainingTime}
                <span className="text-sm font-bold text-blue-700 font-sans tracking-normal">minutos</span>
              </p>
            )}
          </div>
          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-md">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Distance detail bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Distancia restante:</span>
          </div>
          {status === 'entregado' ? (
            <span className="font-bold text-emerald-600">En Destino</span>
          ) : (
            <span className="font-bold text-slate-800">{remainingDistance} km</span>
          )}
        </div>
      </div>

      {/* Progress slider visually mapping current coordinate status */}
      <div className="py-2 mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>SALIDA (EconoService)</span>
          <span className="text-blue-600">TU DOMICILIO</span>
        </div>
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 shadow-inner" 
            style={{ width: `${statusInfo.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
          <span>Taller</span>
          <span className="font-semibold text-slate-700">{delivery.customerName}</span>
        </div>
      </div>

      {/* Collapsible Details - Washing Machine details & Repair details */}
      <div className="mt-2 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-100/80 transition text-left"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detalle del Servicio Técnico
            </span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showDetails && (
          <div className="px-4 pb-4 pt-1 space-y-3 divide-y divide-slate-100 text-xs">
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipo Reparado</span>
              <p className="font-bold text-slate-800 mt-0.5">{delivery.machineModel}</p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalle del Service Realizado</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">{delivery.repairDetail}</p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección de Entrega</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">{delivery.address}</p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código Único de Pedido</span>
              <p className="font-mono text-slate-500 mt-0.5 font-semibold">{delivery.id}</p>
            </div>
          </div>
        )}
      </div>

      {/* Driver and Contact Section */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={delivery.driverPhotoUrl} 
              alt={delivery.driverName} 
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md ring-4 ring-blue-50"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Técnico asignado</p>
            <p className="font-bold text-slate-800 text-sm leading-tight">{delivery.driverName}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Especialista Econo Service</p>
          </div>
        </div>

        {/* Contact and Share buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => handleCopyLink(delivery.id)}
            className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Copiar enlace de seguimiento"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>Compartir</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-md shadow-emerald-100 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 font-bold text-xs"
            title="Enviar WhatsApp para consultas directas"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
