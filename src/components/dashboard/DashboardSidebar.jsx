import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

  return (
    <aside className="w-80 h-full bg-rainmap-bg/80 backdrop-blur-2xl border-l border-rainmap-glass-border flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.08)]">

      {/* TOP SWITCH MEJORADO */}
      <div className="sticky top-0 p-3 border-b border-rainmap-glass-border flex gap-2 backdrop-blur-2xl bg-rainmap-surface z-10 rounded-b-2xl">
        {/* Home Button */}
        <button
          onClick={onNavigateHome}
          className="flex-1 p-2 rounded-xl border border-rainmap-accent2/30 bg-rainmap-accent2/15 text-rainmap-contrast text-sm tracking-wide transition-all duration-300 hover:bg-rainmap-accent2/25 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] backdrop-blur-xl flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Inicio
        </button>

        {/* Active Storms Button */}
        <button
          className="flex-1 p-2 rounded-xl border border-rainmap-accent2 bg-rainmap-accent2/20 text-rainmap-contrast text-sm tracking-wide shadow-[0_0_10px_rgba(0,240,255,0.35)] backdrop-blur-xl flex items-center justify-center gap-2 cursor-default"
        >
          <span className="inline-block w-3 h-3 rounded-full border border-rainmap-accent2 mr-2"></span>
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
