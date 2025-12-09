import { useState } from "react"
import { ChevronLeft, ChevronRight, AlertOctagon, ChevronDown } from "lucide-react"

// --- COMPONENTE DE MAPA IMAGEN (VÍA PYTHON) ---
function MexicoRisksMap() {
  return (
    <div className="relative w-full aspect-[1.6/1] bg-rainmap-bg rounded-xl border border-rainmap-glass-border/50 flex items-center justify-center overflow-hidden p-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">

      {/* Título flotante estilo HUD */}
      <div className="absolute top-3 left-3 flex flex-col z-20">
        <span className="text-[10px] font-mono text-rainmap-accent2 tracking-widest uppercase bg-rainmap-bg/80 px-1 rounded">Sistema de Monitoreo</span>
        <span className="text-[8px] text-rainmap-muted px-1">Live Feed • Sat-Link v4.2</span>
      </div>

      {/* Grid de fondo para efecto tecnológico (Overlay sobre la imagen) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      ></div>

      {/* IMAGEN GENERADA POR PYTHON 
          IMPORTANTE: Asegúrate de colocar 'mexico_risk_map.png' en tu carpeta /public 
      */}
      <img
        src="/mexico_risk_map.png"
        alt="Mapa de Riesgos México"
        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500 hover:scale-105 transform transition-transform"
        onError={(e) => {
          // Fallback por si la imagen no se ha generado aún o no está en public
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* Fallback de Texto por si no encuentra la imagen */}
      <div className="hidden absolute inset-0 flex-col items-center justify-center text-rainmap-muted text-xs text-center p-4 z-0">
        <AlertOctagon className="w-8 h-8 mb-2 opacity-50" />
        <span>Imagen no encontrada en /public</span>
      </div>

    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl p-4 border border-rainmap-glass-border text-rainmap-contrast">
      <div className="text-xs text-rainmap-muted">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

const parseDateString = (dateString) => {
  if (!dateString || dateString.length !== 8) {
    return null;
  }
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1;
  const day = parseInt(dateString.substring(6, 8), 10);
  return new Date(year, month, day);
}

const formatDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function Calendar({ activeDate, onDateChange }) {
  const selectedDateObj = parseDateString(activeDate);
  const [displayDate, setDisplayDate] = useState(selectedDateObj || new Date());

  const daysOfWeek = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="aspect-square" />)

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const isSelected = selectedDateObj
      ? (selectedDateObj.toDateString() === currentDate.toDateString())
      : false;

    days.push(
      <button
        key={day}
        onClick={() => {
          const newDateString = formatDateString(currentDate);
          onDateChange(newDateString);
          setDisplayDate(currentDate);
        }}
        className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-200 ${isSelected
          ? "bg-rainmap-accent2 text-rainmap-contrast shadow-[0_0_8px_rgba(0,240,255,0.3)]"
          : "text-rainmap-muted hover:bg-rainmap-accent2/20 hover:text-rainmap-contrast"
          }`}
      >
        {day}
      </button>
    )
  }

  return (
    <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl p-4 border border-rainmap-glass-border">
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setDisplayDate(new Date(year, month - 1, 1))}
          className="p-1 rounded-lg hover:bg-rainmap-accent2/10 transition"
        >
          <ChevronLeft className="w-4 h-4 text-rainmap-accent2" />
        </button>
        <div className="text-sm font-bold text-rainmap-contrast">
          {displayDate.toLocaleString("es-ES", { month: "long" })} {year}
        </div>
        <button
          onClick={() => setDisplayDate(new Date(year, month + 1, 1))}
          className="p-1 rounded-lg hover:bg-rainmap-accent2/10 transition"
        >
          <ChevronRight className="w-4 h-4 text-rainmap-accent2" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-rainmap-muted mb-2 text-[10px]">
        {daysOfWeek.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  )
}

export default function DashboardSidebar({
  mainStormView,
  activeStorms,
  activeDate,
  onDateChange,
  onNavigateHome,
  onToggleSidebar
}) {
  const severeStorms = activeStorms.filter((s) => (s.categoria || s.category || 0) >= 3).length
  const warningStorms = activeStorms.filter((s) => s.status === "warning" || s.estado === "warning").length

  // Estado para desplegar la sección de predicciones
  const [showPredictions, setShowPredictions] = useState(false);

  return (
    <aside className="w-80 h-full bg-rainmap-bg/80 backdrop-blur-2xl border-l border-rainmap-glass-border flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.08)]">

      {/* TOP SWITCH MEJORADO - COLORES CAMBIADOS (Verde y Rojo) */}
      <div className="sticky top-0 p-3 border-b border-rainmap-glass-border flex gap-2 backdrop-blur-2xl bg-rainmap-surface z-10 rounded-b-2xl">
        {/* Home Button - VERDE */}
        <button
          onClick={onNavigateHome}
          className="flex-1 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 text-sm tracking-wide transition-all duration-300 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] backdrop-blur-xl flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Inicio
        </button>

        {/* Active Storms Button - ROJO */}
        <button
          className="flex-1 p-2 rounded-xl border border-red-500 bg-red-500/20 text-white text-sm tracking-wide shadow-[0_0_10px_rgba(239,68,68,0.35)] backdrop-blur-xl flex items-center justify-center gap-2 cursor-default"
        >
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></span>
          Tormentas
        </button>

        {/* Close Button - Solo en móvil */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl border border-rainmap-glass-border bg-rainmap-glass text-rainmap-contrast hover:bg-rainmap-accent2/20 transition-all duration-300"
            aria-label="Cerrar sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 overflow-y-auto flex-1">
        {/* STATS SECTION */}
        <div className="space-y-3 mb-6">
          <Stat label="Tormentas Activas" value={activeStorms.length} />
          <Stat label="Tormentas Severas (Cat 3+)" value={severeStorms} />
          <Stat label="Alertas" value={warningStorms} />
        </div>

        {/* --- TARJETA DESPLEGABLE: PREDICCIONES --- */}
        <div className="mb-6">
          {/* BOTÓN TOGGLE */}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group
                ${showPredictions
                ? 'bg-rainmap-accent2/10 border-rainmap-accent2/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                : 'bg-rainmap-glass border-transparent hover:bg-rainmap-glass/80 border-rainmap-glass-border/30'
              }`}
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className={`w-4 h-4 transition-colors ${showPredictions ? 'text-rainmap-accent2' : 'text-orange-400'}`} />
              <span className={`text-sm font-bold transition-colors ${showPredictions ? 'text-rainmap-accent2' : 'text-rainmap-contrast'}`}>
                PREDICCIONES (8 Días)
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-rainmap-muted transition-transform duration-300 ${showPredictions ? 'rotate-180 text-rainmap-accent2' : ''}`}
            />
          </button>

          {/* CONTENIDO DESPLEGABLE */}
          <div
            className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${showPredictions ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl p-4 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <p className="text-xs text-rainmap-muted mb-3 border-b border-rainmap-glass-border pb-2">
                  Posibles zonas costeras afectadas por sistemas en formación:
                </p>

                {/* Lista de Predicciones */}
                <ul className="space-y-3 mb-4">
                  <li className="flex justify-between items-start">
                    <div className="text-sm text-rainmap-contrast font-medium">Costa de Quintana Roo</div>
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">Alta (70%)</span>
                  </li>
                  <li className="text-xs text-rainmap-muted ml-1">
                    Posible impacto directo en Tulum y Cozumel.
                  </li>

                  <li className="flex justify-between items-start mt-2">
                    <div className="text-sm text-rainmap-contrast font-medium">Golfo de Tehuantepec</div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">Media (40%)</span>
                  </li>
                  <li className="text-xs text-rainmap-muted ml-1">
                    Oleaje elevado y lluvias dispersas en Oaxaca.
                  </li>

                  <li className="flex justify-between items-start mt-2">
                    <div className="text-sm text-rainmap-contrast font-medium">Sur de Baja California</div>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30">Baja (15%)</span>
                  </li>
                </ul>

                {/* --- MAPA DE IMAGEN GENERADA --- */}
                <div className="pt-2 border-t border-rainmap-glass-border/50">
                  <p className="text-[10px] text-rainmap-muted mb-2 text-center uppercase tracking-wider">Mapa de Riesgos (Tiempo Real)</p>
                  <MexicoRisksMap />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* STORM DETAILS */}
        {mainStormView && (
          <div className="mb-6">
            <h3 className="text-center text-sm font-bold text-rainmap-contrast mb-3">Detalles de la Tormenta</h3>
            <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl p-4 border border-rainmap-glass-border">
              <div className="space-y-2 text-rainmap-contrast text-sm">
                <div className="flex justify-between">
                  <span className="text-rainmap-muted">Categoría:</span>
                  <span className="font-semibold">{mainStormView.categoria || mainStormView.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rainmap-muted">Viento:</span>
                  <span className="font-semibold">{mainStormView.velocidad_viento || mainStormView.windSpeed || 'N/A'} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rainmap-muted">Presión:</span>
                  <span className="font-semibold">{mainStormView.presion || mainStormView.pressure || 'N/A'} mb</span>
                </div>
                {(mainStormView.direccion || mainStormView.direction) && (
                  <div className="flex justify-between">
                    <span className="text-rainmap-muted">Movimiento:</span>
                    <span className="font-semibold">{mainStormView.direccion || mainStormView.direction} {mainStormView.velocidad_movimiento || mainStormView.movementSpeed || ''} km/h</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CALENDARIO */}
        <div className="mb-6">
          <Calendar
            activeDate={activeDate}
            onDateChange={onDateChange}
          />
        </div>
      </div>
    </aside>
  )
}