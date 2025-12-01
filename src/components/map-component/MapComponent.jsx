import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react"
import Dropdown from "./DropDown";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const API_BASE_URL = "https://weatherstorm-app-backend-weather-app.up.railway.app"
// https://weatherstorm-app-backend-weather-app.up.railway.app/rainmap/realtime?grid_size=5&density=5
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://weatherstorm-app-backend-weather-app.up.railway.app" || "http://localhost:8000";

export default function MapComponent({ selectedCity = "Ciudad de Mexico" }) {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [precipData, setPrecipData] = useState(null);
  const [cityData, setCityData] = useState(null);

  // --- Fetch precip data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🌧️ Loading rain map data...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 250000); // 2.4min timeout

        const res = await fetch(`${API_BASE_URL}/rainmap/realtime?grid_size=15&density=100`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("✅ Data received:", data);
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
        const res = await fetch(`${API_BASE_URL}/rainmap/city?selectedCity=${selectedCity.name}`);
        if (!res.ok) throw new Error("Error fetching city data");
        const data = await res.json();
        console.log("📍 City data received:", data);
        setCityData(data);
      } catch (err) {
        console.error("❌ Error loading city data:", err);
      }
    };
    fetchCity();
  }, [selectedCity]);

  // --- Init map ---
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: "mexico-map",
      style: "https://api.maptiler.com/maps/01993703-c461-7fcb-9563-ed497090c6bc/style.json?key=mUwxoW7vdNmBrfqeJhw1",
      center: [-102.5528, 24.0],
      zoom: 2,
    });

    const mexicoBounds = [
      [-118, 13.5],
      [-87, 33.75],
    ];

    map.setMaxBounds(mexicoBounds);
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;
  }, []);

  // --- Add rain heatmap ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !precipData) return;

    const handleLoad = () => {
      console.log("🗺️ Map loaded. Adding rain points...");

      const geoJsonData = {
        type: "FeatureCollection",
        features: precipData.data.map((p, i) => ({
          type: "Feature",
          properties: {
            intensity: p.precipitation,
            precipitation: p.precipitation,
            id: i,
          },
          geometry: { type: "Point", coordinates: [p.lon, p.lat] },
        })),
      };

      if (!map.getSource("intensity-data")) {
        map.addSource("intensity-data", { type: "geojson", data: geoJsonData });

        map.addLayer({
          id: "rain-heatmap",
          type: "heatmap",
          source: "intensity-data",
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 3, 1],
            "heatmap-intensity": 1,
            "heatmap-radius": 20,
            "heatmap-opacity": 1,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0, 200, 0, 0)",
              0.2, "rgba(120, 0, 150, 0.6)",
              0.4, "rgba(180, 0, 120, 0.7)",
              0.6, "rgba(230, 80, 0, 0.8)",
              0.8, "rgba(255, 100, 0, 0.9)",
              1, "rgba(255, 0, 0, 1)"
            ]
          }
        });
      } else {
        map.getSource("intensity-data").setData(geoJsonData);
      }
    };

    if (map.loaded()) handleLoad();
    else map.on("load", handleLoad);
  }, [precipData]);

  // --- Add city marker ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cityData) return;

    const handleCity = () => {
      const cityGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [cityData.lon, cityData.lat] },
            properties: {
              precipitation: cityData.precipitation,
              name: selectedCity,
            },
          },
        ],
      };

      if (!map.getSource("city-point")) {
        map.addSource("city-point", { type: "geojson", data: cityGeoJson });

        map.addLayer({
          id: "city-marker",
          type: "circle",
          source: "city-point",
          paint: {
            "circle-radius": 10,
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "precipitation"],
              0, "rgba(0, 200, 0, 1)",
              0.5, "rgba(120, 0, 150, 0.6)",
              1, "rgba(180, 0, 120, 0.7)",
              1.5, "rgba(230, 80, 0, 0.8)",
              2, "rgba(255, 100, 0, 0.9)",
              2.5, "rgba(255, 0, 0, 1)"
            ],
            "circle-opacity": 0.7,
            "circle-blur": 0.2,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      } else {
        map.getSource("city-point").setData(cityGeoJson);
      }
    };

    if (map.loaded()) handleCity();
    else map.on("load", handleCity);
  }, [cityData]);

  return (
    <div className="relative w-full h-[100vh]">
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="
            absolute inset-0 z-10 flex items-center justify-center
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

      <div id="mexico-map" className="w-full h-[100vh]" />

      {/* Dropdown kept untouched, only styling happens inside the component */}
      <Dropdown />
    </div>
  );
}
