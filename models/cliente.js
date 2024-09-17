// models/cliente.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    ingresoEconomico: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'ingreso_economico'
    },
    fechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_registro'
    },
}, {
    tableName: 'clientes',
    timestamps: false,
});

// Definir asociaciones
Cliente.associate = models => {
    Cliente.belongsTo(models.Persona, {
        foreignKey: 'id_cliente',
        onDelete: 'CASCADE',
    });
};

module.exports = Cliente;

