import "./dropdown.css";

export default function Dropdown() {
    return (
        <div className="map-dropdown relative">
            <input type="checkbox" id="mapDropdown" className="dropdown-toggle" />

            {/* Button */}
            <label htmlFor="mapDropdown" className="dropdown-face">
                <span className="dropdown-text">Detalles del Mapa</span>
                <span className="dropdown-arrow"></span>
            </label>

            {/* Panel */}
            <div
                className="
                    dropdown-panel
                    absolute z-40
                "
            >
                <div className="glass-box">
                    {/* Color Section */}
                    <h3 className="section-title">Escala de Colores</h3>

                    <ul className="color-list">
                        <li>
                            <span className="bar bar-none" /> Sin Lluvia
                        </li>
                        <li>
                            <span className="bar bar-low" /> Poca Lluvia
                        </li>
                        <li>
                            <span className="bar bar-mid" /> Lluvia Moderada
                        </li>
                        <li>
                            <span className="bar bar-high" /> Lluvia Intensa
                        </li>
                        <li>
                            <span className="bar bar-vhigh" /> Lluvia de Alta Intensidad
                        </li>
                        <li>
                            <span className="bar bar-extreme" /> Lluvia Extrema
                        </li>
                    </ul>

                    {/* Description */}
                    <h3 className="section-title mt-4">Descripción general</h3>
                    <p className="description text-white/90 text-sm leading-relaxed">
                        Esta visualización representa la intensidad de la precipitación en tiempo real. Los tonos violetas indican niveles bajos, pasando a naranja y rojo, a medida que aumenta la intensidad.
                    </p>
                </div>
            </div>
        </div>
    );
}
