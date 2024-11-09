const { TABLE_FIELDS, TABLE_NAME } = require("../src/constants/constants");

module.exports = (sequelize, DataTypes) => {
    const Direccion = sequelize.define('Direccion', {
        id_direccion: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        id_persona: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        direccion_exacta: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: TABLE_FIELDS.DIRECCION_EXACTA,
        },
        canton: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: TABLE_FIELDS.CANTON,
        },
        distrito: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: TABLE_FIELDS.DISTRITO,
        },
        localidad: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: TABLE_FIELDS.LOCALIDAD,
        },
        provincia: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: TABLE_FIELDS.PROVINCIA,
        },
    }, {
        tableName: TABLE_NAME.DIRECCIONES,
    });

    // Definir asociaciones
    Direccion.associate = models => {
        Direccion.belongsTo(models.Persona, {
            foreignKey: TABLE_FIELDS.UID_PERSONA,
            onDelete: 'CASCADE',
        });
    };

    return Direccion
}