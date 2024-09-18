-- Table for storing general person information
CREATE TABLE
    Persona (
        id_persona VARCHAR(255) PRIMARY KEY,
        primerNombre VARCHAR(50) NOT NULL,
        segundoNombre VARCHAR(50),
        primerApellido VARCHAR(50) NOT NULL,
        segundoApellido VARCHAR(50) NOT NULL,
        cedula VARCHAR(20) NOT NULL,
        telefono VARCHAR(20)
    );

-- Table for storing login and authentication information
CREATE TABLE
    Usuarios (
        id_usuario VARCHAR(255) PRIMARY KEY,
        id_persona VARCHAR(255) REFERENCES Persona (id_persona) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol VARCHAR(50) CHECK (
            rol IN ('administrador', 'profesor', 'estudiante')
        ) NOT NULL
    );
// se agrego a la tabla usuarios los campos createdAt y updatedAt
ALTER TABLE usuarios ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for storing addresses
CREATE TABLE
    Direcciones (
        id_direccion VARCHAR(255) PRIMARY KEY,
        id_persona VARCHAR(255) REFERENCES Persona (id_persona) ON DELETE CASCADE,
        direccionExacta VARCHAR(200),
        canton VARCHAR(55) NOT NULL,
        distrito VARCHAR(55) NOT NULL,
        localidad VARCHAR(55) NOT NULL,
        provincia VARCHAR(55) NOT NULL
    );

-- Table for storing client-specific information
CREATE TABLE
    Clientes (
        id_cliente VARCHAR(255) PRIMARY KEY REFERENCES Persona (id_persona) ON DELETE CASCADE,
        sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
        ingreso_economico DECIMAL(15, 2),
        fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Table for storing student-specific information
CREATE TABLE
    Estudiantes (
        id_estudiante VARCHAR(255) PRIMARY KEY REFERENCES Persona (id_persona) ON DELETE CASCADE,
        carnet VARCHAR(20) UNIQUE NOT NULL,
        fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Table for storing professor-specific information
CREATE TABLE
    Profesores (
        id_profesor VARCHAR(255) PRIMARY KEY REFERENCES Persona (id_persona) ON DELETE CASCADE,
        especialidad VARCHAR(50),
        fecha_contratacion DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Table for storing information about the counterparty
CREATE TABLE
    Contraparte (
        id_contraparte VARCHAR(255) PRIMARY KEY REFERENCES Persona (id_persona) ON DELETE CASCADE
    );
//se agrego a la tabla contraparte el campo detalles
ALTER TABLE Contraparte
ADD COLUMN detalles TEXT;


-- Table for storing case information with references to professor, student, client, and counterparty
CREATE TABLE
    Casos (
        id_caso VARCHAR(255) PRIMARY KEY,
        id_cliente VARCHAR(255) REFERENCES Clientes (id_cliente),
        id_contraparte VARCHAR(255) REFERENCES Contraparte (id_contraparte),
        expediente VARCHAR(50) UNIQUE NOT NULL,
        ley_7600 BOOLEAN DEFAULT FALSE,
        tipo_proceso VARCHAR(255),
        cuantia_proceso DECIMAL(15, 2),
        aporte_comunidad DECIMAL(15, 2),
        sintesis_hechos TEXT,
        fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
        etapa_proceso TEXT,
        evidencia TEXT,
        estado VARCHAR(25) CHECK (
            estado IN (
                'activo',
                'asesoria',
                'terminado',
                'archivado',
                'asignado'
            )
        ) NOT NULL DEFAULT 'asesoria'
    );

-- Table for assigning cases to students
CREATE TABLE
    AsignacionDeCasos (
        id_asignacion VARCHAR(255) PRIMARY KEY,
        id_caso VARCHAR(255) REFERENCES Casos (id_caso) ON DELETE CASCADE,
        id_estudiante VARCHAR(255) REFERENCES Estudiantes (id_estudiante) ON DELETE CASCADE,
        fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Table for storing final reports submitted by students
CREATE TABLE
    Informes (
        id_informe VARCHAR(255) PRIMARY KEY,
        id_estudiante VARCHAR(255) REFERENCES Estudiantes (id_estudiante),
        id_caso VARCHAR(255) REFERENCES Casos (id_caso),
        contenido_informe TEXT,
        fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE
    );

CREATE TABLE
    Avances (
        id_avance VARCHAR(255) PRIMARY KEY,
        id_caso VARCHAR(255) REFERENCES Casos (id_caso),
        fecha_avance DATE NOT NULL DEFAULT CURRENT_DATE,
        gestion TEXT,
        resultado_concreto TEXT,
        evidencia TEXT,
        observaciones TEXT
    );
