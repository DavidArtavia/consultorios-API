// models/estudiante.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
    const Estudiante = sequelize.define('Estudiante', {
        id_estudiante: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        carnet: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'estudiantes',
        timestamps: false, // Desactiva la creación automática de createdAt y updatedAt
    });

    // Definir asociaciones
    Estudiante.associate = models => {
        Estudiante.belongsTo(models.Persona, { // Un estudiante pertenece a una persona
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,  //tenia -> TABLE_FIELDS.UID_ESTUDIANTE
            targetKey: TABLE_FIELDS.UID_PERSONA,
            onDelete: 'CASCADE',
        });
        Estudiante.hasMany(models.AsignacionDeCaso, {  // Un estudiante puede tener muchas asignaciones de casos
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
            onDelete: 'CASCADE',
        });
    };

    return Estudiante;
}