import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '../types';

interface MapProps {
  product: Product;
}

export const Map: React.FC<MapProps> = ({ product }) => {
  return (
    <div className="h-[300px] rounded-lg overflow-hidden">
      <MapContainer
        center={[product.coordinates.lat, product.coordinates.lng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={[product.coordinates.lat, product.coordinates.lng]}>
          <Popup>
            Current Location: {product.currentLocation}
          </Popup>
        </Marker>
        
        <Polyline
          positions={product.route.map(coord => [coord.lat, coord.lng])}
          color="blue"
          weight={3}
          opacity={0.6}
        />
      </MapContainer>
    </div>
  );
};