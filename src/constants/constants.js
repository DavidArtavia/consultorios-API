// const { UPDATE } = require("sequelize/lib/query-types");

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
    NAME: 'name',
    ID: 'id',
    EMAIL: 'email',
    NUMERIC: 'numeric',
    EXPEDIENTE: 'expediente',
    PHONE_NUMBER: 'phone_number',
    CARNET: 'carnet'
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
const MESSAGE_ERROR = {
    INVALID_EMAIL: 'Email does not exist',
    INVALID_PASSWORD: 'Invalid password',
    EMAIL_IS_REQUIRED: 'Email is required',
    PASSWORD_IS_REQUIRED: 'Password is required',
    USER_NOT_FOUND: 'User not found',
    FATAL_ERROR_LOGIN: 'Fatal error during login',
    FATAL_ERROR_LOGOUT: 'Fatal error during logout',
    NO_ACTIVATE: 'No active session',
    DESTROY_SESSION: 'Error destroying session',
    WHIOUT_PERMISSION: 'You do not have the necessary permissions to create a user with the same role as yours',
    EMAIL_ALREADY_USED: 'Email is already used',
    USERNAME_ALREADY_USED: 'Username is already used',
    ID_ALREADY_USED: 'Cedula is already used',
    CARNE_ALREADY_USED: 'Carnet is already used',
    CREATE_STUDENT: 'Error creating student record ',
    CREATE_PROFESSOR: 'Error creating professor record',
    CREATE_USER: 'Error creating user',
    STUDENT_NOT_FOUND: 'Student not found',
    NOT_STUDENTS_FOUND: 'No students found',
    NOT_PROFESORS_FOUND: 'No profesors found',
    UPDATE_STUDENT: 'Error updating student',
    DELETE_STUDENT: 'Error deleting student',
    CREATING_CASE: 'Error creating case',
    CASE_NOT_FOUND: 'Case not found',
    CASE_ALREADY_ASSIGNED: 'The case is already assigned to another student',
    ASSIGN_CASE: 'Error assigning case to student',
    RECOVERED_STUDENTS: 'Error retrieving list of students',
    RECOVERED_PROFESORS: 'Error retrieving list of profesors',
    DELETE_STUDENT: 'Error deleting student',
    MUST_LOGIN: 'You must login to access this resource',
    RETRIEVING: 'Error retrieving the information',
    NOT_PERSONS_FOUND: 'No persons found',
    UNASSIGNED_CASES: 'Error retrieving unassigned cases',


}


const MESSAGE_SUCCESS = {
    LOGIN: 'Succesfully login',
    LOGOUT: 'Logout success',
    USER_REGISTERED: 'User registered successfully',
    STUDENT_INFO: 'Student information',
    STUDENT_UPDATED: 'Student updated successfully',
    CASE_CREATED: 'Case created successfully',
    CASE_ASSIGNED: 'Case assigned to student successfully',
    RECOVERED_STUDENTS: 'List of students retrieved successfully',
    RECOVERED_PROFESORS: 'List of profesors retrieved successfully',
    STUDENT_DELETED: 'Student deleted successfully',
    PERSONS_FOUND: 'Persons found',
    UNASSIGNED_CASES: 'Unassigned cases found',
    NO_UNASSIGNED_CASES: 'No unassigned cases found',

}


const ROL = {
    SUPERADMIN: 'administrador',
    PROFESSOR: 'profesor',
    STUDENT: 'estudiante',
};


module.exports = {
    HttpStatus,
    TABLE_FIELDS,
    TABLE_NAME,
    ROL,
    MESSAGE_ERROR,
    MESSAGE_SUCCESS,
    FIELDS
}

