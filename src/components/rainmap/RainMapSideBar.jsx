import { useEffect, useRef, useState } from "react"

const API_BASE_URL = "https://weatherstorm-app-backend-weather-app.up.railway.app"
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://weatherstorm-app-backend-weather-app.up.railway.app" || "http://localhost:8000";

export default function RainmapSidebar({
  view,
  setView,
  setSelectedCity,
  weatherData,
  setWeatherData,
  onToggleSidebar,
  onNavigateHome
}) {
  const MEXICAN_CITIES = [{ name: "Ciudad de Mexico", state: "CDMX" }, { name: "Guadalajara", state: "Jalisco" }, { name: "Monterrey", state: "Nuevo León" }, { name: "Puebla", state: "Puebla" }, { name: "Tijuana", state: "Baja California" }, { name: "León", state: "Guanajuato" }, { name: "Juárez", state: "Chihuahua" }, { name: "Zapopan", state: "Jalisco" }, { name: "Mérida", state: "Yucatán" }, { name: "San Luis Potosí", state: "San Luis Potosí" }, { name: "Aguascalientes", state: "Aguascalientes" }, { name: "Hermosillo", state: "Sonora" }, { name: "Saltillo", state: "Coahuila" }, { name: "Mexicali", state: "Baja California" }, { name: "Culiacán", state: "Sinaloa" }, { name: "Querétaro", state: "Querétaro" }, { name: "Chihuahua", state: "Chihuahua" }, { name: "Morelia", state: "Michoacán" }, { name: "Toluca", state: "Estado de México" }, { name: "Cancún", state: "Quintana Roo" }, { name: "Acapulco", state: "Guerrero" }, { name: "Torreón", state: "Coahuila" }, { name: "Reynosa", state: "Tamaulipas" }, { name: "Tuxtla Gutiérrez", state: "Chiapas" }, { name: "Veracruz", state: "Veracruz" }, { name: "Mazatlán", state: "Sinaloa" }, { name: "Durango", state: "Durango" }, { name: "Oaxaca", state: "Oaxaca" }, { name: "Tampico", state: "Tamaulipas" }, { name: "Irapuato", state: "Guanajuato" }, { name: "Celaya", state: "Guanajuato" }, { name: "Cuernavaca", state: "Morelos" },]

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCities, setFilteredCities] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // SEARCH LOGIC
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = MEXICAN_CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.state?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
      setFilteredCities(filtered)
      setShowSuggestions(true)
    } else {
      setFilteredCities([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = async (city) => {
    setSelectedCity(city)
    setSearchQuery(city.name)
    setShowSuggestions(false)

    if (onToggleSidebar) onToggleSidebar()

    try {
      const res = await fetch(`${API_BASE_URL}/rainmap/city?selectedCity=${city.name}`)
      if (!res.ok) throw new Error("Error fetching city data")

      const data = await res.json()

      setWeatherData({
        city: city.name,
        state: city.state,
        precipitation: data.precipitation,
        lastUpdate: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })
    } catch (err) {
      console.error("❌ Error loading city data:", err)
    }
  }


  // NEW HIGH-CONTRAST COLOR MAP usando colores rainmap
  const getWeatherGlow = (p) => {
    if (p === 0) return "border-rainmap-accent/40"
    if (p < 0.3) return "border-rainmap-mid/60"
    if (p < 0.6) return "border-rainmap-accent2/60"
    if (p < 0.8) return "border-rainmap-accent2/70"
    return "border-rainmap-danger/80"
  }

  const weatherGlow = weatherData
    ? getWeatherGlow(weatherData.precipitation)
    : "border-rainmap-accent/40"

  return (
    <aside className="h-full bg-rainmap-bg/80 backdrop-blur-2xl border-l border-rainmap-glass-border flex flex-col shadow-[0_0_30px_rgba(41,121,255,0.08)] relative">

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

        {/* Minimalist Map Icon */}
        <button
          onClick={() => setView("map")}
          className={`flex-1 p-2 rounded-xl border text-sm tracking-wide transition-all duration-300
          ${view === "map"
              ? "bg-rainmap-accent2/20 border-rainmap-accent2 text-rainmap-contrast shadow-[0_0_10px_rgba(0,240,255,0.35)] backdrop-blur-xl"
              : "bg-rainmap-glass text-rainmap-muted border-rainmap-glass-border"}
          `}
        >
          <span className="inline-block w-3 h-3 rounded-full border border-rainmap-accent2 mr-2"></span>
          Mapa
        </button>

        {/* Close Button - Solo en móvil */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl border border-rainmap-glass-border bg-rainmap-glass text-rainmap-contrast hover:bg-rainmap-accent2/20 transition-all duration-300 flex items-center justify-center"
            aria-label="Cerrar sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* WEATHER + SEARCH */}
      <div className="p-5 overflow-y-auto flex-1" ref={searchRef}>

        {weatherData && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-rainmap-contrast">{weatherData.city}</h2>
            <p className="text-xs text-rainmap-muted mb-3">{weatherData.state}</p>

            <div
              className={`p-4 rounded-2xl border ${weatherGlow}
              bg-rainmap-glass backdrop-blur-2xl shadow-[0_0_25px_rgba(0,240,255,0.12)]`}
            >
              <p className="text-5xl text-rainmap-accent mb-3">
                {weatherData.precipitation === 0
                  ? "◎"
                  : weatherData.precipitation < 0.3
                    ? "◔"
                    : weatherData.precipitation < 0.6
                      ? "◑"
                      : "⬤"}
              </p>

              <p className="text-rainmap-contrast font-semibold text-lg">
                Precipitación: {(weatherData.precipitation * 100).toFixed(0)}%
              </p>

              <p className="text-xs text-rainmap-muted mt-1">
                Última actualización: {weatherData.lastUpdate}
              </p>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative mb-4">

          {/* Minimal search dot */}
          <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-rainmap-accent2"></div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            type="text"
            placeholder="Buscar ciudad..."
            className="pl-8 p-2 w-full rounded-xl bg-rainmap-glass backdrop-blur-xl border border-rainmap-accent2/20 text-rainmap-contrast placeholder-rainmap-muted focus:outline-none focus:ring-2 focus:ring-rainmap-accent2/15"
          />

          {/* FILTERED SUGGESTIONS — appears when typing */}
          {showSuggestions && filteredCities.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-rainmap-surface backdrop-blur-xl border border-rainmap-accent2/20 rounded-xl z-50 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
              {filteredCities.map((city, i) => (
                <button
                  key={i}
                  onClick={() => handleCitySelect(city)}
                  className="block w-full px-3 py-2 text-left text-rainmap-contrast hover:bg-rainmap-accent2/10 rounded-lg transition"
                >
                  {city.name}{" "}
                  <span className="text-rainmap-muted text-xs">({city.state})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* QUICK RECOMMENDED CITIES — always visible */}
        <div className="flex flex-col gap-2">
          {MEXICAN_CITIES.slice(0, 8).map((c) => (
            <button
              key={c.name}
              onClick={() => handleCitySelect(c)}
              className="p-3 rounded-xl bg-rainmap-glass backdrop-blur-xl border border-rainmap-accent2/10 hover:bg-rainmap-accent2/10 transition text-left shadow-[0_0_12px_rgba(0,240,255,0.05)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-rainmap-contrast">{c.name}</div>
                  <div className="text-xs text-rainmap-muted">{c.state}</div>
                </div>
                <div className="text-xs text-rainmap-muted">→</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
