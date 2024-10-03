// models/profesor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS, TABLE_NAME } = require('../constants/constants');

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
    tableName: TABLE_NAME.PROFESORES,
});

// Definir asociaciones
Profesor.associate = models => {
    Profesor.belongsTo(models.Persona, {
        foreignKey: TABLE_FIELDS.UID_PROFESOR,
        onDelete: 'CASCADE',
    });
};

    return Profesor
}
