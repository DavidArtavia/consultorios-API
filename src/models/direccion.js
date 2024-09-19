// models/direccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    direccionExacta: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'direccionexacta'
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
    timestamps: false, // Desactiva la creación automática de createdAt y updatedAt
});

// Definir asociaciones
Direccion.associate = models => {
    Direccion.belongsTo(models.Persona, {
        foreignKey: 'id_persona',
        onDelete: 'CASCADE',
    });
};

    return Direccion
}