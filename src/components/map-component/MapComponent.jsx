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
  const [filteredPoints, setFilteredPoints] = useState(0);
  const [maxPrecipitation, setMaxPrecipitation] = useState(0);

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

        setMaxPrecipitation(maxPrecip);
        setFilteredPoints(meaningfulPoints);
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
    console.log(`✅ Points with precipitation >= 0.5: ${filteredData.length} out of ${precipData.data.length}`);

    if (filteredData.length === 0) {
      // No hay precipitación significativa, remover heatmap si existe
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      console.log("ℹ️ No precipitation >= 0.5mm, heatmap removed");
      return;
    }

    // Log algunos valores para debug
    console.log("📊 Sample filtered precipitation values:",
      filteredData.slice(0, 5).map(p => ({
        lat: p.lat.toFixed(2),
        lon: p.lon.toFixed(2),
        precip: p.precipitation.toFixed(4)
      }))
    );

    // 2. CREAR PUNTOS PARA HEATMAP: Mapear precipitación 0-3 a intensidad 0-1
    const heatPoints = filteredData.map(point => {
      // Mapear precipitación 0-3 mm a intensidad 0-1
      // precipitation = 0.5 -> intensity = 0.5/3 = 0.166
      // precipitation = 1.0 -> intensity = 1.0/3 = 0.333
      // precipitation = 1.5 -> intensity = 1.5/3 = 0.5
      // precipitation = 2.0 -> intensity = 2.0/3 = 0.666
      // precipitation = 2.5 -> intensity = 2.5/3 = 0.833
      // precipitation = 3.0 -> intensity = 3.0/3 = 1.0

      const intensity = Math.min(point.precipitation / 3, 1.0);

      // Debug para puntos con precipitación significativa
      if (point.precipitation >= 0.5) {
        console.log(`📍 Point [${point.lat.toFixed(2)}, ${point.lon.toFixed(2)}]: 
          precipitation=${point.precipitation.toFixed(4)}mm, 
          intensity=${intensity.toFixed(3)}`);
      }

      return [point.lat, point.lon, intensity];
    });

    // Remover heat layer existente
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    try {
      // 3. CREAR HEATMAP CON LOS COLORES EXACTOS QUE ESPECIFICASTE
      // AUMENTAR OPACIDAD: aumentar valores alpha (0.6, 0.7, 0.8, 0.9, 1.0) a (0.8, 0.9, 1.0, 1.0, 1.0)
      const heat = L.heatLayer(heatPoints, {
        radius: 40, // Aumentado ligeramente el radio
        blur: 15,   // Reducido blur para puntos más definidos
        maxZoom: 10,
        minOpacity: 0.3, // Aumentado opacidad mínima
        max: 1.0,
        gradient: {
          // Mapeo EXACTO según tus especificaciones CON OPACIDAD AUMENTADA
          0: 'rgba(0, 200, 0, 0)',          // 0 mm - Transparente
          0.166: 'rgba(120, 0, 150, 0.8)',  // 0.5 mm - Poca Lluvia (aumentado 0.6 -> 0.8)
          0.333: 'rgba(180, 0, 120, 0.9)',  // 1.0 mm - Lluvia Moderada (aumentado 0.7 -> 0.9)
          0.5: 'rgba(230, 80, 0, 1)',       // 1.5 mm - Lluvia Intensa (aumentado 0.8 -> 1.0)
          0.666: 'rgba(255, 100, 0, 1)',    // 2.0 mm - Lluvia de Alta Intensidad (aumentado 0.9 -> 1.0)
          0.833: 'rgba(255, 0, 0, 1)',      // 2.5 mm - Lluvia Extrema (ya era 1.0)
          1.0: 'rgba(255, 0, 0, 1)'         // 3.0+ mm - Lluvia Extrema
        }
      }).addTo(map);

      heatLayerRef.current = heat;
      console.log("✅ Heatmap updated successfully with increased opacity");

    } catch (error) {
      console.error("❌ Error creating heat layer:", error);
    }
  }, [precipData]);

  // Function to get color based on precipitation (for city marker)
  const getColorForPrecipitation = (precip) => {
    if (precip < 0.5) return "#00c800";      // Verde - Sin lluvia
    if (precip <= 1) return "#780096";       // Púrpura - Poca Lluvia
    if (precip <= 1.5) return "#b40078";     // Rosa - Lluvia Moderada
    if (precip <= 2) return "#e65000";       // Naranja - Lluvia Intensa
    if (precip <= 2.5) return "#ff6400";     // Naranja oscuro - Lluvia de Alta Intensidad
    return "#ff0000";                         // Rojo - Lluvia Extrema
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
          fillOpacity: 0.9 // Aumentado de 0.8 a 0.9
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