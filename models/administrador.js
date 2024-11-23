const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");
module.exports = (sequelize, DataTypes) => {
    const Administrador = sequelize.define('Administrador', {
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
        tableName: TABLE_NAME.ADMINISTRADORES,
    });

    // Definir asociaciones
    Administrador.associate = models => {
        Administrador.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_ADMINISTRADOR,
            targetKey: TABLE_FIELDS.UID_PERSONA,
            onDelete: 'CASCADE',
        });
    };

    return Administrador
}
