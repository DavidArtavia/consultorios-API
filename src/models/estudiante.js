// models/estudiante.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        fechaInscripcion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fecha_inscripcion'
        },
    }, {
        tableName: 'estudiantes',
        timestamps: false, // Desactiva la creación automática de createdAt y updatedAt
    });

    // Definir asociaciones
    Estudiante.associate = models => {
        Estudiante.belongsTo(models.Persona, { // Un estudiante pertenece a una persona
            foreignKey: 'id_estudiante',
            targetKey: 'id_persona',
            onDelete: 'CASCADE',
        });
        Estudiante.hasMany(models.AsignacionDeCaso, {  // Un estudiante puede tener muchas asignaciones de casos
            foreignKey: 'id_estudiante',
            onDelete: 'CASCADE',
        });
    };

    return Estudiante;
}