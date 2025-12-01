import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function TestMap() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) return;

        mapRef.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://demotiles.maplibre.org/style.json",
            center: [-99.1332, 19.4326],
            zoom: 9
        });
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{ height: "500px", width: "100%" }}
        />
    );
}
