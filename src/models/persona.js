// models/persona.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Persona = sequelize.define('Persona', {
    id_persona: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    primerNombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'primernombre'
        
    },
    segundoNombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'segundonombre'
    },
    primerApellido: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'primerapellido'
    },
    segundoApellido: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'segundoapellido'
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
}, {
    tableName: 'persona'
});

module.exports = Persona;