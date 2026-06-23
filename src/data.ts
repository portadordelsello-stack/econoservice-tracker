/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Delivery, LatLng } from './types';

// Helper function to interpolate points between waypoints for smooth animation
export function interpolateRoute(waypoints: LatLng[], stepsPerSegment: number = 20): LatLng[] {
  const route: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    for (let step = 0; step < stepsPerSegment; step++) {
      const fraction = step / stepsPerSegment;
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;
      route.push({ lat, lng });
    }
  }
  route.push(waypoints[waypoints.length - 1]); // Add the final point
  return route;
}

// 1. Route to Costanera & Guadalupe (Basilica)
const guadalupeWaypoints: LatLng[] = [
  { lat: -31.66919208482076, lng: -60.77517235767236 }, // Workshop (EconoService - Av. Luján 2500, Santo Tomé)
  { lat: -31.6675, lng: -60.7650 }, // Av. 7 de Marzo (Santo Tomé)
  { lat: -31.6655, lng: -60.7550 }, // Puente Carretero entrance
  { lat: -31.6640, lng: -60.7380 }, // Puente Carretero
  { lat: -31.6610, lng: -60.7280 }, // Av. Intendente Irigoyen / Av. J. J. Paso (Colón)
  { lat: -31.6575, lng: -60.7200 }, // Av. J. J. Paso & San Jerónimo
  { lat: -31.6500, lng: -60.7040 }, // Av. 27 de Febrero & Mendoza
  { lat: -31.6395, lng: -60.6975 }, // Av. Alem & Bv. Gálvez
  { lat: -31.6215, lng: -60.6812 }, // Av. Almirante Brown & Mutis (Costanera)
  { lat: -31.6035, lng: -60.6780 }  // Guadalupe (Av. Almirante Brown & Javier de la Rosa)
];

// 2. Route to Barrio El Pozo (via Puente Colgante)
const elPozoWaypoints: LatLng[] = [
  { lat: -31.66919208482076, lng: -60.77517235767236 }, // Workshop
  { lat: -31.6675, lng: -60.7650 }, // Av. 7 de Marzo (Santo Tomé)
  { lat: -31.6655, lng: -60.7550 }, // Puente Carretero entrance
  { lat: -31.6640, lng: -60.7380 }, // Puente Carretero
  { lat: -31.6610, lng: -60.7280 }, // Av. J. J. Paso (Colón)
  { lat: -31.6575, lng: -60.7200 }, // Av. J. J. Paso & San Jerónimo
  { lat: -31.6450, lng: -60.7000 }, // Av. Alem & Tucumán
  { lat: -31.6350, lng: -60.6815 }, // Near Puente Oroño / Puente Colgante
  { lat: -31.6335, lng: -60.6750 }, // Crossing Puente Colgante (Laguna Setúbal)
  { lat: -31.6295, lng: -60.6710 }, // Ruta 168 (UNL Ciudad Universitaria)
  { lat: -31.6265, lng: -60.6695 }  // Barrio El Pozo (Torre 5 - Delivery Destination)
];

// 3. Route to Centro / Recoleta (via Bv. Pellegrini / Peatonal San Martín)
const centroWaypoints: LatLng[] = [
  { lat: -31.66919208482076, lng: -60.77517235767236 }, // Workshop
  { lat: -31.6675, lng: -60.7650 }, // Av. 7 de Marzo (Santo Tomé)
  { lat: -31.6655, lng: -60.7550 }, // Puente Carretero entrance
  { lat: -31.6640, lng: -60.7380 }, // Puente Carretero
  { lat: -31.6610, lng: -60.7280 }, // Av. J. J. Paso (Colón)
  { lat: -31.6575, lng: -60.7250 }, // Av. J. J. Paso & Av. Freyre
  { lat: -31.6500, lng: -60.7150 }, // Av. Freyre & Mendoza
  { lat: -31.6475, lng: -60.7060 }  // San Martín & Tucumán (Delivery Destination)
];

export const DELIVERIES: Delivery[] = [
  {
    id: 'DEL-8402',
    customerName: 'Santiago Rossi',
    address: 'Av. Almirante Brown 7200 (frente a la Basílica), Guadalupe',
    phone: '+54 342 555-1290',
    machineModel: 'Drean Next 8.14 WCR (8kg 1400rpm)',
    repairDetail: 'Reemplazo de rodamientos de cuba, retén de agua y limpieza de bomba de desagote.',
    routePoints: interpolateRoute(guadalupeWaypoints, 15),
    estimatedTotalDuration: 18,
    estimatedTotalDistance: 11.4,
    driverName: 'Maxi Moe',
    driverPhone: '+54 342 411-9876',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // In Unsplash, a high-quality human face
    workshopName: 'EconoService',
    workshopAddress: 'Av. Luján 2500, Santo Tomé, Santa Fe',
    workshopCoords: { lat: -31.66919208482076, lng: -60.77517235767236 }
  },
  {
    id: 'DEL-5913',
    customerName: 'Laura Benítez',
    address: 'Barrio El Pozo, Torre 5, Piso 3, Dpto B',
    phone: '+54 342 555-4321',
    machineModel: 'Samsung EcoBubble WW90J5410GW (9kg)',
    repairDetail: 'Cambio de plaqueta lógica principal dañada por sobretensión y calibración de motor inverter.',
    routePoints: interpolateRoute(elPozoWaypoints, 15),
    estimatedTotalDuration: 16,
    estimatedTotalDistance: 10.2,
    driverName: 'Maxi Moe',
    driverPhone: '+54 342 411-9876',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    workshopName: 'EconoService',
    workshopAddress: 'Av. Luján 2500, Santo Tomé, Santa Fe',
    workshopCoords: { lat: -31.66919208482076, lng: -60.77517235767236 }
  },
  {
    id: 'DEL-2274',
    customerName: 'Martina Segovia',
    address: 'Peatonal San Martín 2300, Recoleta / Centro',
    phone: '+54 342 555-7890',
    machineModel: 'Whirlpool WNQ90AB (9kg Pro)',
    repairDetail: 'Reparación de fuelle de goma de escotilla de carga, cambio de muelle tensor y presostato.',
    routePoints: interpolateRoute(centroWaypoints, 15),
    estimatedTotalDuration: 12,
    estimatedTotalDistance: 7.8,
    driverName: 'Maxi Moe',
    driverPhone: '+54 342 411-9876',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
    workshopName: 'EconoService',
    workshopAddress: 'Av. Luján 2500, Santo Tomé, Santa Fe',
    workshopCoords: { lat: -31.66919208482076, lng: -60.77517235767236 }
  }
];

export const STATUS_DATA = {
  reparation: {
    label: 'Cargando en Taller',
    message: '¡Tu lavarropas ya está reparado y listo! Lo estamos asegurando en la camioneta de repartos.',
    color: 'bg-amber-500 text-white',
    icon: 'Package',
    progress: 10
  },
  en_camino: {
    label: 'En camino',
    message: '¡Su lavarropas está en camino! El repartidor inició el recorrido desde el taller de EconoService en Santo Tomé.',
    color: 'bg-sky-500 text-white',
    icon: 'Truck',
    progress: 40
  },
  proximo: {
    label: 'Próximo a entregar',
    message: '¡Ya falta poco para que llegue tu entrega! Asegurate de estar en casa.',
    color: 'bg-indigo-600 text-white animate-pulse',
    icon: 'Compass',
    progress: 75
  },
  llegando: {
    label: 'En la puerta',
    message: 'El repartidor está estacionando frente a tu domicilio. ¡Sali a recibir tu lavarropas!',
    color: 'bg-pink-600 text-white',
    icon: 'MapPin',
    progress: 95
  },
  entregado: {
    label: 'Entregado',
    message: '¡Entrega completada con éxito! Lavarropas instalado y listo para lavar. ¡Muchas gracias por elegirnos!',
    color: 'bg-emerald-600 text-white',
    icon: 'CheckCircle2',
    progress: 100
  }
};
