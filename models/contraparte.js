const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");

module.exports = (sequelize, DataTypes) => {
    const Contraparte = sequelize.define('Contraparte', {
        id_contraparte: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        sexo: {
            type: DataTypes.ENUM('M', 'F'),
            allowNull: false,
        },
        detalles: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: TABLE_NAME.CONTRAPARTES
    });

    // Definir asociaciones
    Contraparte.associate = models => {
        Contraparte.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_CONTRAPARTE,
            onDelete: 'CASCADE',
        });
    };

    return Contraparte
}