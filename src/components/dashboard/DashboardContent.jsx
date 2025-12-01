import { useState, useEffect } from "react"
import { MapPin, Wind, AlertTriangle, Loader, ChevronLeft, ChevronRight } from "lucide-react"

const API_BASE_URL = "https://weatherstorm-app-backend-weather-app.up.railway.app"
// https://weatherstorm-app-backend-weather-app.up.railway.app/api/date/20251027/storms/0
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://weatherstorm-app-backend-weather-app.up.railway.app" || "http://localhost:8000";

// Popup para mostrar JSON
function InfoPopup({ isOpen, onClose, title, content, isLoading, error }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-rainmap-bg/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-rainmap-surface backdrop-blur-xl border border-rainmap-glass-border rounded-2xl p-6 w-[90%] max-w-lg shadow-[0_8px_30px_rgba(10,10,12,0.25)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-rainmap-contrast mb-3">{title}</h2>

        {/* Contenido del Popup */}
        <div className="bg-rainmap-bg p-4 rounded-xl border border-rainmap-glass-border overflow-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader className="w-8 h-8 text-rainmap-accent2 animate-spin" />
            </div>
          ) : error ? (
            <pre className="text-xs text-rainmap-danger whitespace-pre-wrap">
              Error al cargar datos: {error}
            </pre>
          ) : (
            <pre className="text-xs text-rainmap-muted whitespace-pre-wrap">
              {content ? JSON.stringify(content, null, 2) : "No hay datos disponibles."}
            </pre>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-rainmap-muted hover:text-rainmap-contrast transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rainmap-glass"
        >
          ✖
        </button>
      </div>
    </div>
  )
}

// Carrusel de Imágenes
function ImageCarousel({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setImageLoading(true)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setImageLoading(true)
  }

  useEffect(() => {
    setImageLoading(true)
    setCurrentIndex(0)
  }, [images])

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-rainmap-muted/30 mx-auto mb-2" />
        <p className="text-rainmap-muted">No hay imágenes disponibles</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border overflow-hidden min-h-[250px] md:min-h-[400px] flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-rainmap-glass z-10">
            <Loader className="w-8 h-8 text-rainmap-accent2 animate-spin" />
          </div>
        )}

        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`${title} - Imagen ${currentIndex + 1}`}
          className="w-full h-auto max-h-[600px] object-contain"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            console.error(`Error cargando imagen ${currentIndex}:`, images[currentIndex])
            setImageLoading(false)
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-rainmap-surface/80 hover:bg-rainmap-surface text-rainmap-contrast p-3 rounded-full border border-rainmap-glass-border transition-all z-20 hover:scale-110 backdrop-blur-sm"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-rainmap-surface/80 hover:bg-rainmap-surface text-rainmap-contrast p-3 rounded-full border border-rainmap-glass-border transition-all z-20 hover:scale-110 backdrop-blur-sm"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {images.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rainmap-surface/80 backdrop-blur-sm px-4 py-2 rounded-full border border-rainmap-glass-border z-20">
            <span className="text-rainmap-contrast text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && images.length <= 10 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setImageLoading(true)
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex
                ? "border-rainmap-accent2 shadow-lg shadow-rainmap-accent2/50"
                : "border-rainmap-glass-border opacity-60 hover:opacity-100 hover:border-rainmap-accent2/50"
                }`}
            >
              <img
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 10 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setImageLoading(true)
              }}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                ? "bg-rainmap-accent2 scale-125"
                : "bg-rainmap-muted/30 hover:bg-rainmap-muted/60"
                }`}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Carrusel General (PARA HISTÓRICO)
function GeneralMapCarousel({ latestDate }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!latestDate) return

    const loadGeneralMaps = async () => {
      try {
        setLoading(true)
        setError(null)
        setImages([])

        const listResponse = await fetch(`${API_BASE_URL}/api/date/${latestDate}/maps/general/list`)

        if (!listResponse.ok) {
          throw new Error('No se pudieron cargar las imágenes generales')
        }

        const listData = await listResponse.json()
        const imageUrls = listData.images.map(img =>
          `${API_BASE_URL}/api/date/${latestDate}/maps/general/${img.index}?v=${latestDate}`
        )

        setImages(imageUrls)

      } catch (err) {
        console.error('Error cargando mapas generales:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadGeneralMaps()
  }, [latestDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-rainmap-accent2 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-rainmap-danger mx-auto mb-2" />
        <p className="text-rainmap-danger">{error}</p>
      </div>
    )
  }

  return <ImageCarousel images={images} title="Mapa General" />
}

// Carrusel de Tormenta (HÍBRIDO: Histórico Y Última Lectura)
function StormMapCarousel({ stormId, latestDate }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stormId) return

    const loadStormMaps = async () => {
      try {
        setLoading(true)
        setError(null)
        setImages([])

        if (latestDate) {
          const listResponse = await fetch(`${API_BASE_URL}/api/date/${latestDate}/maps/${stormId}/list`)

          if (!listResponse.ok) {
            throw new Error(`No se pudieron cargar las imágenes de ${stormId}`)
          }

          const listData = await listResponse.json()
          const imageUrls = listData.images.map(img =>
            `${API_BASE_URL}/api/date/${latestDate}/maps/${stormId}/${img.index}?v=${latestDate}`
          )

          setImages(imageUrls)
        } else {
          const checkResponse = await fetch(`${API_BASE_URL}/api/maps/${stormId}`, { cache: 'no-store' })

          if (!checkResponse.ok) {
            throw new Error(`No se encontró mapa para ${stormId}`)
          }

          const imageUrl = `${API_BASE_URL}/api/maps/${stormId}?v=${Date.now()}`
          setImages([imageUrl])
        }

      } catch (err) {
        console.error(`Error cargando mapas de ${stormId}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStormMaps()
  }, [stormId, latestDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-rainmap-accent2 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-rainmap-danger mx-auto mb-2" />
        <p className="text-rainmap-danger">{error}</p>
      </div>
    )
  }

  return <ImageCarousel images={images} title={`Tormenta ${stormId}`} />
}

// Última Imagen General Disponible
function LatestAvailableGeneral() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    let isMounted = true
    const checkLatest = async () => {
      try {
        setLoading(true)
        setError(null)
        setImageLoading(true)

        const resp = await fetch(`${API_BASE_URL}/api/maps`, { cache: 'no-store' })
        if (!resp.ok) {
          throw new Error('No se encontró el mapa general más reciente')
        }

        if (isMounted) setImageUrl(`${API_BASE_URL}/api/maps?v=${Date.now()}`)
      } catch (err) {
        console.error('Error obteniendo el último mapa general:', err)
        if (isMounted) setError(err.message || 'Error al obtener el mapa')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkLatest()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-rainmap-accent2 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-rainmap-danger mx-auto mb-2" />
        <p className="text-rainmap-danger">{error}</p>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-rainmap-muted/30 mx-auto mb-2" />
        <p className="text-rainmap-muted">No hay mapa disponible</p>
      </div>
    )
  }

  return (
    <div className="relative bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border overflow-hidden min-h-[250px] md:min-h-[400px] flex items-center justify-center">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-rainmap-glass z-10">
          <Loader className="w-8 h-8 text-rainmap-accent2 animate-spin" />
        </div>
      )}

      <img
        src={imageUrl}
        alt="Mapa General - Último"
        className="w-full h-auto max-h-[600px] object-contain"
        onLoad={() => setImageLoading(false)}
        onError={(e) => {
          console.error('Error cargando el último mapa general', e)
          setImageLoading(false)
        }}
      />
    </div>
  )
}

// DashboardContent Principal
export default function DashboardContent({ mainStormView, setMainStormView, activeStorms = [], loading, error, latestDate }) {
  const [showInfo, setShowInfo] = useState(false)
  const [popupTitle, setPopupTitle] = useState("Datos JSON")
  const [popupContent, setPopupContent] = useState(null)
  const [isPopupLoading, setIsPopupLoading] = useState(false)
  const [popupError, setPopupError] = useState(null)

  const getDangerLevelColor = (category) => {
    if (category >= 4) return "bg-rainmap-danger"
    if (category >= 2) return "bg-rainmap-accent2"
    return "bg-rainmap-accent"
  }

  const closePopup = () => {
    setShowInfo(false)
    setPopupContent(null)
    setPopupError(null)
    setIsPopupLoading(false)
  }

  const handleHistoricJsonClick = async (storm = null) => {
    setShowInfo(true)
    setIsPopupLoading(true)
    setPopupError(null)
    setPopupContent(null)

    let url = ""
    if (storm) {
      setPopupTitle(`Datos JSON: ${storm.nombre || storm.id}`)
      url = `${API_BASE_URL}/api/date/${latestDate}/storms/${storm.id}`
    } else {
      setPopupTitle(`Datos JSON: Vista General (${latestDate})`)
      url = `${API_BASE_URL}/api/date/${latestDate}/storms`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error ${response.status}`)
      }
      const data = await response.json()
      setPopupContent(data)

    } catch (err) {
      console.error("Error fetching JSON:", err)
      setPopupError(err.message)
    } finally {
      setIsPopupLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-rainmap-bg flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-rainmap-accent2 animate-spin mx-auto mb-4" />
          <p className="text-rainmap-muted">Cargando datos de tormentas...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-rainmap-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rainmap-danger mx-auto mb-4" />
          <p className="text-rainmap-danger mb-2">Error al cargar datos</p>
          <p className="text-rainmap-muted text-sm">{error}</p>
        </div>
      </section>
    )
  }

  // VISTA #1: ÚLTIMA LECTURA (sin fecha seleccionada)
  if (!latestDate) {
    return (
      <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-rainmap-bg">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-rainmap-contrast mb-2">
            {mainStormView ? mainStormView.nombre || mainStormView.name : "Última Lectura General"}
          </h1>
          <p className="text-rainmap-muted text-sm">
            {mainStormView ? `ID: ${mainStormView.id}` : "Mostrando el mapa general y tormentas más recientes."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setMainStormView(null)}
            className={`bg-rainmap-glass backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden text-left group hover:scale-[1.02] ${!mainStormView
              ? "border-rainmap-accent2/40 shadow-lg shadow-rainmap-accent2/25"
              : "border-rainmap-glass-border hover:border-rainmap-accent2/30 shadow-lg hover:shadow-rainmap-accent2/15"
              }`}
          >
            <div className="h-1 bg-gradient-to-r from-rainmap-accent/50 to-rainmap-accent2/50" />
            <div className="relative aspect-[4/3] flex items-center justify-center bg-rainmap-surface">
              {/* Preview de la imagen general */}
              <img
                src={`${API_BASE_URL}/api/maps?v=${Date.now()}`}
                alt="Vista General Preview"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-rainmap-contrast group-hover:text-rainmap-accent2 transition-colors">
                Vista General
              </h3>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await fetch("http://localhost:8000/api/storms");
                    const data = await res.json();

                    setPopupTitle("Datos JSON - Vista General");
                    setPopupContent(data);
                    setShowInfo(true);
                  } catch (error) {
                    console.error(error);
                    setPopupTitle("Error al cargar JSON");
                    setPopupContent({ error: "No se pudo obtener el JSON general." });
                    setShowInfo(true);
                  }
                }}
                className="mt-2 bg-rainmap-accent2/20 hover:bg-rainmap-accent2/30 text-rainmap-accent2 px-3 py-1 rounded-lg text-xs transition-all border border-rainmap-accent2/20"
              >
                JSON
              </button>
            </div>
          </button>

          {activeStorms.map((storm) => {
            const isSelected = mainStormView?.id === storm.id
            const category = storm.categoria || storm.category || 1
            const dangerColor = getDangerLevelColor(category)
            return (
              <button
                key={storm.id}
                onClick={() => setMainStormView(storm)}
                className={`bg-rainmap-glass backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden text-left group hover:scale-[1.02] ${isSelected
                  ? "border-rainmap-accent2/40 shadow-lg shadow-rainmap-accent2/25"
                  : "border-rainmap-glass-border hover:border-rainmap-accent2/30 shadow-lg hover:shadow-rainmap-accent2/15"
                  }`}
              >
                <div className={`h-1 ${dangerColor}`} />
                <div className="relative aspect-[4/3] flex items-center justify-center bg-rainmap-surface">
                  {storm.imageUrl && !storm.invest ? (
                    <img
                      src={storm.imageUrl}
                      alt={storm.nombre || storm.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={storm.imageUrl && !storm.invest ? "hidden" : "flex"} style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <Wind className="w-12 h-12 text-rainmap-accent2/40" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-rainmap-contrast group-hover:text-rainmap-accent2 transition-colors">
                    {storm.nombre || storm.name || `Tormenta ${storm.id}`}
                  </h3>
                  <p className="text-xs text-rainmap-muted mt-1">
                    Categoría {category}
                  </p>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        const res = await fetch(`http://localhost:8000/api/storms/${storm.id}`)
                        const data = await res.json()

                        setPopupTitle(`Datos JSON - Tormenta ${storm.id}`)
                        setPopupContent(data)
                        setShowInfo(true)
                      } catch (error) {
                        console.error(error)
                        setPopupTitle("Error al cargar JSON")
                        setPopupContent({ error: `No se pudo obtener el JSON de la tormenta ${storm.id}.` })
                        setShowInfo(true)
                      }
                    }}
                    className="mt-2 bg-rainmap-accent2/20 hover:bg-rainmap-accent2/30 text-rainmap-accent2 px-3 py-1 rounded-lg text-xs transition-all border border-rainmap-accent2/20"
                  >
                    JSON
                  </button>
                </div>
              </button>
            )
          })}
        </div>

        {activeStorms.length === 0 && (
          <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border p-12 text-center mb-6">
            <Wind className="w-16 h-16 text-rainmap-muted/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-rainmap-contrast mb-2">No hay tormentas activas</h3>
            <p className="text-rainmap-muted">No se detectan tormentas tropicales en la última lectura.</p>
          </div>
        )}

        <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border overflow-hidden">
          <div className="p-4 border-b border-rainmap-glass-border">
            <h2 className="text-xl font-bold text-rainmap-contrast">
              {
                !mainStormView
                  ? "Mapa General (Última Lectura)"
                  : mainStormView.invest
                    ? `Área de Investigación: ${mainStormView.nombre || mainStormView.name}`
                    : `Mapa de ${mainStormView.nombre || mainStormView.name} (Última Lectura)`
              }
            </h2>
          </div>

          <div className="p-4">
            {
              !mainStormView ? (
                <LatestAvailableGeneral />
              )
                : mainStormView.invest ? (
                  <div className="text-center py-8">
                    <Wind className="w-12 h-12 text-rainmap-muted/30 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-rainmap-contrast">Investigación Activa</h3>
                    <p className="text-rainmap-muted">No hay mapas individuales para esta área.</p>
                  </div>
                )
                  : (
                    <StormMapCarousel
                      stormId={mainStormView.id}
                      latestDate={null}
                    />
                  )
            }
          </div>
        </div>

        <InfoPopup
          isOpen={showInfo}
          onClose={closePopup}
          title={popupTitle}
          content={popupContent}
          isLoading={isPopupLoading}
          error={popupError}
        />
      </section>
    )
  }

  // VISTA #2: HISTÓRICO (con fecha seleccionada)
  return (
    <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-rainmap-bg">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-rainmap-contrast mb-2">
          {mainStormView ? mainStormView.nombre || mainStormView.name : "Vista General de Tormentas"}
        </h1>
        <p className="text-rainmap-muted text-sm">
          {mainStormView
            ? `${mainStormView.ubicacion || mainStormView.location || 'Sin ubicación'}`
            : "Monitoreo en tiempo real de tormentas tropicales"}
        </p>
        {latestDate && (
          <p className="text-rainmap-muted text-xs mt-1">
            Datos para la fecha: {latestDate ? `${latestDate.substring(6, 8)}/${latestDate.substring(4, 6)}/${latestDate.substring(0, 4)}` : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setMainStormView(null)}
          className={`bg-rainmap-glass backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden text-left group hover:scale-[1.02] ${!mainStormView
            ? "border-rainmap-accent2/40 shadow-lg shadow-rainmap-accent2/25"
            : "border-rainmap-glass-border hover:border-rainmap-accent2/30 shadow-lg hover:shadow-rainmap-accent2/15"
            }`}
        >
          <div className="h-1 bg-gradient-to-r from-rainmap-accent/50 to-rainmap-accent2/50" />
          <div className="relative aspect-[4/3] flex items-center justify-center">
            {/* Preview de la imagen general */}
            <img
              src={`${API_BASE_URL}/api/maps?v=${Date.now()}`}
              alt="Vista General Preview"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-bold text-rainmap-contrast group-hover:text-rainmap-accent2 transition-colors">
              Vista General
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleHistoricJsonClick(null)
              }}
              className="mt-2 bg-rainmap-accent2/20 hover:bg-rainmap-accent2/30 text-rainmap-accent2 px-3 py-1 rounded-lg text-xs transition-all border border-rainmap-accent2/20"
            >
              JSON
            </button>
          </div>
        </button>

        {activeStorms.map((storm) => {
          const isSelected = mainStormView?.id === storm.id
          const category = storm.categoria || storm.category || 1
          const dangerColor = getDangerLevelColor(category)

          return (
            <button
              key={storm.id}
              onClick={() => setMainStormView(storm)}
              className={`bg-rainmap-glass backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden text-left group hover:scale-[1.02] ${isSelected
                ? "border-rainmap-accent2/40 shadow-lg shadow-rainmap-accent2/25"
                : "border-rainmap-glass-border hover:border-rainmap-accent2/30 shadow-lg hover:shadow-rainmap-accent2/15"
                }`}
            >
              <div className={`h-1 ${dangerColor}`} />
              <div className="relative aspect-[4/3] flex items-center justify-center bg-rainmap-surface">
                {storm.imageUrl && !storm.invest ? (
                  <img
                    src={storm.imageUrl}
                    alt={storm.nombre || storm.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                <div className={storm.imageUrl && !storm.invest ? "hidden" : "flex"} style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <Wind className="w-12 h-12 text-rainmap-accent2/40" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-rainmap-contrast group-hover:text-rainmap-accent2 transition-colors">
                  {storm.nombre || storm.name || `Tormenta ${storm.id}`}
                </h3>
                <p className="text-xs text-rainmap-muted mt-1">
                  Categoría {category}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleHistoricJsonClick(storm)
                  }}
                  className="mt-2 bg-rainmap-accent2/20 hover:bg-rainmap-accent2/30 text-rainmap-accent2 px-3 py-1 rounded-lg text-xs transition-all border border-rainmap-accent2/20"
                >
                  JSON
                </button>
              </div>
            </button>
          )
        })}
      </div>

      {activeStorms.length === 0 && (
        <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border p-12 text-center mb-6">
          <Wind className="w-16 h-16 text-rainmap-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rainmap-contrast mb-2">No hay tormentas activas</h3>
          <p className="text-rainmap-muted">No se detectan tormentas tropicales para la fecha seleccionada.</p>
        </div>
      )}

      <div className="bg-rainmap-glass backdrop-blur-xl rounded-2xl border border-rainmap-glass-border overflow-hidden mt-6">
        <div className="p-4 border-b border-rainmap-glass-border">
          <h2 className="text-xl font-bold text-rainmap-contrast">
            {
              !mainStormView
                ? "Mapas Generales de Tormentas"
                : mainStormView.invest
                  ? `Área de Investigación: ${mainStormView.nombre || mainStormView.name}`
                  : `Mapas de ${mainStormView.nombre || mainStormView.name}`
            }
          </h2>

          <p className="text-sm text-rainmap-muted mt-1">
            {mainStormView
              ? `ID: ${mainStormView.id}`
              : `Todas las actualizaciones del ${latestDate || 'día seleccionado'}`}
          </p>
        </div>

        <div className="p-4">
          {
            !mainStormView ? (
              <GeneralMapCarousel latestDate={latestDate} />
            )
              : mainStormView.invest ? (
                <div className="text-center py-8">
                  <Wind className="w-12 h-12 text-rainmap-muted/30 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-rainmap-contrast">Investigación Activa</h3>
                  <p className="text-rainmap-muted">
                    No hay mapas de pronóstico individuales para esta área de investigación.
                  </p>
                </div>
              )
                : (
                  <StormMapCarousel
                    stormId={mainStormView.id}
                    latestDate={latestDate}
                  />
                )
          }
        </div>
      </div>

      <InfoPopup
        isOpen={showInfo}
        onClose={closePopup}
        title={popupTitle}
        content={popupContent}
        isLoading={isPopupLoading}
        error={popupError}
      />
    </section>
  )
}