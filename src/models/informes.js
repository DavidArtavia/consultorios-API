const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
    const Informe = sequelize.define('Informe', {
        id_informe: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        id_estudiante: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_caso: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        contenido_informe: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fecha_entrega: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: TABLE_FIELDS.FECHA_ENTREGA
        },
    }, {
        tableName: 'informes'
    });

    // Definir asociaciones
    Informe.associate = models => {
        Informe.belongsTo(models.Estudiante, {
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
        });
        Informe.belongsTo(models.Caso, {
            foreignKey: TABLE_FIELDS.UID_CASO,
        });
    };

    return Informe
}
