const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");
module.exports = (sequelize, DataTypes) => {
const Profesor = sequelize.define('Profesor', {
    id_profesor: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    especialidad: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
    },
}, {
    tableName: TABLE_NAME.PROFESORES,
});

// Definir asociaciones
Profesor.associate = models => {
    Profesor.belongsTo(models.Persona, {
        foreignKey: TABLE_FIELDS.UID_PROFESOR,
        onDelete: 'CASCADE',
    });
};

    return Profesor
}
