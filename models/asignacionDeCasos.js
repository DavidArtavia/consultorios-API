const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

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
            model: TABLE_NAME.CASOS, // Nombre de la tabla referenciada
            key: TABLE_FIELDS.UID_CASO  // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
    id_estudiante: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: TABLE_NAME.ESTUDIANTES, // Nombre de la tabla referenciada
            key: TABLE_FIELDS.UID_ESTUDIANTE // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
    },
   
}, {
    tableName: TABLE_NAME.ASIGNACION_DE_CASOS,
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
