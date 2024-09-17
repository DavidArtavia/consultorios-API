// models/estudiante.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estudiante = sequelize.define('Estudiante', {
    id_estudiante: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    carnet: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    fechaInscripcion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_inscripcion'
    },
}, {
    tableName: 'estudiantes',
    timestamps: false, // Desactiva la creación automática de createdAt y updatedAt
});

// Definir asociaciones
Estudiante.associate = models => {
    Estudiante.belongsTo(models.Persona, {
        foreignKey: 'id_estudiante',
        onDelete: 'CASCADE',
    });
};

module.exports = Estudiante;
