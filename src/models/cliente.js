// models/cliente.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
    const Cliente = sequelize.define('Cliente', {
        id_cliente: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        id_subsidiario: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: true,
        },
        sexo: {
            type: DataTypes.ENUM('M', 'F'),
            allowNull: false,
        },
        ingreso_economico: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: TABLE_FIELDS.INGRESO_ECONOMICO
        },
    }, {
        tableName: 'clientes',
    });

    // Definir asociaciones
    Cliente.associate = models => {
        Cliente.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_CLIENTE,
            onDelete: 'CASCADE',
        });
        // Relación con Subsidiario (un cliente puede tener muchos subsidiarios)
        Cliente.hasMany(models.Subsidiario, { // Nota el uso correcto del nombre del modelo con mayúscula
            foreignKey: 'id_subsidiario', // Revisa que este campo exista en la tabla subsidiarios
            onDelete: 'CASCADE',
        });
    };

    return Cliente;
}
