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

const guardarGastos = () => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(categoriasGastos));
};

const formatearDinero = (monto) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
}).format(monto);

const mostrarFeedback = (mensaje, esError = false) => {
    feedback.textContent = mensaje;
    feedback.className = esError ? "feedback-error" : "feedback-success";
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
    const nombre = inputNombre.value.trim();
    const presupuesto = Number(inputPresupuesto.value);

    if (!nombre || !Number.isFinite(presupuesto) || presupuesto <= 0) {
        mostrarFeedback("Completá un nombre y un presupuesto mayor a cero.", true);
        return;
    }

    categoriasGastos.push({ id: Date.now(), nombre, presupuesto });
    guardarGastos();
    renderizarGastos();
    inputNombre.value = "";
    inputPresupuesto.value = "";
    mostrarFeedback(`Se agregó ${nombre} a tu viaje.`);
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

botonAgregar.addEventListener("click", agregarGasto);
buscador.addEventListener("input", (evento) => renderizarGastos(evento.target?.value ?? ""));
botonVaciar.addEventListener("click", vaciarGastos);

contenedorCategorias.addEventListener("click", (evento) => {
    const boton = evento.target?.closest(".btn-eliminar");
    const id = Number(boton?.dataset.id);

    if (boton && Number.isFinite(id)) eliminarGasto(id);
});

renderizarGastos();
