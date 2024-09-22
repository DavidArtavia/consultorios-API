// const { UPDATE } = require("sequelize/lib/query-types");

// statusCodes.js
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403, // No permitido
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

const TABLE_FIELDS = {
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
    UID_AVANCE: 'id_avance',
    UID_DIRECCION: 'id_direccion',
    UID_AVANCE: 'id_avance',
    UID_INFORME: 'id_informe',
    UID_PROFESOR: 'id_profesor',
    UID_USUARIO: 'id_usuario',
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

}

const ROL = {
    SUPERADMIN:'administrador',          
    PROFESSOR: 'profesor',            
    STUDENT: 'estudiante',           
};


module.exports = {
    HttpStatus,
    TABLE_FIELDS,
    ROL
}

