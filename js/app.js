const elementos = {
  buscar: document.querySelector("#buscar-destino"), estado: document.querySelector("#estado-destinos"), destinos: document.querySelector("#contenedor-destinos"),
  seleccionado: document.querySelector("#destino-seleccionado"), pasajeros: document.querySelector("#pasajeros"), noches: document.querySelector("#noches"), traslado: document.querySelector("#traslado"), asistencia: document.querySelector("#asistencia"), vistaPrevia: document.querySelector("#vista-previa"),
  cotizar: document.querySelector("#btn-cotizar"), vaciar: document.querySelector("#btn-vaciar"), confirmar: document.querySelector("#btn-confirmar"), cotizacion: document.querySelector("#contenedor-cotizacion"), resumen: document.querySelector("#resumen")
};
let destinos = [], destinoElegido = null;
const mostrarCotizacion = () => { const cotizacion = obtenerCotizacion(); renderizarCotizacion(cotizacion, elementos.cotizacion, elementos.resumen); elementos.confirmar.classList.toggle("oculto", !cotizacion); };
const obtenerDetalle = () => {
  if (!destinoElegido) return null;
  const pasajeros = Number(elementos.pasajeros.value), noches = Number(elementos.noches.value);
  if (!pasajeros || !noches) return null;
  const traslado = Number(elementos.traslado.value);
  const asistencia = elementos.asistencia.checked ? 6700 * noches * pasajeros : 0;
  const extras = [traslado ? `Traslado ${traslado === 60000 ? "ida y vuelta" : "solo ida"}` : null, elementos.asistencia.checked ? "Asistencia al viajero" : null].filter(Boolean);
  const desglose = { paqueteBase: destinoElegido.precioBase * pasajeros, estadia: destinoElegido.precioNoche * noches * pasajeros, traslado, asistencia };
  return { destino: destinoElegido, pasajeros, noches, extras, desglose, total: desglose.paqueteBase + desglose.estadia + desglose.traslado + desglose.asistencia };
};
const actualizarVistaPrevia = () => {
  const detalle = obtenerDetalle();
  if (!detalle) { elementos.vistaPrevia.textContent = "Elegí un destino e ingresá pasajeros y noches para ver tu estimación."; return; }
  const porNoche = (destinoElegido.precioNoche + (elementos.asistencia.checked ? 6700 : 0)) * detalle.pasajeros;
  elementos.vistaPrevia.innerHTML = `<span>Estimación para ${detalle.noches} noche(s)</span><strong>${dinero(detalle.total)}</strong><small>Cada noche adicional suma aproximadamente ${dinero(porNoche)}.</small>`;
};
const cargarDestinos = async () => {
  elementos.estado.textContent = "Cargando destinos…";
  try { const respuesta = await fetch("./data/destinos.json"); if (!respuesta.ok) throw new Error("No se pudieron obtener los destinos"); destinos = await respuesta.json(); renderizarDestinos(destinos, elementos.destinos, destinoElegido?.id); elementos.estado.textContent = `${destinos.length} destinos disponibles.`; avisar("Destinos cargados con éxito"); }
  catch { elementos.estado.textContent = "No se pudieron cargar los destinos. Recargá la página."; avisar("Error al cargar destinos", "error"); }
  finally { elementos.estado.classList.remove("oculto"); }
};
const calcularCotizacion = () => {
  try {
    if (!destinoElegido) throw new Error("Elegí un destino antes de cotizar");
    const detalle = obtenerDetalle();
    if (!detalle) throw new Error("Ingresá pasajeros y noches válidos");
    guardarCotizacion(detalle); mostrarCotizacion(); document.querySelector(".mi-cotizacion").scrollIntoView({behavior:"smooth", block:"start"}); avisar("Cotización guardada. Revisá el detalle de tu viaje.");
  } catch (error) { avisar(error.message, "error"); }
};
elementos.buscar.addEventListener("input", ({target}) => { const termino = target.value.toLowerCase(); const resultados = destinos.filter(({nombre,pais}) => `${nombre} ${pais}`.toLowerCase().includes(termino)); renderizarDestinos(resultados, elementos.destinos, destinoElegido?.id); elementos.estado.textContent = termino ? `${resultados.length} destino(s) encontrado(s).` : `${destinos.length} destinos disponibles.`; });
elementos.destinos.addEventListener("click", ({target}) => { const id = Number(target.closest(".btn-elegir")?.dataset.id); const encontrado = destinos.find(destino => destino.id === id); if (encontrado) { destinoElegido = encontrado; elementos.seleccionado.textContent = `Destino elegido: ${encontrado.nombre}, ${encontrado.pais}`; elementos.cotizar.disabled = false; actualizarVistaPrevia(); renderizarDestinos(destinos, elementos.destinos, id); document.querySelector("#cotizador").scrollIntoView({behavior:"smooth", block:"start"}); avisar("Destino seleccionado. Ahora personalizá tu viaje."); } });
 [elementos.pasajeros, elementos.noches, elementos.traslado, elementos.asistencia].forEach(campo => campo.addEventListener("input", actualizarVistaPrevia));
elementos.cotizar.addEventListener("click", calcularCotizacion);
elementos.vaciar.addEventListener("click", () => { vaciarCotizacion(); mostrarCotizacion(); avisar("Cotización eliminada"); });
elementos.cotizacion.addEventListener("click", ({target}) => { if (target.id === "btn-eliminar-cotizacion") { vaciarCotizacion(); mostrarCotizacion(); avisar("Cotización eliminada"); } });
elementos.confirmar.addEventListener("click", () => window.Swal?.fire({icon:"success",title:"Reserva confirmada",text:"Tu solicitud fue registrada."}));
mostrarCotizacion(); cargarDestinos();
