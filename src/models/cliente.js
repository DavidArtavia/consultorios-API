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
        sexo: {
            type: DataTypes.ENUM('M', 'F'),
            allowNull: false,
        },
        ingreso_economico: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: TABLE_FIELDS.INGRESO_ECONOMICO
        },
        fechaRegistro: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: TABLE_FIELDS.FECHA_REGISTRO
        },
    }, {
        tableName: 'clientes',
        timestamps: false,
    });

    // Definir asociaciones
    Cliente.associate = models => {
        Cliente.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_CLIENTE,
            onDelete: 'CASCADE',
        });
    };

    return Cliente;
}
