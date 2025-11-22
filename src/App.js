import { useState, useEffect } from "react"
import HomePage from "./components/HomePage"
import Rainmap from "./components/rainmap/RainMapMain.jsx"
import Storms from "./components/dashboard/StormsMain.jsx"

// const API_BASE_URL = "http://localhost:8000"
const API_BASE_URL = "https://weatherstorm-app-backend-weather-app.up.railway.app"

// Función para procesar los datos de tormentas
const processStormData = (data, imageDate) => {
  let storms = []
  
  Object.keys(data).forEach(key => {
    const storm = data[key];
    if (typeof storm === 'object' && storm.id) {
      
      let categoria = 1
      if (storm.storm_type && Array.isArray(storm.storm_type)) {
        const lastType = storm.storm_type[storm.storm_type.length - 1]
        if (lastType === "HU") categoria = 3
        else if (lastType === "TS") categoria = 2
        else if (lastType === "TD") categoria = 1
      }
      
      const imageUrl = imageDate
        ? `${API_BASE_URL}/api/date/${imageDate}/maps/${storm.id}/0?v=${imageDate}`
        : `${API_BASE_URL}/api/maps/${storm.id}?v=${Date.now()}`

      storms.push({
        id: storm.id,
        nombre: storm.name,
        name: storm.name,
        categoria: categoria,
        category: categoria,
        velocidad_viento: storm.max_wind || 0,
        windSpeed: storm.max_wind || 0,
        presion: storm.min_pressure || 0,
        pressure: storm.min_pressure || 0,
        ubicacion: storm.basin === "north_atlantic" ? "Atlántico Norte" : 
                   storm.basin === "east_pacific" ? "Pacífico Este" : 
                   storm.basin,
        location: storm.basin === "north_atlantic" ? "North Atlantic" : 
                  storm.basin === "east_pacific" ? "East Pacific" : 
                  storm.basin,
        year: storm.year,
        season: storm.season,
        ace: storm.ace,
        invest: storm.invest,
        storm_type: storm.storm_type,
        estado: storm.invest ? "watch" : "active",
        status: storm.invest ? "watch" : "active",
        imageUrl: imageUrl 
      })
    }
  })
  
  console.log("✅ Tormentas procesadas:", storms)
  console.log(`📊 Total de tormentas: ${storms.length}`)
  return storms;
}

function App() {
  const [currentView, setCurrentView] = useState("home") // "home", "map", "dashboard"
  const [selectedCity, setSelectedCity] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [mainStormView, setMainStormView] = useState(null)
  const [activeStorms, setActiveStorms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [latestDate, setLatestDate] = useState(null)

  // useEffect #1: Para el CALENDARIO (fechas históricas)
  useEffect(() => {
    if (currentView === "dashboard" && latestDate) {
      setMainStormView(null);
      fetchStormsByDate(latestDate);
    }
  }, [latestDate, currentView])

  // useEffect: Para CAMBIAR DE VISTA (Carga inicial o Limpieza)
  useEffect(() => {
    if (currentView === "dashboard") {
      setMainStormView(null);
      if (!latestDate) {
        fetchLatestStorms();
      }
    } else if (currentView === "map") {
      setLatestDate(null);
      setActiveStorms([]);
      setError(null);
    }
  }, [currentView])

  // Función para navegar desde HomePage
  const navigateTo = (view) => {
    setCurrentView(view);
  }

  // Función para volver al home
  const navigateToHome = () => {
    setCurrentView("home");
    setMainStormView(null);
    setSelectedCity(null);
    setActiveStorms([]);
    setError(null);
  }

  // Función para el CALENDARIO (Histórico)
  const fetchStormsByDate = async (dateString) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/date/${dateString}/storms`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No se encontraron datos de tormentas para la fecha ${dateString}.`);
        }
        throw new Error('Error al conectar con el servidor.')
      }
      
      const data = await response.json()
      console.log(`📦 Datos COMPLETOS (${dateString}) recibidos:`, data)

      const stormsData = data.data || {};
      console.log(`🗂️ stormsData bruto:`, stormsData)
      
      let actualStormsData = null;
      const tormentasKey = Object.keys(stormsData).find(key => 
        key.startsWith('tormentas') && typeof stormsData[key] === 'object'
      );
      
      if (tormentasKey) {
        actualStormsData = stormsData[tormentasKey];
        console.log(`✅ Encontrado archivo: ${tormentasKey}`)
      }
      
      console.log(`🌀 Datos de tormentas a procesar:`, actualStormsData)

      if (!actualStormsData || Object.keys(actualStormsData).length === 0) {
        setActiveStorms([])
        console.log(`⚠️ No hay tormentas activas para la fecha ${dateString}.`);
      } else {
        console.log(`🔑 Claves de tormentas encontradas:`, Object.keys(actualStormsData))
        const storms = processStormData(actualStormsData, dateString);
        setActiveStorms(storms)
      }
      
    } catch (err) {
      console.error(`❌ Error fetching storms for date ${dateString}:`, err)
      setError(err.message) 
      setActiveStorms([]) 
    } finally {
      setLoading(false)
    }
  }

  // Función para la "Última Lectura"
  const fetchLatestStorms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`🕐 Cargando ÚLTIMA LECTURA...`)
      const response = await fetch(`${API_BASE_URL}/api/storms`, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar los datos de tormentas')
      }
      
      const data = await response.json()
      console.log("📦 Datos (ÚLTIMA LECTURA) recibidos:", data)
      
      const storms = processStormData(data, null);
      setActiveStorms(storms)
      
    } catch (err) {
      console.error('❌ Error fetching latest storms:', err)
      setError(err.message)
      setActiveStorms([])
    } finally {
      setLoading(false)
    }
  }

  // Renderizar la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={navigateTo} />
      
      case "map":
        return (
          <Rainmap
            view="map"
            setView={navigateTo}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            weatherData={weatherData}
            setWeatherData={setWeatherData}
            onNavigateHome={navigateToHome}
          />
        )
      
      case "dashboard":
        return (
          <Storms
            view="dashboard"
            setView={navigateTo}
            mainStormView={mainStormView}
            setMainStormView={setMainStormView}
            activeStorms={activeStorms}
            loading={loading}
            error={error}
            latestDate={latestDate}
            onDateChange={setLatestDate}
            onNavigateHome={navigateToHome}
          />
        )
      
      default:
        return <HomePage onNavigate={navigateTo} />
    }
  }

  return (
    <div className="min-h-screen bg-rainmap-bg text-rainmap-contrast overflow-hidden">
      {renderCurrentView()}
    </div>
  )
}

export default App