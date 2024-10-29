const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");

module.exports = (sequelize, DataTypes) => { 

    const Subsidiario = sequelize.define('Subsidiario', {
        id_subsidiario: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
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
        tableName: TABLE_NAME.SUBSIDIARIOS,
    });

    Subsidiario.associate = models => {
        Subsidiario.belongsTo(models.Persona, { // Un Subsidiario pertenece a una persona
            foreignKey: TABLE_FIELDS.UID_SUBSIDIARIO,
            onDelete: 'CASCADE',
        });
    };

    return Subsidiario;
};