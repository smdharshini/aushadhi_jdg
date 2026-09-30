import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/FilterBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PHC, StateId } from '../types';

export const MapPage: React.FC = () => {
  const {
    states,
    districts,
    phcs,
    alerts,
    selectedStateId,
    setSelectedStateId,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedMedicineId,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedPhc, setSelectedPhc] = useState<PHC | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [17.5, 78.5], // Center of India
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Center and Markers when filters or dataset changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Determine center & zoom based on selected hierarchy
    if (selectedDistrictId !== 'ALL') {
      const d = districts.find((dist) => dist.id === selectedDistrictId);
      if (d) {
        map.setView(d.center, 10, { animate: true });
      }
    } else if (selectedStateId !== 'ALL') {
      const s = states[selectedStateId as StateId];
      if (s) {
        map.setView(s.center, 7, { animate: true });
      }
    } else {
      map.setView([17.5, 78.5], 5, { animate: true });
    }

    // Filter PHCs to show
    const displayPhcs = phcs.filter((p) => {
      if (selectedStateId !== 'ALL' && p.stateId !== selectedStateId) return false;
      if (selectedDistrictId !== 'ALL' && p.districtId !== selectedDistrictId) return false;
      return true;
    });

    displayPhcs.forEach((phc) => {
      // Find highest risk alert for this PHC's district
      const dAlerts = alerts.filter(
        (a) =>
          a.districtId === phc.districtId &&
          a.status === 'active' &&
          (selectedMedicineId === 'ALL' || a.medicineId === selectedMedicineId)
      );

      let pinColor = '#1E6B38'; // healthy green
      let pinBorder = '#FFFFFF';
      let riskLabel = 'Adequate Cover';

      if (dAlerts.some((a) => a.severity === 'critical')) {
        pinColor = '#B3261E'; // critical red
        riskLabel = 'Critical Stock-out Risk';
      } else if (dAlerts.some((a) => a.severity === 'warning')) {
        pinColor = '#D9822B'; // warning orange
        riskLabel = 'Low Stock Warning';
      }

      // Custom SVG DivIcon
      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            border: 2px solid ${pinBorder};
            width: 14px;
            height: 14px;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker(phc.coordinates, { icon });

      marker.on('click', () => {
        setSelectedPhc(phc);
      });

      const districtName = districts.find((d) => d.id === phc.districtId)?.name || phc.districtId;

      const popupContent = `
        <div style="font-family: 'IBM Plex Sans', sans-serif; min-width: 210px; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; font-size: 13px; color: #14211C; border-bottom: 1px solid #E2DDD2; padding-bottom: 4px; margin-bottom: 6px;">
            ${phc.name}
          </div>
          <div style="color: #52635B; font-size: 11px; margin-bottom: 4px;">
            ${phc.subDistrict}, ${districtName} (${phc.stateId})
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Bed Occupancy:</span>
            <span style="font-weight: 600; font-family: monospace;">${phc.occupiedBeds} / ${phc.totalBeds}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Footfall (Today):</span>
            <span style="font-weight: 600; font-family: monospace;">${phc.dailyFootfall}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Staff On Duty:</span>
            <span style="font-weight: 600; font-family: monospace;">${
              [phc.staff.medicalOfficer, phc.staff.pharmacist, phc.staff.staffNurse, phc.staff.anm].filter(Boolean).length
            } / 4</span>
          </div>
          <div style="padding: 3px 6px; border-radius: 2px; font-weight: 600; font-size: 10px; text-transform: uppercase; background: ${
            pinColor === '#B3261E' ? '#FCEBEA' : pinColor === '#D9822B' ? '#FDF3E7' : '#E9F5ED'
          }; color: ${pinColor}; border: 1px solid ${pinColor};">
            ${riskLabel}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });
  }, [phcs, alerts, selectedStateId, selectedDistrictId, selectedMedicineId, districts, states]);

  const selectedDistrictObj = districts.find((d) => d.id === selectedDistrictId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header and Breadcrumb Drilldown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-mono text-ink-muted">
            <button
              onClick={() => {
                setSelectedStateId('ALL');
                setSelectedDistrictId('ALL');
              }}
              className="hover:text-teal hover:underline"
            >
              NATIONAL
            </button>
            {selectedStateId !== 'ALL' && (
              <>
                <ChevronRight className="w-3 h-3 text-ink-faint" />
                <button
                  onClick={() => setSelectedDistrictId('ALL')}
                  className="hover:text-teal hover:underline uppercase"
                >
                  {states[selectedStateId as StateId]?.name}
                </button>
              </>
            )}
            {selectedDistrictId !== 'ALL' && (
              <>
                <ChevronRight className="w-3 h-3 text-ink-faint" />
                <span className="uppercase text-ink font-semibold">
                  {selectedDistrictObj?.name} DISTRICT
                </span>
              </>
            )}
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Geographic Network & Risk Map
          </h1>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono bg-bg-paper border border-line px-3 py-1.5 rounded">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-xs bg-critical" />
            <span>Critical (&le;7d)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-xs bg-warning" />
            <span>Warning (8-14d)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-xs bg-success" />
            <span>Healthy (&gt;14d)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Canvas */}
        <div className="lg:col-span-3 bg-bg-paper border border-line rounded overflow-hidden h-[540px] relative shadow-xs">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Selected PHC or District Inspector Sidebar */}
        <div className="bg-bg-paper border border-line rounded p-4 flex flex-col justify-between h-[540px] overflow-y-auto">
          {selectedPhc ? (
            <div className="space-y-4">
              <div className="border-b border-line pb-3">
                <span className="font-mono text-[10px] text-teal uppercase font-semibold">
                  Selected Health Centre
                </span>
                <h3 className="font-serif font-bold text-lg text-ink">
                  {selectedPhc.name}
                </h3>
                <p className="text-xs text-ink-muted">
                  {selectedPhc.subDistrict}, {districts.find((d) => d.id === selectedPhc.districtId)?.name}
                </p>
                <p className="text-[11px] font-mono text-ink-faint mt-0.5">
                  Lat: {selectedPhc.coordinates[0]}, Lng: {selectedPhc.coordinates[1]}
                </p>
              </div>

              {/* Roster & Attendance */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-ink-muted uppercase">Staff Roster (Today)</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded bg-bg border border-line">
                    <span>Medical Off.</span>
                    <span className={selectedPhc.staff.medicalOfficer ? 'text-success font-bold' : 'text-critical'}>
                      {selectedPhc.staff.medicalOfficer ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-bg border border-line">
                    <span>Pharmacist</span>
                    <span className={selectedPhc.staff.pharmacist ? 'text-success font-bold' : 'text-critical'}>
                      {selectedPhc.staff.pharmacist ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-bg border border-line">
                    <span>Staff Nurse</span>
                    <span className={selectedPhc.staff.staffNurse ? 'text-success font-bold' : 'text-critical'}>
                      {selectedPhc.staff.staffNurse ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-bg border border-line">
                    <span>ANM Worker</span>
                    <span className={selectedPhc.staff.anm ? 'text-success font-bold' : 'text-critical'}>
                      {selectedPhc.staff.anm ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bed Occupancy & Footfall */}
              <div className="p-3 rounded bg-bg-subtle border border-line space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Inpatient Beds Occupied:</span>
                  <span className="font-mono font-bold text-ink">
                    {selectedPhc.occupiedBeds} / {selectedPhc.totalBeds} ({Math.round((selectedPhc.occupiedBeds / selectedPhc.totalBeds) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Daily Outpatient Census:</span>
                  <span className="font-mono font-bold text-ink">
                    {selectedPhc.dailyFootfall} patients/day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Last Reported:</span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {new Date(selectedPhc.lastReportedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-line pb-3">
                <span className="font-mono text-[10px] text-teal uppercase font-semibold">
                  Network Coverage Overview
                </span>
                <h3 className="font-serif font-bold text-base text-ink">
                  Select a pin on the map
                </h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Click any facility marker to inspect staffing levels, bed census, and local inventory cover.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-bg border border-line space-y-1">
                  <span className="font-mono text-ink-muted">DISTRICTS IN VIEW</span>
                  <p className="text-xl font-mono font-bold text-ink">
                    {selectedStateId === 'ALL'
                      ? districts.length
                      : districts.filter((d) => d.stateId === selectedStateId).length}
                  </p>
                </div>
                <div className="p-3 rounded bg-bg border border-line space-y-1">
                  <span className="font-mono text-ink-muted">ACTIVE PHCS IN VIEW</span>
                  <p className="text-xl font-mono font-bold text-teal">
                    {phcs.filter((p) => {
                      if (selectedStateId !== 'ALL' && p.stateId !== selectedStateId) return false;
                      if (selectedDistrictId !== 'ALL' && p.districtId !== selectedDistrictId) return false;
                      return true;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick link button */}
          <div className="pt-4 border-t border-line mt-4">
            <Link
              to="/entry"
              className="inline-flex items-center justify-center w-full bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-semibold transition-colors"
            >
              <span>Submit Return for this Facility</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
