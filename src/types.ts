/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type DeliveryStatus = 'reparation' | 'en_camino' | 'proximo' | 'llegando' | 'entregado';

export interface Delivery {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  machineModel: string;
  repairDetail: string;
  routePoints: LatLng[];
  estimatedTotalDuration: number; // in minutes
  estimatedTotalDistance: number; // in kilometers
  driverName: string;
  driverPhone: string;
  driverPhotoUrl: string;
  workshopName: string;
  workshopAddress: string;
  workshopCoords: LatLng;
}

export interface SimulationState {
  currentStepIndex: number;
  status: DeliveryStatus;
  isPlaying: boolean;
  speedMultiplier: number; // 1x, 2x, 5x, 10x
  selectedDeliveryId: string;
}
