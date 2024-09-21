const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { TABLE_FIELDS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
    const Contraparte = sequelize.define('Contraparte', {
        id_contraparte: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        detalles: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'contraparte',
        timestamps: false,
    });

    // Definir asociaciones
    Contraparte.associate = models => {
        Contraparte.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_CONTRAPARTE,
            onDelete: 'CASCADE',
        });
    };

    return Contraparte
}