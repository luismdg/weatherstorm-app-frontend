import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar.jsx";
import DashboardContent from "./DashboardContent.jsx";
import { Bell, AlertTriangle, X, Info } from "lucide-react";

export default function Storms({
    view,
    setView,
    mainStormView,
    setMainStormView,
    activeStorms,
    loading,
    error,
    latestDate,
    onDateChange,
    onNavigateHome
}) {
    // Estado para el menú móvil (sidebar)
    const [open, setOpen] = useState(false);
    // Estado para el popup de notificaciones
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="flex min-h-screen bg-rainmap-bg text-rainmap-contrast overflow-hidden relative">

            {/* --- BARRA SUPERIOR MEJORADA (MÓVIL) --- */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-rainmap-glass backdrop-blur-2xl border-b border-rainmap-glass-border z-40 flex items-center justify-between px-4 md:hidden">
                {/* Botón Hamburguesa a la izquierda */}
                <button
                    onClick={() => setOpen(true)}
                    className="p-2 bg-rainmap-glass/60 backdrop-blur-xl border border-rainmap-glass-border rounded-lg shadow-lg hover:bg-rainmap-accent2/20 hover:border-rainmap-accent2/40 transition-all duration-300"
                    aria-label="Abrir menú"
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-rainmap-contrast">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>

                {/* Área Derecha: Notificaciones + Bandera */}
                <div className="flex items-center gap-3">

                    {/* Botón Campana (Móvil) */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-full hover:bg-rainmap-accent2/10 transition-colors"
                    >
                        <Bell className="w-6 h-6 text-rainmap-contrast" />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-rainmap-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-rainmap-bg">
                            2
                        </span>
                    </button>

                    {/* Bandera de México con efecto Glass */}
                    <div className="relative">
                        <div>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/2560px-Flag_of_Mexico.svg.png"
                                alt="Bandera de México"
                                className="w-8 h-5 object-cover rounded-sm"
                            />
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rainmap-accent2/10 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* --- BOTÓN DE NOTIFICACIONES (DESKTOP) --- */}
            {/* Se muestra solo en pantallas medianas y grandes (md:block) */}
            <div className="hidden md:block absolute top-6 right-8 z-50">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 bg-rainmap-glass backdrop-blur-xl border border-rainmap-glass-border rounded-xl shadow-lg hover:bg-rainmap-accent2/10 hover:border-rainmap-accent2/30 transition-all group"
                >
                    <Bell className="w-6 h-6 text-rainmap-contrast group-hover:text-rainmap-accent2 transition-colors" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rainmap-danger text-white text-xs font-bold flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,50,50,0.5)] border border-rainmap-bg">
                        2
                    </span>
                </button>
            </div>

            {/* --- POPUP DE NOTIFICACIONES --- */}
            {showNotifications && (
                <>
                    {/* Backdrop invisible para cerrar al hacer click fuera */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>

                    {/* Contenedor del Popup - Usando bg-rainmap-bg para el tema oscuro */}
                    <div className="absolute top-20 right-4 md:top-20 md:right-8 z-50 w-80 md:w-96 bg-rainmap-bg/95 backdrop-blur-2xl border border-rainmap-glass-border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header del Popup */}
                        <div className="p-4 border-b border-rainmap-glass-border flex justify-between items-center bg-rainmap-glass">
                            <h3 className="font-bold text-rainmap-contrast flex items-center gap-2">
                                <Bell className="w-4 h-4 text-rainmap-accent2" />
                                Notificaciones
                            </h3>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="text-rainmap-muted hover:text-rainmap-contrast transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Lista de Notificaciones Hardcodeadas */}
                        <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">

                            {/* Notificación 1: Riesgo Alto */}
                            <div className="p-3 rounded-xl bg-rainmap-glass border border-rainmap-danger/30 hover:bg-rainmap-danger/5 transition-colors relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rainmap-danger"></div>
                                <div className="flex gap-3">
                                    <div className="mt-1 min-w-[24px]">
                                        <div className="w-8 h-8 rounded-full bg-rainmap-danger/20 flex items-center justify-center text-rainmap-danger">
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rainmap-contrast">Riesgo de Tormenta Severa</h4>
                                        <p className="text-xs text-rainmap-muted mt-1 leading-relaxed">
                                            Posible formación ciclónica frente a las costas de <strong className="text-rainmap-contrast">Guerrero</strong>. Se recomienda precaución a la navegación.
                                        </p>
                                        <div className="mt-2 text-[10px] text-rainmap-muted/70 flex items-center gap-1">
                                            Hace 2 horas • Fuente: NHC
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notificación 2: Aviso Preventivo */}
                            <div className="p-3 rounded-xl bg-rainmap-glass border border-rainmap-accent2/30 hover:bg-rainmap-accent2/5 transition-colors relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rainmap-accent2"></div>
                                <div className="flex gap-3">
                                    <div className="mt-1 min-w-[24px]">
                                        <div className="w-8 h-8 rounded-full bg-rainmap-accent2/20 flex items-center justify-center text-rainmap-accent2">
                                            <Info className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rainmap-contrast">Aviso de Oleaje Alto</h4>
                                        <p className="text-xs text-rainmap-muted mt-1 leading-relaxed">
                                            Se pronostica oleaje de 2 a 3 metros en el norte de <strong className="text-rainmap-contrast">Quintana Roo</strong> debido a vientos sostenidos.
                                        </p>
                                        <div className="mt-2 text-[10px] text-rainmap-muted/70 flex items-center gap-1">
                                            Hace 5 horas • Fuente: SMN
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-rainmap-glass-border bg-rainmap-glass/50 text-center">
                            <button className="text-xs text-rainmap-accent2 hover:underline">
                                Ver todas las alertas
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* --- SIDEBAR --- */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-80 z-50 transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:relative
                    border-r border-rainmap-glass-border/30
                `}
            >
                <DashboardSidebar
                    view={view}
                    setView={setView}
                    mainStormView={mainStormView}
                    activeStorms={activeStorms}
                    activeDate={latestDate}
                    onDateChange={onDateChange}
                    onNavigateHome={onNavigateHome}
                    onToggleSidebar={() => setOpen(false)}
                />
            </div>

            {/* --- OVERLAY PARA SIDEBAR MÓVIL --- */}
            {
                open && (
                    <div
                        className="fixed inset-0 bg-rainmap-bg/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                )
            }

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-1 overflow-auto mt-16 md:mt-0">
                <DashboardContent
                    mainStormView={mainStormView}
                    setMainStormView={setMainStormView}
                    activeStorms={activeStorms}
                    loading={loading}
                    error={error}
                    latestDate={latestDate}
                />
            </div>
        </div>
    );
}