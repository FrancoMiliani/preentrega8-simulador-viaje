// Categorías iniciales del simulador. Solo se usan la primera vez.
const gastosIniciales = [
    { id: 1, nombre: "Vuelos", presupuesto: 180000 },
    { id: 2, nombre: "Alojamiento", presupuesto: 120000 },
    { id: 3, nombre: "Comida", presupuesto: 65000 }
];

const CLAVE_STORAGE = "gastosViaje";

// JSON.parse recupera el array guardado. ?? mantiene los gastos iniciales si aún no hay datos.
const datosGuardados = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) ?? gastosIniciales;
let categoriasGastos = Array.isArray(datosGuardados) ? datosGuardados : gastosIniciales;

const buscador = document.querySelector("#buscar");
const inputNombre = document.querySelector("#nombre-categoria");
const inputPresupuesto = document.querySelector("#presupuesto-categoria");
const botonAgregar = document.querySelector("#btn-agregar");
const botonVaciar = document.querySelector("#btn-vaciar");
const contenedorCategorias = document.querySelector("#contenedor-categorias");
const resumen = document.querySelector("#resumen");
const feedback = document.querySelector("#feedback");
const estadoDestinos = document.querySelector("#estado-destinos");
const contenedorDestinos = document.querySelector("#contenedor-destinos");
let temporizadorFeedback;

const guardarGastos = () => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(categoriasGastos));
};

const formatearDinero = (monto) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
}).format(monto);

const mostrarFeedback = (mensaje, esError = false) => {
    clearTimeout(temporizadorFeedback);
    feedback.textContent = mensaje;
    feedback.className = esError ? "feedback-error" : "feedback-success";

    temporizadorFeedback = setTimeout(() => {
        feedback.textContent = "";
        feedback.className = "oculto";
    }, 5000);
};

const renderizarGastos = (textoBusqueda = buscador?.value ?? "") => {
    const termino = textoBusqueda.trim().toLowerCase();
    const gastosFiltrados = categoriasGastos.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );

    contenedorCategorias.innerHTML = "";
    const total = categoriasGastos.reduce((acumulado, { presupuesto }) => acumulado + presupuesto, 0);
    resumen.textContent = categoriasGastos.length > 0
        ? `${categoriasGastos.length} categorías · Total planeado: ${formatearDinero(total)}`
        : "Todavía no agregaste gastos planeados.";

    if (gastosFiltrados.length === 0) {
        contenedorCategorias.innerHTML = `<p class="estado-vacio">${termino ? "No se encontraron categorías." : "No hay gastos guardados."}</p>`;
        return;
    }

    gastosFiltrados.forEach((categoria) => {
        // Destructuring para acceder de forma clara a cada objeto gasto.
        const { id, nombre, presupuesto } = categoria;
        const tarjeta = document.createElement("article");
        tarjeta.className = "card";
        tarjeta.innerHTML = `
            <div class="card-info">
                <h3>${nombre}</h3>
                <p>Presupuesto: ${formatearDinero(presupuesto)}</p>
            </div>
            <button class="btn-eliminar" data-id="${id}" type="button" aria-label="Eliminar ${nombre}">Eliminar</button>
        `;
        contenedorCategorias.appendChild(tarjeta);
    });
};

const agregarGasto = () => {
    try {
        const nombre = inputNombre.value.trim();
        const presupuesto = Number(inputPresupuesto.value);

        if (!nombre || !Number.isFinite(presupuesto) || presupuesto <= 0) {
            throw new Error("Datos de gasto inválidos");
        }

        categoriasGastos.push({ id: Date.now(), nombre, presupuesto });
        guardarGastos();
        renderizarGastos();
        inputNombre.value = "";
        inputPresupuesto.value = "";
        mostrarFeedback(`Se agregó ${nombre} a tu viaje.`);
    } catch (error) {
        mostrarFeedback("No se pudo procesar la operación. Intentá de nuevo.", true);
    } finally {
        // Este bloque se ejecuta siempre, tanto si se agregó el gasto como si ocurrió un error.
        inputNombre.focus();
    }
};

const eliminarGasto = (id) => {
    const gastoAEliminar = categoriasGastos.find((gasto) => gasto.id === id);
    categoriasGastos = categoriasGastos.filter((gasto) => gasto.id !== id);
    guardarGastos();
    renderizarGastos();
    mostrarFeedback(`${gastoAEliminar?.nombre ?? "La categoría"} fue eliminada.`);
};

const vaciarGastos = () => {
    if (categoriasGastos.length === 0) {
        mostrarFeedback("No hay gastos para vaciar.", true);
        return;
    }

    categoriasGastos = [];
    // Se guarda el array vacío para que al recargar no vuelvan los gastos iniciales.
    guardarGastos();
    renderizarGastos();
    mostrarFeedback("Se eliminaron todos los gastos guardados.");
};

const renderizarDestinos = (destinos) => {
    contenedorDestinos.innerHTML = "";

    destinos.forEach(({ nombre, pais, dias, precioEstimado }) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "card destino-card";
        tarjeta.innerHTML = `
            <div class="card-info">
                <h3>📍 ${nombre}, ${pais}</h3>
                <p>${dias} días · Desde ${formatearDinero(precioEstimado)}</p>
            </div>
        `;
        contenedorDestinos.appendChild(tarjeta);
    });
};

const cargarDestinos = async () => {
    estadoDestinos.textContent = "Cargando destinos…";

    try {
        const respuesta = await fetch("./data.json");

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const destinos = await respuesta.json();

        if (!Array.isArray(destinos) || destinos.length === 0) {
            throw new Error("No hay destinos disponibles");
        }

        renderizarDestinos(destinos);
        estadoDestinos.textContent = "Destinos cargados correctamente.";

        window.Swal?.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Destinos cargados con éxito",
            showConfirmButton: false,
            timer: 2800,
            timerProgressBar: true
        });
    } catch (error) {
        contenedorDestinos.innerHTML = "";
        estadoDestinos.textContent = "No se pudieron cargar los destinos. Intentá recargar la página.";

        window.Swal?.fire({
            icon: "error",
            title: "No se pudieron cargar los destinos",
            text: "Verificá tu conexión e intentá nuevamente."
        });
    } finally {
        estadoDestinos.classList.remove("oculto");
    }
};

botonAgregar.addEventListener("click", agregarGasto);
buscador.addEventListener("input", (evento) => renderizarGastos(evento.target?.value ?? ""));
botonVaciar.addEventListener("click", vaciarGastos);

contenedorCategorias.addEventListener("click", (evento) => {
    const boton = evento.target?.closest(".btn-eliminar");
    const id = Number(boton?.dataset.id);

    if (boton && Number.isFinite(id)) eliminarGasto(id);
});

renderizarGastos();
cargarDestinos();

// Temporizador: información complementaria mostrada sin bloquear el simulador.
setTimeout(() => {
    mostrarFeedback("Tip viajero: reservá un 10 % extra del presupuesto para imprevistos.");
}, 2500);
