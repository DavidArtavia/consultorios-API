const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
    const Avance = sequelize.define('Avance', {
        id_avance: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        id_caso: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        fecha_avance: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: TABLE_FIELDS.FECHA_AVANCE
        },
        gestion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resultado_concreto: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: TABLE_FIELDS.RESULTADO_CONCRETO
        },
        evidencia: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'avances'
    });

    // Definir asociaciones
    Avance.associate = models => {
        Avance.belongsTo(models.Caso, {
            foreignKey: TABLE_FIELDS.UID_CASO,
        });
    };

    return Avance
}
