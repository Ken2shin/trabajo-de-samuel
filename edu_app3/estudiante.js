document.addEventListener('DOMContentLoaded', () => {
    inicializarDatos();

    const usuarioActual = appData.getUsuarioActual();
    if (!usuarioActual || usuarioActual.rol !== 'estudiante') {
        alert('Acceso denegado. Solo para estudiantes.');
        window.location.href = 'index.html';
        return;
    }

    window.utils.actualizarInterfazUsuario();

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const seccionId = e.target.getAttribute('href').substring(1);
            mostrarSeccion(seccionId);
            actualizarVista(seccionId);
        });
    });

    mostrarSeccion('perfil');
    actualizarVista('perfil');

    function inicializarDatos() {
        const defaults = {
            usuarios: [],
            estudiantes: [],
            tareas: [],
            foros: [],
            matriculas: [],
            'materias-disponibles': ['Matemáticas', 'Literatura', 'Historia', 'Ciencias']
        };

        Object.entries(defaults).forEach(([key, value]) => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        });

        const tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas.forEach(tarea => tarea.respuestas = tarea.respuestas || []);
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    function mostrarSeccion(seccionId) {
        document.querySelectorAll('main > section').forEach(seccion => {
            seccion.classList.toggle('active', seccion.id === seccionId);
        });
    }

    function actualizarVista(seccionId) {
        const vistas = {
            perfil: renderPerfil,
            notas: renderNotas,
            tareas: renderTareasEstudiante,
            foros: renderForosEstudiante,
            matriculas: renderMatriculasEstudiante
        };
        if (vistas[seccionId]) vistas[seccionId]();
    }

    function renderPerfil() {
        const perfilInfo = document.getElementById('perfil-info');
        if (!perfilInfo) return;
        const estudiante = appData.estudiantes.find(e => e.email === usuarioActual.email) || usuarioActual;
        
        perfilInfo.innerHTML = `
            <p><strong>Nombre:</strong> ${estudiante.nombre} ${estudiante.apellido}</p>
            <p><strong>Email:</strong> ${estudiante.email}</p>
            <p><strong>Rol:</strong> ${estudiante.rol}</p>
            <p><strong>Materias matriculadas:</strong> ${appData.getMatriculasEstudiante().length}</p>
            <p><strong>Promedio:</strong> ${appData.calcularPromedio(estudiante)}</p>
            <button class="btn btn-warning mt-3" onclick="window.editarPerfil()">Editar Perfil</button>
        `;
    }

    window.editarPerfil = function() {
        const estudiante = appData.estudiantes.find(e => e.email === usuarioActual.email);
        const nuevoNombre = prompt('Nuevo nombre:', estudiante.nombre);
        const nuevoApellido = prompt('Nuevo apellido:', estudiante.apellido);
        const nuevaPassword = prompt('Nueva contraseña (dejar vacío para mantener):', '');

        if (nuevoNombre && nuevoApellido) {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioActual.email);
            
            usuarios[usuarioIndex] = {
                ...usuarios[usuarioIndex],
                nombre: nuevoNombre,
                apellido: nuevoApellido,
                password: nuevaPassword || usuarios[usuarioIndex].password
            };

            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            localStorage.setItem('usuarioActual', JSON.stringify(usuarios[usuarioIndex]));
            appData.actualizarEstudiante(usuarios[usuarioIndex]);
            renderPerfil();
            alert('Perfil actualizado correctamente');
        } else {
            alert('Nombre y apellido son obligatorios');
        }
    };

    function renderNotas() {
        const tablaNotas = document.getElementById('tabla-notas');
        if (!tablaNotas) return;
        const estudiante = appData.estudiantes.find(e => e.email === usuarioActual.email);
        
        tablaNotas.innerHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Calificación</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${(estudiante?.notas || []).map(nota => `
                        <tr>
                            <td>${nota.materia}</td>
                            <td>${nota.calificacion}</td>
                            <td>${nota.tipo}</td>
                            <td>${nota.fecha}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4">Sin notas</td></tr>'}
                </tbody>
            </table>
            <p class="mt-3"><strong>Promedio General:</strong> ${appData.calcularPromedio(estudiante)}</p>
        `;
    }

    function renderTareasEstudiante() {
        const listaTareas = document.getElementById('lista-tareas-estudiante');
        if (!listaTareas) return;
        
        const tareas = appData.tareas.filter(t => 
            t.respuestas.some(r => r.estudiante === usuarioActual.email) || 
            appData.getMatriculasEstudiante().some(m => m.materia === t.materia)
        );

        listaTareas.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                            <th>Archivo del Profesor</th>
                            <th>Mi Respuesta</th>
                            <th>Mi Archivo</th>
                            <th>Calificación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tareas.length > 0 ? tareas.map(tarea => {
                            const respuesta = tarea.respuestas.find(r => r.estudiante === usuarioActual.email);
                            return `
                                <tr>
                                    <td>${tarea.id}</td>
                                    <td>${tarea.nombre}</td>
                                    <td>${tarea.tipo || 'N/A'}</td>
                                    <td>${tarea.fecha || 'N/A'}</td>
                                    <td>${tarea.archivo ? `<a href="${tarea.archivo}" download>Descargar</a>` : 'Sin archivo'}</td>
                                    <td>${respuesta ? respuesta.respuesta : 'No enviada'}</td>
                                    <td>${respuesta && respuesta.archivo ? `<a href="${respuesta.archivo}" download>Descargar</a>` : 'Sin archivo'}</td>
                                    <td>${respuesta && respuesta.calificacion !== undefined ? respuesta.calificacion : 'Pendiente'}</td>
                                    <td>
                                        <form class="form-respuesta-tarea d-flex gap-2" data-tarea-id="${tarea.id}">
                                            <input type="text" class="form-control" placeholder="Escribe tu respuesta" value="${respuesta ? respuesta.respuesta : ''}" required>
                                            <input type="file" class="form-control" id="respuesta-archivo-${tarea.id}" accept=".pdf,.jpg,.png">
                                            <div id="vista-previa-${tarea.id}" class="mt-2"></div>
                                            <button type="submit" class="btn btn-primary btn-sm">${respuesta ? 'Actualizar' : 'Enviar'}</button>
                                        </form>
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="9">No hay tareas disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;

        document.querySelectorAll('.form-respuesta-tarea').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const tareaId = form.getAttribute('data-tarea-id');
                const respuestaTexto = form.querySelector('input[type="text"]').value.trim();
                const archivoInput = form.querySelector(`#respuesta-archivo-${tareaId}`);
                const archivo = archivoInput.files[0];

                if (!respuestaTexto) {
                    alert('La respuesta no puede estar vacía');
                    return;
                }
                if (archivo && archivo.size > 5 * 1024 * 1024) {
                    alert('El archivo no debe exceder los 5MB');
                    return;
                }

                const tarea = appData.tareas.find(t => t.id === tareaId);
                if (!tarea) {
                    alert('Error: Tarea no encontrada');
                    return;
                }

                subirTarea(tarea, respuestaTexto, archivo);
            });
        });

        document.querySelectorAll('.form-respuesta-tarea input[type="file"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const tareaId = e.target.id.split('-').pop();
                const vistaPrevia = document.getElementById(`vista-previa-${tareaId}`);
                vistaPrevia.innerHTML = '';

                const archivo = e.target.files[0];
                if (archivo) {
                    if (archivo.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(archivo);
                        img.style.maxWidth = '100px';
                        vistaPrevia.appendChild(img);
                    } else {
                        vistaPrevia.textContent = `Archivo seleccionado: ${archivo.name}`;
                    }
                }
            });
        });
    }

    function subirTarea(tarea, respuestaTexto, archivo) {
        const nuevaRespuesta = {
            estudiante: usuarioActual.email,
            respuesta: respuestaTexto,
            archivo: null,
            fechaEnvio: new Date().toISOString(),
            calificacion: null
        };

        if (archivo) {
            const reader = new FileReader();
            reader.onload = (event) => {
                nuevaRespuesta.archivo = event.target.result;
                guardarRespuesta(tarea, nuevaRespuesta);
            };
            reader.onerror = () => {
                alert('Error al cargar el archivo');
            };
            reader.readAsDataURL(archivo);
        } else {
            guardarRespuesta(tarea, nuevaRespuesta);
        }
    }

    function guardarRespuesta(tarea, respuesta) {
        const tareaIndex = appData.tareas.findIndex(t => t.id === tarea.id);
        if (tareaIndex === -1) {
            alert('Error: Tarea no encontrada en appData.tareas');
            return;
        }

        const existing = appData.tareas[tareaIndex].respuestas.find(r => r.estudiante === respuesta.estudiante);
        if (existing) {
            existing.respuesta = respuesta.respuesta;
            existing.archivo = respuesta.archivo;
            existing.fechaEnvio = respuesta.fechaEnvio;
        } else {
            appData.tareas[tareaIndex].respuestas.push(respuesta);
        }

        appData.saveToStorage('tareas', appData.tareas);
        renderTareasEstudiante();
        alert(`Respuesta ${existing ? 'actualizada' : 'enviada'} correctamente`);
    }

    function renderForosEstudiante() {
        const listaForos = document.getElementById('lista-foros-estudiante');
        if (!listaForos) return;
        
        listaForos.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Tema</th>
                            <th>Mensaje</th>
                            <th>Autor</th>
                            <th>Respuestas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appData.foros.map(foro => `
                            <tr>
                                <td>${foro.tema}</td>
                                <td>${foro.descripcion}</td>
                                <td>${foro.autor}</td>
                                <td>${foro.respuestas.map(r => `<div>${r.mensaje} - ${r.autor}</div>`).join('') || 'Sin respuestas'}</td>
                                <td>
                                    <form class="form-respuesta-foro" data-foro-id="${foro.id}">
                                        <input type="text" class="form-control" placeholder="Responder" required>
                                        <button type="submit" class="btn btn-primary btn-sm mt-2">Responder</button>
                                    </form>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="5">No hay foros disponibles</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderMatriculasEstudiante() {
        const listaMatriculas = document.getElementById('lista-matriculas-estudiante');
        if (!listaMatriculas) return;
        
        const matriculas = appData.getMatriculasEstudiante();
        const materiasDisponibles = appData.getMateriasDisponibles().filter(
            m => !matriculas.some(mat => mat.materia === m)
        );

        listaMatriculas.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h4>Mis Matrículas</h4>
                    <ul class="list-group mb-4">
                        ${matriculas.map(m => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${m.materia} (Matriculado el: ${new Date(m.fecha).toLocaleDateString()})
                                <button class="btn btn-sm btn-danger" onclick="desmatricular('${m.materia}')">✖</button>
                            </li>
                        `).join('') || '<li class="list-group-item">Sin matrículas</li>'}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h4>Materias Disponibles</h4>
                    <ul class="list-group">
                        ${materiasDisponibles.map(m => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${m}
                                <button class="btn btn-sm btn-success" onclick="window.matricularClase('${m}')">Matricularse</button>
                            </li>
                        `).join('') || '<li class="list-group-item">No hay materias disponibles</li>'}
                    </ul>
                </div>
            </div>
        `;
    }

    window.matricularClase = function(materia) {
        const matriculas = JSON.parse(localStorage.getItem('matriculas')) || [];
        if (!matriculas.some(m => m.estudiante === usuarioActual.email && m.materia === materia)) {
            matriculas.push({
                estudiante: usuarioActual.email,
                materia,
                fecha: new Date().toISOString()
            });
            localStorage.setItem('matriculas', JSON.stringify(matriculas));
            appData.matriculas = matriculas;
            renderMatriculasEstudiante();
            alert(`Matriculado en ${materia} correctamente`);
        } else {
            alert('Ya estás matriculado en esta materia');
        }
    };

    window.desmatricular = function(materia) {
        const matriculas = JSON.parse(localStorage.getItem('matriculas')) || [];
        const nuevasMatriculas = matriculas.filter(
            m => !(m.estudiante === usuarioActual.email && m.materia === materia)
        );
        localStorage.setItem('matriculas', JSON.stringify(nuevasMatriculas));
        appData.matriculas = nuevasMatriculas;
        renderMatriculasEstudiante();
        alert(`Desmatriculado de ${materia} correctamente`);
    };

    window.appData = {
        estudiantes: JSON.parse(localStorage.getItem('estudiantes')) || [],
        tareas: JSON.parse(localStorage.getItem('tareas')) || [],
        matriculas: JSON.parse(localStorage.getItem('matriculas')) || [],
        foros: JSON.parse(localStorage.getItem('foros')) || [],

        getUsuarioActual: () => JSON.parse(localStorage.getItem('usuarioActual')),
        
        getMatriculasEstudiante: () => {
            return (JSON.parse(localStorage.getItem('matriculas')) || []).filter(
                m => m.estudiante === usuarioActual.email
            );
        },

        getMateriasDisponibles: () => {
            return JSON.parse(localStorage.getItem('materias-disponibles')) || [];
        },

        actualizarEstudiante: (nuevosDatos) => {
            const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
            const index = estudiantes.findIndex(e => e.email === nuevosDatos.email);
            if (index !== -1) {
                estudiantes[index] = nuevosDatos;
            } else {
                estudiantes.push(nuevosDatos);
            }
            localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
            appData.estudiantes = estudiantes;
        },

        calcularPromedio: (estudiante) => {
            const notas = estudiante?.notas || [];
            if (notas.length === 0) return 'N/A';
            const total = notas.reduce((sum, nota) => sum + parseFloat(nota.calificacion), 0);
            return (total / notas.length).toFixed(2);
        },

        saveToStorage: (key, data) => {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };
});