// script.js

// Datos persistentes en localStorage con estructuras mejoradas
const materiasDisponibles = [
    "Matemáticas", "Física", "Química", "Biología", "Historia", "Lenguaje", 
    "Inglés", "Geografía", "Educación Física", "Arte", "Informática", "Economía"
];

// Inicialización de datos con valores por defecto si no existen
let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
let foros = JSON.parse(localStorage.getItem('foros')) || [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let matriculas = JSON.parse(localStorage.getItem('matriculas')) || [];

// Configuración inicial de usuarios si no hay datos
function inicializarDatos() {
    if (!localStorage.getItem('usuarios')) {
        const usuariosIniciales = [
            { nombre: 'Profesor', apellido: 'Ejemplo', email: 'profesor@eduapp.local', rol: 'profesor', password: 'profesor123' },
            { nombre: 'Estudiante', apellido: 'Prueba', email: 'estudiante@eduapp.local', rol: 'estudiante', password: 'estudiante123' }
        ];
        saveToStorage('usuarios', usuariosIniciales);
        console.log('Usuarios iniciales creados:', usuariosIniciales);
    }
    // Asegurar que todas las estructuras estén inicializadas
    saveToStorage('estudiantes', estudiantes);
    saveToStorage('tareas', tareas);
    saveToStorage('eventos', eventos);
    saveToStorage('foros', foros);
    saveToStorage('historial', historial);
    saveToStorage('matriculas', matriculas);
    console.log('Datos inicializados en localStorage:', {
        estudiantes: loadFromStorage('estudiantes'),
        tareas: loadFromStorage('tareas'),
        eventos: loadFromStorage('eventos'),
        foros: loadFromStorage('foros'),
        historial: loadFromStorage('historial'),
        matriculas: loadFromStorage('matriculas')
    });
}

// Funciones comunes y mejoradas

// Guardar datos en localStorage con manejo de errores
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Datos guardados en localStorage bajo la clave '${key}':`, data);
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error);
        return false;
    }
}

// Cargar datos desde localStorage con validación
function loadFromStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`Datos cargados desde localStorage bajo la clave '${key}':`, data);
        return data || [];
    } catch (error) {
        console.error(`Error al cargar ${key} desde localStorage:`, error);
        return [];
    }
}

// Obtener usuario actual con validación
function getUsuarioActual() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario && window.location.pathname !== '/index.html') {
        console.warn('No hay usuario actualmente logueado. Redirigiendo a index.html...');
        window.location.href = 'index.html';
    }
    return usuario;
}

// Iniciar sesión
function loginUsuario(email, password) {
    const usuarios = loadFromStorage('usuarios');
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        saveToStorage('usuarioActual', usuario);
        console.log(`Usuario ${email} logueado como ${usuario.rol}`);
        return usuario;
    } else {
        console.warn('Credenciales inválidas para:', email);
        return null;
    }
}

// Registrar usuario
function registrarUsuario(usuario) {
    const usuarios = loadFromStorage('usuarios');
    if (usuarios.some(u => u.email === usuario.email)) {
        console.warn('Email ya registrado:', usuario.email);
        return false;
    }
    usuarios.push(usuario);
    saveToStorage('usuarios', usuarios);
    console.log('Usuario registrado:', usuario);
    return true;
}

// Calcular promedio con validación mejorada
function calcularPromedio(estudiante) {
    if (!estudiante || !estudiante.notas || estudiante.notas.length === 0) return 'N/A';
    const acumulativoNotas = estudiante.notas.filter(nota => nota.tipo === 'acumulativo');
    const examenNota = estudiante.notas.find(nota => nota.tipo === 'examen');
    const acumulativoTotal = acumulativoNotas.reduce((acc, nota) => acc + (parseFloat(nota.calificacion) || 0), 0);
    const acumulativoPromedio = acumulativoNotas.length > 0 ? Math.min((acumulativoTotal / acumulativoNotas.length) * 0.6, 60) : 0;
    const examenPeso = examenNota ? Math.min((parseFloat(examenNota.calificacion) || 0) * 0.4, 40) : 0;
    const promedio = acumulativoPromedio + examenPeso;
    return isNaN(promedio) ? 'N/A' : promedio.toFixed(2);
}

// Generar correo institucional único
function generarCorreoInstitucional(nombre, apellido) {
    const dominio = '@eduapp.local';
    let baseEmail = `${nombre.toLowerCase()}.${apellido.toLowerCase().replace(/\s/g, '')}`;
    let email = `${baseEmail}${dominio}`;
    let contador = 1;
    
    const usuarios = loadFromStorage('usuarios');
    while (usuarios.some(u => u.email === email)) {
        email = `${baseEmail}${contador}${dominio}`;
        contador++;
    }
    return email;
}

// Obtener estudiante por email
function getEstudiantePorEmail(email) {
    const estudiantesData = loadFromStorage('estudiantes');
    return estudiantesData.find(e => e.email === email) || null;
}

// Actualizar historial con información del usuario
function registrarHistorial(accion, detalle) {
    const usuarioActual = getUsuarioActual();
    const entry = {
        accion,
        detalle,
        usuario: usuarioActual ? usuarioActual.nombre : 'Sistema',
        fecha: new Date().toLocaleString()
    };
    historial = loadFromStorage('historial'); // Cargar historial actualizado
    historial.push(entry);
    saveToStorage('historial', historial);
    console.log('Historial actualizado:', entry);
}

// Generar ID único para tareas, foros, etc.
function generarId() {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    console.log('ID generado:', id);
    return id;
}

// Validar datos antes de guardarlos
function validarDatos(datos, camposRequeridos) {
    const esValido = camposRequeridos.every(campo => datos[campo] && datos[campo].toString().trim().length > 0);
    console.log('Validación de datos:', { datos, camposRequeridos, esValido });
    return esValido;
}

// Exportar funciones y datos para otros módulos
window.appData = {
    materiasDisponibles,
    get estudiantes() { return loadFromStorage('estudiantes'); },
    set estudiantes(value) { estudiantes = value; saveToStorage('estudiantes', value); },
    get tareas() { return loadFromStorage('tareas'); },
    set tareas(value) { tareas = value; saveToStorage('tareas', value); },
    get eventos() { return loadFromStorage('eventos'); },
    set eventos(value) { eventos = value; saveToStorage('eventos', value); },
    get foros() { return loadFromStorage('foros'); },
    set foros(value) { foros = value; saveToStorage('foros', value); },
    get historial() { return loadFromStorage('historial'); },
    set historial(value) { historial = value; saveToStorage('historial', value); },
    get matriculas() { return loadFromStorage('matriculas'); },
    set matriculas(value) { matriculas = value; saveToStorage('matriculas', value); },
    saveToStorage,
    loadFromStorage,
    getUsuarioActual,
    loginUsuario,
    registrarUsuario,
    calcularPromedio,
    generarCorreoInstitucional,
    getEstudiantePorEmail,
    registrarHistorial,
    generarId,
    validarDatos,
    inicializarDatos
};

// Inicializar datos al cargar
window.appData.inicializarDatos();
console.log('Datos inicializados y disponibles en appData:', { 
    estudiantes: appData.estudiantes, 
    tareas: appData.tareas, 
    eventos: appData.eventos, 
    foros: appData.foros, 
    historial: appData.historial, 
    matriculas: appData.matriculas,
    usuarioActual: appData.getUsuarioActual()
});