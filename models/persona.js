const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");
module.exports = (sequelize, DataTypes) => {
    const Persona = sequelize.define('Persona', {
        id_persona: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        primer_nombre: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        segundo_nombre: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        primer_apellido: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        segundo_apellido: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        cedula: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        telefono_adicional: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: TABLE_NAME.PERSONAS,
    });

    Persona.associate = (models) => {
        Persona.hasOne(models.Estudiante, {
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
            onDelete: 'CASCADE',
        });
        Persona.hasOne(models.Profesor, {
            foreignKey: TABLE_FIELDS.UID_PROFESOR,
            onDelete: 'CASCADE',
        });
        Persona.hasOne(models.Administrador, {
            foreignKey: TABLE_FIELDS.UID_ADMINISTRADOR,
            onDelete: 'CASCADE',
        });
        Persona.hasOne(models.Usuario, {
            foreignKey: TABLE_FIELDS.UID_PERSONA,
            onDelete: 'CASCADE',
        });
        Persona.hasOne(models.Direccion, {
            foreignKey: TABLE_FIELDS.UID_PERSONA,
            onDelete: 'CASCADE',
        });
    };

    return Persona
};