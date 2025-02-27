// profesor.js
document.addEventListener('DOMContentLoaded', () => {
    // Verificación del usuario actual
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual || usuarioActual.rol !== 'profesor') {
        alert('Acceso denegado. Solo para profesores.');
        window.location.href = 'index.html';
        return;
    }

    // Inicializar datos desde localStorage
    appData.tareas = appData.loadFromStorage('tareas') || [];
    appData.estudiantes = appData.loadFromStorage('estudiantes') || [];
    appData.matriculas = appData.loadFromStorage('matriculas') || [];

    // Cargar foto de perfil si existe
    const fotoPerfil = localStorage.getItem('fotoPerfil');
    if (fotoPerfil) {
        document.getElementById('foto-perfil').src = fotoPerfil;
    }

    // Evento para subir foto de perfil
    document.getElementById('input-foto-perfil').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fotoDataURL = event.target.result;
                localStorage.setItem('fotoPerfil', fotoDataURL);
                document.getElementById('foto-perfil').src = fotoDataURL;
                alert('Foto de perfil actualizada');
            };
            reader.readAsDataURL(file);
        }
    });

    // Configurar navegación
    function mostrarSeccion(seccionId) {
        const secciones = document.querySelectorAll('main > section');
        if (secciones.length === 0) return;
        secciones.forEach(seccion => {
            seccion.classList.toggle('active', seccion.id === seccionId);
        });
    }

    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const seccionId = e.target.getAttribute('href').substring(1);
                mostrarSeccion(seccionId);
                if (seccionId === 'perfil') renderPerfil();
                if (seccionId === 'tareas') renderTareasProfesor();
                if (seccionId === 'tareas-profesor') renderRespuestasTareas();
                if (seccionId === 'notas') renderEstudiantes();
                if (seccionId === 'matriculas') renderMatriculas();
            });
        });
    }

    // Mostrar sección inicial
    mostrarSeccion('tareas-profesor');

    // Renderizar perfil del profesor
    function renderPerfil() {
        const perfilInfo = document.getElementById('perfil-info');
        if (!perfilInfo) return;
        perfilInfo.innerHTML = `
            <p><strong>Nombre:</strong> ${usuarioActual.nombre}</p>
            <p><strong>Email:</strong> ${usuarioActual.email}</p>
            <p><strong>Rol:</strong> ${usuarioActual.rol}</p>
            <button class="btn btn-warning mt-3" onclick="window.editarPerfil()">Editar Perfil</button>
        `;
    }

    window.editarPerfil = function() {
        const nuevoNombre = prompt('Nuevo nombre:', usuarioActual.nombre);
        const nuevoApellido = prompt('Nuevo apellido:', usuarioActual.apellido || '');
        const nuevaPassword = prompt('Nueva contraseña (dejar vacío para mantener):', '');

        if (nuevoNombre) {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioActual.email);
            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex].nombre = nuevoNombre;
                if (nuevoApellido) usuarios[usuarioIndex].apellido = nuevoApellido;
                if (nuevaPassword) usuarios[usuarioIndex].password = nuevaPassword;
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                localStorage.setItem('usuarioActual', JSON.stringify(usuarios[usuarioIndex]));
                usuarioActual.nombre = nuevoNombre;
                if (nuevoApellido) usuarioActual.apellido = nuevoApellido;
                if (nuevaPassword) usuarioActual.password = nuevaPassword;
                renderPerfil();
                alert('Perfil actualizado correctamente');
            }
        } else {
            alert('El nombre es obligatorio');
        }
    };

    // Gestión de tareas
    const formTarea = document.getElementById('form-tarea-profesor');
    if (formTarea) {
        formTarea.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('input-tarea')?.value.trim();
            const tipo = document.getElementById('tipo-tarea')?.value;
            const fecha = document.getElementById('fecha-entrega')?.value;
            const archivoInput = document.getElementById('archivo-tarea');
            const archivo = archivoInput ? archivoInput.files[0] : null;

            const nuevaTarea = {
                id: Date.now().toString(),
                nombre,
                tipo,
                fecha,
                completada: false,
                archivo: null,
                respuestas: [],
                materia: prompt('Ingrese la materia asociada a esta tarea:', '') // Asociar tarea a una materia
            };

            if (nombre && tipo && fecha && nuevaTarea.materia) {
                if (archivo) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        nuevaTarea.archivo = event.target.result;
                        guardarTarea(nuevaTarea);
                    };
                    reader.onerror = () => alert('Error al cargar el archivo');
                    reader.readAsDataURL(archivo);
                } else {
                    guardarTarea(nuevaTarea);
                }
            } else {
                alert('Complete todos los campos obligatorios, incluida la materia.');
            }
        });
    }

    function guardarTarea(tarea) {
        let tareas = appData.loadFromStorage('tareas') || [];
        tareas.push(tarea);
        appData.saveToStorage('tareas', tareas);
        appData.tareas = tareas;
        renderTareasProfesor();
        formTarea.reset();
        alert('Tarea subida y disponible para estudiantes');
    }

    function renderTareasProfesor() {
        const listaTareas = document.getElementById('lista-tareas');
        if (!listaTareas) return;
        appData.tareas = appData.loadFromStorage('tareas') || [];
        listaTareas.innerHTML = `
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Materia</th>
                        <th>Archivo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.tareas.map((tarea, index) => `
                        <tr>
                            <td>${tarea.id}</td>
                            <td>${tarea.nombre}</td>
                            <td>${tarea.tipo}</td>
                            <td>${tarea.fecha}</td>
                            <td>${tarea.materia}</td>
                            <td>${tarea.archivo ? `<a href="${tarea.archivo}" download="${tarea.nombre}">Descargar</a>` : 'Sin archivo'}</td>
                            <td><button class="btn btn-danger btn-sm" onclick="window.eliminarTarea(${index})">Eliminar</button></td>
                        </tr>
                    `).join('') || '<tr><td colspan="7">No hay tareas registradas.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    window.eliminarTarea = (index) => {
        let tareas = appData.loadFromStorage('tareas') || [];
        if (index >= 0 && index < tareas.length) {
            tareas.splice(index, 1);
            appData.saveToStorage('tareas', tareas);
            appData.tareas = tareas;
            renderTareasProfesor();
            alert('Tarea eliminada');
        } else {
            alert('Error: Tarea no encontrada');
        }
    };

    // Renderizar respuestas de tareas
    function renderRespuestasTareas() {
        const respuestasTareas = document.getElementById('respuestas-tareas');
        if (!respuestasTareas) return;

        appData.tareas = appData.loadFromStorage('tareas') || [];
        respuestasTareas.innerHTML = `
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>Tarea ID</th>
                        <th>Estudiante</th>
                        <th>Respuesta</th>
                        <th>Archivo</th>
                        <th>Calificación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.tareas.flatMap(tarea => tarea.respuestas.map((resp, respIndex) => `
                        <tr>
                            <td>${tarea.id}</td>
                            <td>${resp.estudiante}</td>
                            <td>${resp.respuesta}</td>
                            <td>${resp.archivo ? `<a href="${resp.archivo}" download="Respuesta_${resp.estudiante}">Descargar</a>` : 'Sin archivo'}</td>
                            <td>${resp.calificacion !== undefined ? resp.calificacion : 'Pendiente'}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="window.calificarTarea('${tarea.id}', ${respIndex})">Calificar</button>
                            </td>
                        </tr>
                    `)).join('') || '<tr><td colspan="6">No hay respuestas aún.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    window.calificarTarea = function(tareaId, respIndex) {
        let tareas = appData.loadFromStorage('tareas') || [];
        const tarea = tareas.find(t => t.id === tareaId);
        if (!tarea || respIndex < 0 || respIndex >= tarea.respuestas.length) return;

        const calificacion = prompt('Ingrese la calificación (0-100):', tarea.respuestas[respIndex].calificacion || '');
        if (calificacion !== null && !isNaN(calificacion) && calificacion >= 0 && calificacion <= 100) {
            tarea.respuestas[respIndex].calificacion = parseFloat(calificacion);
            appData.saveToStorage('tareas', tareas);
            appData.tareas = tareas;

            // Actualizar notas del estudiante
            let estudiantes = appData.loadFromStorage('estudiantes') || [];
            const estudiante = estudiantes.find(e => e.email === tarea.respuestas[respIndex].estudiante);
            if (estudiante) {
                if (!estudiante.notas) estudiante.notas = [];
                estudiante.notas.push({
                    materia: tarea.materia || tarea.nombre,
                    calificacion: parseFloat(calificacion),
                    tipo: tarea.tipo,
                    fecha: new Date().toISOString().split('T')[0]
                });
                appData.saveToStorage('estudiantes', estudiantes);
                appData.estudiantes = estudiantes;
            }

            renderRespuestasTareas();
            renderEstudiantes();
            alert('Calificación guardada');
        } else {
            alert('Calificación inválida. Use un número entre 0 y 100.');
        }
    };

    // Gestión de estudiantes
    const formEstudiante = document.getElementById('form-estudiante');
    if (formEstudiante) {
        formEstudiante.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre')?.value.trim();
            const apellido = document.getElementById('apellido')?.value.trim();
            const email = document.getElementById('email')?.value.trim();

            if (nombre && apellido && email) {
                let estudiantes = appData.loadFromStorage('estudiantes') || [];
                if (estudiantes.some(e => e.email === email)) {
                    alert('El email ya está registrado.');
                    return;
                }
                const nuevoEstudiante = { nombre, apellido, email, notas: [] };
                estudiantes.push(nuevoEstudiante);
                appData.saveToStorage('estudiantes', estudiantes);
                appData.estudiantes = estudiantes;
                renderEstudiantes();
                formEstudiante.reset();
                alert('Estudiante agregado');
            } else {
                alert('Complete todos los campos obligatorios.');
            }
        });
    }

    function renderEstudiantes() {
        const tablaEstudiantes = document.getElementById('tabla-estudiantes');
        if (!tablaEstudiantes) return;

        appData.estudiantes = appData.loadFromStorage('estudiantes') || [];
        tablaEstudiantes.innerHTML = `
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Notas</th>
                        <th>Promedio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.estudiantes.map((est, index) => `
                        <tr>
                            <td>${est.nombre}</td>
                            <td>${est.apellido || '-'}</td>
                            <td>${est.email}</td>
                            <td>${est.notas && est.notas.length > 0 ? est.notas.map(n => `${n.materia}: ${n.calificacion} (${n.tipo}, ${n.fecha})`).join(', ') : 'Sin notas'}</td>
                            <td>${appData.calcularPromedio(est)}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="window.subirNota(${index})">Subir Nota</button>
                                <button class="btn btn-warning btn-sm" onclick="window.editarEstudiante(${index})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="window.eliminarEstudiante(${index})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">No hay estudiantes registrados.</td></tr>'}
                </tbody>
            </table>
            <button class="btn btn-success mt-3" onclick="window.exportarEstudiantes()">Exportar a CSV</button>
            <div class="mt-3">
                <input type="text" id="buscar-estudiante" class="form-control" placeholder="Buscar estudiante por nombre o email" oninput="window.buscarEstudiantes()">
            </div>
        `;
    }

    window.subirNota = function(index) {
        let estudiantes = appData.loadFromStorage('estudiantes') || [];
        const estudiante = estudiantes[index];
        if (!estudiante) return;

        const materia = prompt('Ingrese la materia:');
        const tipo = prompt('Tipo de nota (acumulativo/examen):');
        const calificacion = prompt('Ingrese la calificación (0-100):');
        const fecha = prompt('Ingrese la fecha (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);

        if (materia && tipo && calificacion && !isNaN(calificacion) && calificacion >= 0 && calificacion <= 100 && fecha) {
            if (!estudiante.notas) estudiante.notas = [];
            estudiante.notas.push({ materia, calificacion: parseFloat(calificacion), tipo, fecha });
            appData.saveToStorage('estudiantes', estudiantes);
            appData.estudiantes = estudiantes;
            renderEstudiantes();
            alert('Nota subida');
        } else {
            alert('Datos inválidos. Asegúrese de ingresar todos los campos correctamente.');
        }
    };

    window.editarEstudiante = function(index) {
        let estudiantes = appData.loadFromStorage('estudiantes') || [];
        const est = estudiantes[index];
        if (!est) return;

        const nombre = prompt('Editar nombre:', est.nombre);
        const apellido = prompt('Editar apellido:', est.apellido || '');
        const email = prompt('Editar email:', est.email);

        if (nombre && email) {
            if (email !== est.email && estudiantes.some(e => e.email === email && e !== est)) {
                alert('El email ya está registrado.');
                return;
            }
            estudiantes[index] = { ...est, nombre, apellido: apellido || est.apellido, email };
            appData.saveToStorage('estudiantes', estudiantes);
            appData.estudiantes = estudiantes;
            renderEstudiantes();
            alert('Estudiante actualizado');
        } else {
            alert('Nombre y email son obligatorios.');
        }
    };

    window.eliminarEstudiante = function(index) {
        let estudiantes = appData.loadFromStorage('estudiantes') || [];
        if (index >= 0 && index < estudiantes.length) {
            if (confirm('¿Seguro que desea eliminar este estudiante?')) {
                estudiantes.splice(index, 1);
                appData.saveToStorage('estudiantes', estudiantes);
                appData.estudiantes = estudiantes;
                renderEstudiantes();
                alert('Estudiante eliminado');
            }
        } else {
            alert('Error: Estudiante no encontrado');
        }
    };

    window.exportarEstudiantes = function() {
        let estudiantes = appData.loadFromStorage('estudiantes') || [];
        let csv = 'Nombre,Apellido,Email,Notas,Promedio\n';
        estudiantes.forEach(est => {
            const notasStr = est.notas && est.notas.length > 0 ? est.notas.map(n => `${n.materia}:${n.calificacion}`).join('; ') : 'Sin notas';
            csv += `${est.nombre},${est.apellido || '-'},${est.email},"${notasStr}",${appData.calcularPromedio(est)}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'estudiantes.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Estudiantes exportados a CSV');
    };

    window.buscarEstudiantes = function() {
        const busquedaInput = document.getElementById('buscar-estudiante');
        if (!busquedaInput) return;

        const busqueda = busquedaInput.value.toLowerCase();
        let estudiantes = appData.loadFromStorage('estudiantes') || [];
        const filtrados = estudiantes.filter(est => 
            est.nombre.toLowerCase().includes(busqueda) || 
            est.email.toLowerCase().includes(busqueda)
        );

        const tablaEstudiantes = document.getElementById('tabla-estudiantes');
        if (tablaEstudiantes) {
            tablaEstudiantes.innerHTML = `
                <table class="table table-striped table-hover table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Notas</th>
                            <th>Promedio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtrados.map((est, index) => `
                            <tr>
                                <td>${est.nombre}</td>
                                <td>${est.apellido || '-'}</td>
                                <td>${est.email}</td>
                                <td>${est.notas && est.notas.length > 0 ? est.notas.map(n => `${n.materia}: ${n.calificacion}`).join(', ') : 'Sin notas'}</td>
                                <td>${appData.calcularPromedio(est)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="window.subirNota(${estudiantes.indexOf(est)})">Subir Nota</button>
                                    <button class="btn btn-warning btn-sm" onclick="window.editarEstudiante(${estudiantes.indexOf(est)})">Editar</button>
                                    <button class="btn btn-danger btn-sm" onclick="window.eliminarEstudiante(${estudiantes.indexOf(est)})">Eliminar</button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="6">No hay estudiantes que coincidan.</td></tr>'}
                    </tbody>
                </table>
            `;
        }
    };

    // Gestión de matrículas
    function renderMatriculas() {
        const listaMatriculas = document.getElementById('lista-matriculas');
        if (!listaMatriculas) return;

        appData.matriculas = appData.loadFromStorage('matriculas') || [];
        listaMatriculas.innerHTML = `
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>Estudiante</th>
                        <th>Materia</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.matriculas.map(mat => `
                        <tr>
                            <td>${mat.estudiante}</td>
                            <td>${mat.materia}</td>
                            <td>${new Date(mat.fecha).toLocaleDateString()}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="3">No hay matrículas.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    // Inicializar vistas
    renderPerfil();
    renderTareasProfesor();
    renderRespuestasTareas();
    renderEstudiantes();
    renderMatriculas();
});

// Definición del objeto appData
const appData = {
    tareas: [],
    estudiantes: [],
    matriculas: [],
    loadFromStorage: (key) => JSON.parse(localStorage.getItem(key)),
    saveToStorage: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    },
    getUsuarioActual: () => JSON.parse(localStorage.getItem('usuarioActual')),
    calcularPromedio: (estudiante) => {
        const notas = estudiante?.notas || [];
        if (notas.length === 0) return 'N/A';
        const total = notas.reduce((sum, nota) => sum + parseFloat(nota.calificacion), 0);
        return (total / notas.length).toFixed(2);
    }
};