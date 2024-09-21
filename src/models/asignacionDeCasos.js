const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
const AsignacionDeCaso = sequelize.define('AsignacionDeCaso', {
    id_asignacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    id_caso: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'casos', // Nombre de la tabla referenciada
            key: TABLE_FIELDS.UID_CASO  // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    id_estudiante: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'estudiantes', // Nombre de la tabla referenciada
            key: TABLE_FIELDS.UID_ESTUDIANTE // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    fechaAsignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: TABLE_FIELDS.FECHA_ASIGNACION
    },
}, {
    tableName: 'asignaciondecasos',
    timestamps: false,
});

// Definir asociaciones
    AsignacionDeCaso.associate = models => {
        AsignacionDeCaso.belongsTo(models.Estudiante, {
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
            onDelete: 'CASCADE',
        });
        AsignacionDeCaso.belongsTo(models.Caso, {
            foreignKey: TABLE_FIELDS.UID_CASO,
            onDelete: 'CASCADE',
        });
    };

    return AsignacionDeCaso
}
