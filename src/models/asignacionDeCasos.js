const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
            key: 'id_caso'  // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    id_estudiante: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'estudiantes', // Nombre de la tabla referenciada
            key: 'id_estudiante' // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    fechaAsignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_asignacion'
    },
}, {
    tableName: 'asignaciondecasos'
});

// Definir asociaciones
AsignacionDeCaso.associate = models => {
    AsignacionDeCaso.belongsTo(models.Caso, {
        foreignKey: 'id_caso',
        onDelete: 'CASCADE',
    });
    AsignacionDeCaso.belongsTo(models.Estudiante, {
        foreignKey: 'id_estudiante',
        onDelete: 'CASCADE',
    });
};

module.exports = AsignacionDeCaso;
