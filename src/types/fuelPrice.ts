// src/types/fuelPrice.ts
export interface FuelPrice {
    id: number;
    name: string,
    fuelType: string;
    price: number;
    gasStationId: number,
    GasStation: { name: string; address: string };
    User: { name: string };
    createdAt: string;
    latitude: number,
    longitude: number
}
export interface GasStations {
    id: number;
    name: string;
    address: string;
}

namespace Caterogia {

    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };
    { id: 1; name: 'Gasolina Comum' };

}
export interface LocationL {
    latitude: number;
    longitude: number;
}
export interface Route {
    polyline: string;
    distance: string;
    duration: string;
}