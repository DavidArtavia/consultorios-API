const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        fechaAvance: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fecha_avance'
        },
        gestion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resultadoConcreto: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'resultado_concreto'
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
            foreignKey: 'id_caso',
        });
    };

    return Avance
}
