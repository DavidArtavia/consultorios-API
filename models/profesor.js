const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");

// models/profesor.js
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
