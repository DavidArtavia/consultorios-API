const { TABLE_FIELDS } = require("../constants/constants");

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
        tableName: 'subsidiarios',
    });

    Subsidiario.associate = models => {
        Subsidiario.belongsTo(models.Persona, { // Un estudiante pertenece a una persona
            foreignKey: TABLE_FIELDS.UID_PERSONA,  //tenia -> TABLE_FIELDS.UID_ESTUDIANTE
            targetKey: TABLE_FIELDS.UID_PERSONA,//
            onDelete: 'CASCADE',
        });
    };

    return Subsidiario;
};