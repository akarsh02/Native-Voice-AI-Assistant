import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Map as MapIcon, Info, ShieldAlert } from 'lucide-react';

// Fix for default Leaflet icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const mockParkingSpots = [
  { id: 1, name: 'Mission St. Free Zone', position: [37.7599, -122.4148], type: 'Off-street', availability: 'High' },
  { id: 2, name: 'Valencia St. Curbside', position: [37.7608, -122.4211], type: 'Street', availability: 'Medium' },
  { id: 3, name: 'Dolores Park Perimeter', position: [37.7594, -122.4270], type: 'Street', availability: 'Low (Busy)' },
  { id: 4, name: 'Public Works Lot (Free After 6)', position: [37.7689, -122.4148], type: 'Parking Lot', availability: 'High' },
];

const ParkingRadar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="glass flex-1 flex items-center px-4 py-3 gap-3 focus-within:border-white/20 transition-all">
          <Search size={20} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search for free parking in your city..." 
            className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="hidden md:block glass px-2 py-0.5 text-[10px] text-zinc-500 font-bold border border-white/5">CMD K</kbd>
        </div>

        {/* Global Alert Notification */}
        <div className="glass p-3 flex items-center gap-3 bg-yellow-500/10 border-yellow-500/20">
           <ShieldAlert size={16} color="#FFD700" />
           <p className="text-xs font-bold text-yellow-500 uppercase tracking-tighter">Live Traffic Radar: ACTIVE</p>
        </div>
      </div>

      <div className="flex-1 glass relative overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar for Map */}
        <div className="w-full md:w-80 h-48 md:h-full border-r border-white/5 flex flex-col">
           <div className="p-4 bg-white/5 font-bold text-xs uppercase tracking-widest flex items-center justify-between">
              <span>Nearby Spots</span>
              <MapIcon size={14} />
           </div>
           <div className="flex-1 overflow-y-auto">
              {mockParkingSpots.map(spot => (
                <div key={spot.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer group">
                  <h4 className="text-sm font-bold group-hover:text-[#FFD700] transition-colors">{spot.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{spot.type}</span>
                    <span className={`text-[10px] font-bold px-1 rounded
                      ${spot.availability === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                    `}>{spot.availability}</span>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* The Map */}
        <div className="flex-1 h-full z-0">
          <MapContainer 
            center={[37.76, -122.42]} 
            zoom={14} 
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mockParkingSpots.map(spot => (
               <Marker key={spot.id} position={spot.position}>
                 <Popup>
                    <div className="text-black">
                      <h3 className="font-bold">{spot.name}</h3>
                      <p className="text-xs uppercase font-bold text-zinc-500">{spot.type}</p>
                    </div>
                 </Popup>
               </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ParkingRadar;
