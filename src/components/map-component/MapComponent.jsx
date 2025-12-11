import { useEffect, useState, useRef } from "react";
import { Loader } from "lucide-react";
import Dropdown from "./DropDown";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix for default icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = "https://weatherstorm-app-backend-weather-app.up.railway.app";

export default function MapComponent({ selectedCity = "Ciudad de Mexico" }) {
  const [loading, setLoading] = useState(true);
  const [precipData, setPrecipData] = useState(null);
  const [cityData, setCityData] = useState(null);

  // Use refs to store map instances
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const cityMarkerRef = useRef(null);
  const mapInitializedRef = useRef(false);

  // --- Fetch precip data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🌧️ Loading rain map data...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 250000);

        const res = await fetch(`${API_BASE_URL}/rainmap/realtime?grid_size=15&density=100`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("✅ Data received:", data);

        // Calculate max precipitation for debugging
        const precipValues = data.data.map(p => p.precipitation);
        const maxPrecip = Math.max(...precipValues);
        const meaningfulPoints = data.data.filter(p => p.precipitation >= 0.5).length;

        console.log(`📊 Data Analysis:`);
        console.log(`- Total points: ${data.data.length}`);
        console.log(`- Max precipitation: ${maxPrecip.toFixed(4)} mm`);
        console.log(`- Points with precipitation >= 0.5: ${meaningfulPoints}`);
        console.log(`- First 5 precipitation values:`, precipValues.slice(0, 5));

        setPrecipData(data);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        if (err.name === 'AbortError') {
          console.error('Request timed out');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Fetch city data ---
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const cityName = selectedCity.name || selectedCity;
        if (!cityName) return;

        const res = await fetch(`${API_BASE_URL}/rainmap/city?selectedCity=${encodeURIComponent(cityName)}`);
        if (!res.ok) throw new Error("Error fetching city data");
        const data = await res.json();
        console.log("📍 City data received:", data);
        setCityData(data);
      } catch (err) {
        console.error("❌ Error loading city data:", err);
      }
    };

    if (selectedCity) {
      fetchCity();
    }
  }, [selectedCity]);

  // --- Initialize Leaflet Map ---
  useEffect(() => {
    if (mapInitializedRef.current) return;

    const container = document.getElementById('mexico-map');
    if (!container) return;

    if (container._leaflet_id) {
      console.log("Map already initialized, skipping...");
      mapInitializedRef.current = true;
      return;
    }

    console.log("Initializing Leaflet map...");

    const map = L.map('mexico-map', {
      center: [24.0, -102.5528],
      zoom: 5,
      minZoom: 4,
      maxZoom: 10,
      maxBounds: [
        [13.5, -118],
        [33.75, -87]
      ],
      maxBoundsViscosity: 1.0,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 10
    }).addTo(map);

    L.control.attribution({
      position: 'bottomright'
    }).addTo(map);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    mapRef.current = map;
    mapInitializedRef.current = true;

    console.log("Leaflet map initialized");

    return () => {
      console.log("Cleaning up map...");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
      if (heatLayerRef.current) {
        heatLayerRef.current = null;
      }
      if (cityMarkerRef.current) {
        cityMarkerRef.current = null;
      }
    };
  }, []);

  // --- Add/Update Heatmap ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !precipData || !mapInitializedRef.current) return;

    console.log("Updating heatmap with data points:", precipData.data.length);

    // 1. FILTRAR: Solo puntos con precipitación >= 0.5
    const filteredData = precipData.data.filter(point => point.precipitation >= 0.5);

    if (filteredData.length === 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // 2. CREAR PUNTOS PARA HEATMAP
    const heatPoints = filteredData.map(point => {
      const intensity = Math.min(point.precipitation / 3, 1.0);
      return [point.lat, point.lon, intensity];
    });

    // Remover heat layer existente
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    try {
      // Función para calcular radio dinámico basado en zoom
      const calculateDynamicRadius = () => {
        const currentZoom = map.getZoom();
        // Ajustar radio según zoom - más pequeño en zoom alto, más grande en zoom bajo
        const baseRadius = 8; // Radio base
        const zoomFactor = Math.pow(1.5, 10 - currentZoom); // Ajuste exponencial
        return baseRadius * zoomFactor;
      };

      // Función para calcular blur dinámico
      const calculateDynamicBlur = () => {
        const currentZoom = map.getZoom();
        const baseBlur = 10;
        const zoomFactor = Math.pow(1.4, 10 - currentZoom);
        return baseBlur * zoomFactor;
      };

      // Crear heatmap inicial
      const heat = L.heatLayer(heatPoints, {
        radius: calculateDynamicRadius(),
        blur: calculateDynamicBlur(),
        maxZoom: 10,
        minOpacity: 0.3,
        max: 1.0,
        gradient: {
          0: 'rgba(0, 200, 0, 0)',
          0.166: 'rgba(120, 0, 150, 0.8)',
          0.333: 'rgba(180, 0, 120, 0.9)',
          0.5: 'rgba(230, 80, 0, 1)',
          0.666: 'rgba(255, 100, 0, 1)',
          0.833: 'rgba(255, 0, 0, 1)',
          1.0: 'rgba(255, 0, 0, 1)'
        }
      }).addTo(map);

      // Actualizar radio y blur cuando cambia el zoom
      const updateHeatmapOnZoom = () => {
        if (heatLayerRef.current && heatLayerRef.current._heat) {
          const options = heatLayerRef.current.options;
          options.radius = calculateDynamicRadius();
          options.blur = calculateDynamicBlur();
          // Forzar re-render del heatmap
          heatLayerRef.current.setOptions(options);
        }
      };

      // Escuchar cambios de zoom
      map.on('zoomend', updateHeatmapOnZoom);

      heatLayerRef.current = heat;
      console.log("✅ Heatmap updated with dynamic radius");

    } catch (error) {
      console.error("❌ Error creating heat layer:", error);
    }
  }, [precipData]);

  // Function to get color based on precipitation (for city marker)
  const getColorForPrecipitation = (precip) => {
    if (precip < 0.5) return "#00c800";
    if (precip <= 1) return "#780096";
    if (precip <= 1.5) return "#b40078";
    if (precip <= 2) return "#e65000";
    if (precip <= 2.5) return "#ff6400";
    return "#ff0000";
  };

  // --- Add/Update City Marker ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cityData || !mapInitializedRef.current) return;

    console.log("Updating city marker:", cityData);

    if (cityMarkerRef.current) {
      map.removeLayer(cityMarkerRef.current);
    }

    try {
      const marker = L.circleMarker(
        [cityData.lat, cityData.lon],
        {
          radius: 12,
          fillColor: getColorForPrecipitation(cityData.precipitation),
          color: "#ffffff",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }
      ).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="font-size: 14px;">${selectedCity.name || selectedCity}</strong><br/>
          <span style="font-size: 12px;">Precipitación: ${cityData.precipitation.toFixed(2)} mm</span>
        </div>
      `);

      marker.on('click', () => {
        marker.openPopup();
      });

      cityMarkerRef.current = marker;

      // Centrar mapa en la ciudad
      map.setView([cityData.lat, cityData.lon], 7);

      console.log("✅ City marker updated successfully");
    } catch (error) {
      console.error("❌ Error creating city marker:", error);
    }
  }, [cityData, selectedCity]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-[100vh]">
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="
            absolute inset-0 z-50 flex items-center justify-center
            bg-[rgba(10,10,12,0.6)]
            backdrop-blur-xl
            border border-[rgba(180,255,255,0.25)]
            rounded-2xl
            shadow-[0_8px_30px_rgba(0,0,0,0.25)]
            text-rainmap-contrast
            animate-pulse
          "
        >
          <div className="text-center">
            <Loader className="w-12 h-12 text-rainmap-accent2 animate-spin mx-auto mb-4" />
            <p className="text-rainmap-muted">Cargando datos del mapa...</p>
          </div>
        </div>
      )}

      <div
        id="mexico-map"
        className="w-full h-[100vh]"
        style={{
          zIndex: 1,
          backgroundColor: '#f0f4f8'
        }}
      />

      <Dropdown />
    </div>
  );
}