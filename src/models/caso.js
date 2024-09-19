const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
const Caso = sequelize.define('Caso', {
    id_caso: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    id_cliente: { // Definición de la clave foránea
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'clientes', // Nombre de la tabla referenciada
            key: 'id_cliente'  // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    id_contraparte: { // Definición de la clave foránea
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'contraparte', // Nombre de la tabla referenciada
            key: 'id_contraparte' // Columna de la tabla referenciada
        },
        onDelete: 'SET NULL'
    },
    expediente: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    ley_7600: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    tipo_proceso: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    cuantia_proceso: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    aporte_comunidad: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    sintesis_hechos: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    etapa_proceso: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    evidencia: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'asesoria', 'terminado', 'archivado', 'asignado'),
        allowNull: false,
        defaultValue: 'asesoria',
    },
}, {
    tableName: 'casos',
    timestamps: false,
});

// Definir asociaciones
Caso.associate = models => {
    Caso.belongsTo(models.Cliente, {
        foreignKey: 'id_cliente',
    });
    Caso.belongsTo(models.Contraparte, {
        foreignKey: 'id_contraparte',
    });
};

    return Caso
}
