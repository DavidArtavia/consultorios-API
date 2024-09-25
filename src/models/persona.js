// models/persona.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');


module.exports = (sequelize, DataTypes) => {
    const Persona = sequelize.define('Persona', {
        id_persona: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        primer_nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        segundo_nombre: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        primer_apellido: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        segundo_apellido: {
            type: DataTypes.STRING(50),
            allowNull: false,
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

    Persona.associate = (models) => {
        Persona.hasOne(models.Direccion, {
            foreignKey: 'id_persona', // La clave foránea en la tabla Direcciones
            onDelete: 'CASCADE',
        });
    };

    return Persona
};