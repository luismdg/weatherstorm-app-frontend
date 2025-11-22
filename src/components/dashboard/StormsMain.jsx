import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar.jsx";
import DashboardContent from "./DashboardContent.jsx";

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
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-rainmap-bg text-rainmap-contrast overflow-hidden relative">

            {/* --- BARRA SUPERIOR MEJORADA CON LIQUID GLASS EFFECT --- */}
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

                {/* Bandera de México con Liquid Glass Effect */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {/* Contenedor con efecto de vidrio líquido */}
                        <div>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/2560px-Flag_of_Mexico.svg.png"
                                alt="Bandera de México"
                                className="w-8 h-5 object-cover rounded-sm"
                            />
                        </div>
                        {/* Efecto de brillo sutil */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rainmap-accent2/10 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>

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

            {/* --- OVERLAY --- */}
            {
                open && (
                    <div
                        className="fixed inset-0 bg-rainmap-bg/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                )
            }

            {/* --- CONTENIDO PRINCIPAL CON MARGIN SUPERIOR --- */}
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
