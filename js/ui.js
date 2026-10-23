const dinero = (valor) => new Intl.NumberFormat("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 }).format(valor);
const avisar = (titulo, icono="success") => window.Swal?.fire({toast:true,position:"top-end",icon:icono,title:titulo,showConfirmButton:false,timer:2600});
const renderizarDestinos = (destinos, contenedor, destinoSeleccionadoId = null) => {
  if (!destinos.length) { contenedor.innerHTML = `<p class="sin-resultados">No encontramos ese destino. Probá con otro nombre o país.</p>`; return; }
  contenedor.innerHTML = destinos.map(({id,nombre,pais,precioNoche,imagen}) => {
    const seleccionado = id === destinoSeleccionadoId;
    return `<article class="card destino ${seleccionado ? "seleccionado" : ""}"><img src="${imagen}" alt="Paisaje de ${nombre}"><div><h3>${nombre}</h3><p>${pais} · Desde ${dinero(precioNoche)} por noche</p></div><button class="btn-elegir" data-id="${id}">${seleccionado ? "Destino elegido" : "Elegir este destino"}</button></article>`;
  }).join("");
};
const renderizarCotizacion = (cotizacion, contenedor, resumen) => {
  if (!cotizacion) { contenedor.innerHTML=""; resumen.textContent="Todavía no hay una cotización."; return; }
  const { destino, pasajeros, noches, extras, total, desglose = {} } = cotizacion;
  const paqueteBase = desglose.paqueteBase ?? destino.precioBase * pasajeros;
  const estadia = desglose.estadia ?? destino.precioNoche * noches * pasajeros;
  const traslado = desglose.traslado ?? 0;
  const asistencia = desglose.asistencia ?? 0;
  resumen.textContent = `${pasajeros} pasajero(s) · ${noches} noche(s)`;
  contenedor.innerHTML = `<article class="card cotizacion-final"><div class="resumen-viaje"><p class="kicker-resumen">TU ESCAPADA A</p><h3>${destino.nombre}, ${destino.pais}</h3><p>${pasajeros} pasajero(s) · ${noches} noche(s) · ${extras.length ? extras.join(", ") : "Sin servicios extra"}</p></div><div class="desglose"><div class="item-desglose"><span>Paquete base</span><strong>${dinero(paqueteBase)}</strong></div><div class="item-desglose"><span>Estadía · ${noches} noche(s)</span><strong>${dinero(estadia)}</strong></div><div class="item-desglose"><span>Traslado</span><strong>${traslado ? dinero(traslado) : "No incluido"}</strong></div><div class="item-desglose"><span>Asistencia al viajero</span><strong>${asistencia ? dinero(asistencia) : "No incluida"}</strong></div></div><div class="total-cotizacion"><span>Total estimado</span><strong>${dinero(total)}</strong></div><button class="btn-eliminar" id="btn-eliminar-cotizacion">Eliminar</button></article>`;
};
