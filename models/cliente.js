const { TABLE_FIELDS, TABLE_NAME } = require("../src/constants/constants");

// models/cliente.js
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
    }, {
        tableName: TABLE_NAME.CLIENTES,
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
