// models/profesor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
const Profesor = sequelize.define('Profesor', {
    id_profesor: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    especialidad: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    fechaContratacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_contratacion'
    },
}, {
    tableName: 'profesores',
    timestamps: false, // Desactiva la creación automática de createdAt y updatedAt

});

// Definir asociaciones
Profesor.associate = models => {
    Profesor.belongsTo(models.Persona, {
        foreignKey: 'id_profesor',
        onDelete: 'CASCADE',
    });
};

    return Profesor
}
