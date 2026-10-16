import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Truck,
  MapPin,
  Store,
  Phone,
  CheckCircle,
  Clock,
  ShieldCheck,
  Navigation,
  Play,
  RotateCcw
} from 'lucide-react';

const CITY_COORDS = {
  chennai: [13.0827, 80.2707],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673]
};

export default function LiveOrderMap({ orderNumber, destinationAddress = {}, stageIndex = 2 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  const [simulatedProgress, setSimulatedProgress] = useState(() => Math.min(1, Math.max(0, stageIndex / 4)));
  const [isCalling, setIsCalling] = useState(false);

  // Determine realistic destination lat/lng from address city
  const cityName = (destinationAddress?.city || 'chennai').toLowerCase().trim();
  const destCoords = CITY_COORDS[cityName] || [13.0400, 80.2150];

  // Origin fulfillment center coordinates (15-20km away in same region)
  const originCoords = [destCoords[0] - 0.08, destCoords[1] + 0.07];

  // Intermediate highway waypoints
  const waypoints = [
    originCoords,
    [originCoords[0] + 0.03, originCoords[1] - 0.02],
    [originCoords[0] + 0.05, originCoords[1] - 0.04],
    destCoords
  ];

  // Initialize realistic Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    });
    mapInstanceRef.current = map;

    // Standard OpenStreetMap realistic road tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Origin Marker (Fulfillment Warehouse)
    const originIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="background-color: #0f172a; color: #38bdf8; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const originMarker = L.marker(originCoords, { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`<strong>Vendor Fulfillment Hub</strong><br/>Dispatched for order ${orderNumber || ''}`);

    // Custom Destination Marker (Customer Home)
    const destIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="background-color: #16a34a; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });

    const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
    const destText = destinationAddress?.street
      ? `${destinationAddress.street}, ${destinationAddress.city || ''} ${destinationAddress.zip || ''}`
      : 'Customer Delivery Address';
    destMarker.bindPopup(`<strong>Delivery Destination</strong><br/>${destText}`);

    // Route Polyline on real roads
    const routePolyline = L.polyline(waypoints, {
      color: '#2563eb',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    // Fit map bounds comfortably to show entire transit path
    map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

    // Custom Live Vehicle Marker (Delivery Van)
    const vehicleIcon = L.divIcon({
      className: 'custom-leaflet-vehicle-icon',
      html: `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.25); animation: pulse 1.8s infinite ease-out;"></div>
          <div style="background-color: #2563eb; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 2px solid #ffffff; z-index: 2;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const initPos = getInterpolatedPoint(waypoints, simulatedProgress);
    const vehicleMarker = L.marker(initPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarker.bindPopup(`<strong>Venfes Express Delivery Vehicle</strong><br/>Status: In Transit • Live GPS Active`);
    vehicleMarkerRef.current = vehicleMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destinationAddress?.city, destinationAddress?.street, orderNumber]);

  // Update vehicle position smoothly along real waypoints
  useEffect(() => {
    if (vehicleMarkerRef.current) {
      const pos = getInterpolatedPoint(waypoints, simulatedProgress);
      vehicleMarkerRef.current.setLatLng(pos);
    }
  }, [simulatedProgress]);

  // Interpolate lat/lng along waypoints based on progress [0..1]
  function getInterpolatedPoint(pts, fraction) {
    if (fraction <= 0) return pts[0];
    if (fraction >= 1) return pts[pts.length - 1];

    const totalSegments = pts.length - 1;
    const scaled = fraction * totalSegments;
    const segIdx = Math.floor(scaled);
    const segFraction = scaled - segIdx;

    const pA = pts[segIdx];
    const pB = pts[Math.min(segIdx + 1, pts.length - 1)];

    return [
      pA[0] + (pB[0] - pA[0]) * segFraction,
      pA[1] + (pB[1] - pA[1]) * segFraction
    ];
  }

  // Calculate live telemetry numbers
  const distanceKm = Math.max(0.4, (1 - simulatedProgress) * 12.8).toFixed(1);
  const etaMinutes = Math.max(5, Math.round((1 - simulatedProgress) * 42));

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '28px'
      }}
    >
      {/* Top Map Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface-alt)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Navigation size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '15px' }}>Live Order GPS Map</strong>
              <span className="badge badge-paid" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                Active Telemetry
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              OpenStreetMap Geographic Routing • Order #{orderNumber}
            </span>
          </div>
        </div>

        {/* Telemetry pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Clock size={15} />
            <span>ETA: ~{etaMinutes} mins ({distanceKm} km away)</span>
          </div>
        </div>
      </div>

      {/* Realistic Leaflet OpenStreetMap Container */}
      <div
        ref={mapContainerRef}
        style={{
          height: '360px',
          width: '100%',
          backgroundColor: '#e5e7eb',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Bottom Dispatch & Courier Controls */}
      <div
        style={{
          padding: '18px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          backgroundColor: 'var(--surface)',
          borderTop: '1px solid var(--border)'
        }}
      >
        {/* Delivery Address Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <MapPin size={14} color="#16a34a" />
            <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>Delivery Destination</strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: 'var(--text-main)' }}>
            {destinationAddress?.street || 'Customer Address'}, {destinationAddress?.city || 'City'}, {destinationAddress?.state || 'State'} - {destinationAddress?.zip || ''}
          </p>
        </div>

        {/* Courier Partner Information */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              RK
            </div>
            <div>
              <strong style={{ fontSize: '13px', display: 'block' }}>Ramesh Kumar</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Venfes Express Courier • 4.9 ★</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCalling(true);
              setTimeout(() => setIsCalling(false), 3000);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Phone size={13} color="var(--primary)" />
            <span>{isCalling ? 'Connecting...' : 'Call Partner'}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
