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
}, {
    tableName: 'profesores',
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
