const CLAVE_COTIZACION = "cotizacionViaje";
const obtenerCotizacion = () => JSON.parse(localStorage.getItem(CLAVE_COTIZACION)) ?? null;
const guardarCotizacion = (cotizacion) => localStorage.setItem(CLAVE_COTIZACION, JSON.stringify(cotizacion));
const vaciarCotizacion = () => localStorage.removeItem(CLAVE_COTIZACION);
