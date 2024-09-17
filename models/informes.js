const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    fechaEntrega: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_entrega'
    },
}, {
    tableName: 'informes'
});

// Definir asociaciones
Informe.associate = models => {
    Informe.belongsTo(models.Estudiante, {
        foreignKey: 'id_estudiante',
    });
    Informe.belongsTo(models.Caso, {
        foreignKey: 'id_caso',
    });
};

module.exports = Informe;
