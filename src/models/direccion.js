// models/direccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
const Direccion = sequelize.define('Direccion', {
    id_direccion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    id_persona: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    direccion_exacta: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: TABLE_FIELDS.DIRECCION_EXACTA
    },
    canton: {
        type: DataTypes.STRING(55),
        allowNull: false,
    },
    distrito: {
        type: DataTypes.STRING(55),
        allowNull: false,
    },
    localidad: {
        type: DataTypes.STRING(55),
        allowNull: false,
    },
    provincia: {
        type: DataTypes.STRING(55),
        allowNull: false,
    },
}, {
    tableName: 'direcciones',
});

// Definir asociaciones
Direccion.associate = models => {
    Direccion.belongsTo(models.Persona, {
        foreignKey: TABLE_FIELDS.UID_PERSONA,
        onDelete: 'CASCADE',
    });
};

    return Direccion
}