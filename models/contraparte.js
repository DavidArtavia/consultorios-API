const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        foreignKey: 'id_contraparte',
        onDelete: 'CASCADE',
    });
};

module.exports = Contraparte;