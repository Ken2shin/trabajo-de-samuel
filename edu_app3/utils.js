// utils.js

// Actualizar la interfaz de usuario basada en el usuario actual desde appData
function actualizarInterfazUsuario() {
    const usuarioInfo = document.getElementById('usuario-info');
    const usuarioActual = appData.getUsuarioActual();
    console.log('Actualizando interfaz de usuario para:', usuarioActual);

    if (usuarioInfo) {
        if (usuarioActual) {
            usuarioInfo.innerHTML = `
                <span>Usuario: ${usuarioActual.nombre} ${usuarioActual.apellido} (${usuarioActual.rol})</span> | 
                <a href="#" class="text-white" onclick="window.utils.logoutUsuario(); window.location.href='index.html'">Cerrar Sesión</a>
            `;
            console.log('Interfaz actualizada para usuario logueado:', usuarioActual);
        } else {
            usuarioInfo.innerHTML = `
                <button class="btn btn-outline-light btn-sm" onclick="window.location.href='index.html'">Iniciar Sesión</button>
            `;
            console.log('Interfaz actualizada para usuario no logueado');
        }
    } else {
        console.warn('Elemento #usuario-info no encontrado en la página');
    }
}

// Función de logout que limpia el usuario actual
function logoutUsuario() {
    localStorage.removeItem('usuarioActual');
    console.log('Sesión cerrada, usuarioActual eliminado de localStorage');
    appData.registrarHistorial('Cerrar Sesión', 'Usuario cerró sesión');
}

// Mostrar estadísticas de estudiantes (mejorada para notas)
function mostrarEstadisticas(estudiantes) {
    const historialCambios = document.getElementById('historial-cambios');
    if (historialCambios) {
        const totalEstudiantes = estudiantes.length;
        const conNotas = estudiantes.filter(e => e.notas && e.notas.length > 0).length;
        const promedioGeneral = estudiantes
            .map(e => parseFloat(appData.calcularPromedio(e)))
            .filter(p => !isNaN(p))
            .reduce((acc, p) => acc + p, 0) / (conNotas || 1);

        historialCambios.innerHTML += `
            <div class="mt-3">
                <h4>Estadísticas</h4>
                <p>Total de estudiantes: ${totalEstudiantes}</p>
                <p>Estudiantes con notas: ${conNotas}</p>
                <p>Promedio general: ${isNaN(promedioGeneral) ? 'N/A' : promedioGeneral.toFixed(2)}</p>
            </div>
        `;
        console.log('Estadísticas mostradas:', { totalEstudiantes, conNotas, promedioGeneral });
    } else {
        console.warn('Elemento #historial-cambios no encontrado para mostrar estadísticas');
    }
}

// Exportar funciones como utils
window.utils = {
    actualizarInterfazUsuario,
    logoutUsuario,
    mostrarEstadisticas
};

// Ejecutar actualización inicial si estamos en una página con usuario-info
if (document.getElementById('usuario-info')) {
    actualizarInterfazUsuario();
    console.log('Actualización inicial de la interfaz ejecutada');
}