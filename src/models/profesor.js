// models/profesor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
const Profesor = sequelize.define('Profesor', {
    id_profesor: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    especialidad: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    fechaInscripcion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: TABLE_FIELDS.FECHA_INSCRIPCION
    },
}, {
    tableName: 'profesores',
    timestamps: false, // Desactiva la creación automática de createdAt y updatedAt

});

// Definir asociaciones
Profesor.associate = models => {
    Profesor.belongsTo(models.Persona, {
        foreignKey: 'id_profesor',
        onDelete: 'CASCADE',
    });
};

    return Profesor
}
