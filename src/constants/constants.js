// const { UPDATE } = require("sequelize/lib/query-types");

const { UPDATE } = require("sequelize/lib/query-types");

// statusCodes.js
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403, // No permitido
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

const FIELDS = {
    TEXT: 'text',
    TEXTBOX: 'textbox',
    ID: 'id',
    EMAIL: 'email',
    NUMERIC: 'numeric',
    EXPEDIENTE: 'expediente',
    PHONE_NUMBER: 'phone_number',
    CARNET: 'carnet',
    PASSWORD: 'password'
};


const TABLE_NAME = {
    PERSONAS: 'personas',
    CLIENTES: 'clientes',
    ESTUDIANTES: 'estudiantes',
    PROFESORES: 'profesores',
    USUARIOS: 'usuarios',
    CONTRAPARTES: 'contrapartes',
    DIRECCIONES: 'direcciones',
    ASIGNACION_DE_CASOS: 'asignaciondecasos',
    CASOS: 'casos',
    INFORMES: 'informes',
    AVANCES: 'avances',
    SUBSIDIARIOS: 'subsidiarios',
    SOLICITUD_CONFIRMACION: 'solicitud_confirmacion',

};
const TABLE_FIELDS = {
    UID_SUBSIDIARIO: 'id_subsidiario',
    UID_ASIGNACION: 'id_asignacion',
    UID_CASO: 'id_caso',
    UID_ESTUDIANTE: 'id_estudiante',
    UID_CLIENTE: 'id_cliente',
    UID_CONTRAPARTE: 'id_contraparte',
    UID_PERSONA: 'id_persona',
    UID_USUARIO: 'id_usuario',
    UID_ROL: 'id_rol',
    UID_TIPO_PROCESO: 'id_tipo_proceso',
    UID_ESTADO: 'id_estado',
    UID_DIRECCION: 'id_direccion',
    UID_AVANCE: 'id_avance',
    UID_INFORME: 'id_informe',
    UID_PROFESOR: 'id_profesor',
    FECHA_ASIGNACION: 'fecha_asignacion',
    FECHA_AVANCE: 'fecha_avance',
    GESTION: 'gestion',
    RESULTADO_CONCRETO: 'resultado_concreto',
    EVIDENCIA: 'evidencia',
    OBSERVACIONES: 'observaciones',
    EXPEDIENTE: 'expediente',
    LEY_7600: 'ley_7600',
    TIPO_PROCESO: 'tipo_proceso',
    CUANTIA_PROCESO: 'cuantia_proceso',
    APORTE_CUMUNIDAD: 'aporte_comunidad',
    SINTESIS_HECHOS: 'sintesis_hechos',
    ETAPA_PROCESO: 'etapa_proceso',
    EVIDENCIA: 'evidencia',
    ESTADO: 'estado',
    SEXO: 'sexo',
    INGRESO_ECONOMICO: 'ingreso_economico',
    FECHA_CREACION: 'fecha_creacion',
    FECHA_REGISTRO: 'fecha_registro',
    DETALLES: 'detalles',
    DIRECCION_EXACTA: 'direccion_exacta',
    CANTON: 'canton',
    DISTRITO: 'distrito',
    PROVINCIA: 'provincia',
    LOCALIDAD: 'localidad',
    CARNET: 'carnet',
    FECHA_INSCRIPCION: 'fecha_inscripcion',
    CONTENIDO_INFORME: 'contenido_informe',
    FECHA_ENTREGA: 'fecha_entrega',
    PRIMER_NOMBRE: 'primer_nombre',
    SEGUNDO_NOMBRE: 'segundo_nombre',
    PRIMER_APELLIDO: 'primer_apellido',
    SEGUNDO_APELLIDO: 'segundo_apellido',
    CEDULA: 'cedula',
    TELEFONO: 'telefono',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    ESPECIALIDAD: 'especialidad',
    EMAIL: 'email',
    PASSWORD_HASH: 'password_hash',
    ROL: 'rol',
    USERNAME: 'username',
    CREATE_AT: 'createAt',

}

const TIME = {
    SECOND: 1000,                     // 1 segundo en milisegundos
    MINUTE: 60 * 1000,                // 1 minuto en milisegundos
    HOUR: 60 * 60 * 1000,             // 1 hora en milisegundos
    DAY: 24 * 60 * 60 * 1000,         // 1 día en milisegundos
    WEEK: 7 * 24 * 60 * 60 * 1000,    // 1 semana en milisegundos
    MONTH: 30 * 24 * 60 * 60 * 1000,  // Aproximadamente 1 mes en milisegundos
    YEAR: 365 * 24 * 60 * 60 * 1000   // 1 año en milisegundos
};


const ROL = {
    SUPERADMIN: 'administrador',
    PROFESSOR: 'profesor',
    STUDENT: 'estudiante',
};

const ORDER = {
    ASC: 'ASC',
    DESC: 'DESC'
};

const STATES = {
    PENDING: 'pendiente',
    ACCEPTED: 'aceptado',
    DENIED: 'denegado',
    ASSIGNED: 'asignado',
}

const ACTION = {
    DELETE: 'eliminar',
    UPDATE: 'actualizar',
}

const DECISION = {
    ACCEPTED: 'aceptado',
    DENIED: 'denegado',
}

const KEYS = { 
    USER_DATA: 'userData',
    CONNECT_SID: "connect.sid",
    LANGUAGE: 'language',
}

const LANGUAGES = {
    SPANISH: 'es',
    ENGLISH: 'en'
}

const ENV = { 
    QA: 'QA',
    PROD: "PROD",
    DEV: 'DEV'
}

const ROUTES = {
    SHOW: '/mostrar',
    DELETE: '/eliminar'
}

module.exports = {
    ACTION,
    DECISION,
    ENV,
    FIELDS,
    HttpStatus,
    KEYS,
    LANGUAGES,
    ORDER,
    ROL,
    ROUTES,
    STATES,
    TABLE_FIELDS,
    TABLE_NAME,
    TIME
}

