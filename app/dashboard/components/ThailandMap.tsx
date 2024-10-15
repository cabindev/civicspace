import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData } from '@/app/types/types';

interface ThailandMapProps {
  data: MapData[];
}

export default function ThailandMap({ data }: ThailandMapProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Distribution Map</h2>
        <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data.map((item, index) => {
            // ตรวจสอบว่ามีค่าพิกัดก่อนสร้าง Marker
            if (typeof item.lat === 'number' && typeof item.lng === 'number') {
              return (
                <Marker key={index} position={[item.lat, item.lng]}>
                  <Popup>
                    <h3>{item.name}</h3>
                    <p>{item.type}</p>
                  </Popup>
                </Marker>
              );
            }
            return null; // ไม่แสดง Marker ถ้าไม่มีพิกัด
          })}
        </MapContainer>
      </div>
    </div>
  );
}