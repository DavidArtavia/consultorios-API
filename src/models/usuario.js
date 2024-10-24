// models/usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { TABLE_FIELDS, ROL, TABLE_NAME } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    id_persona: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Validador de email
        }
    },
    password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM(ROL.SUPERADMIN, ROL.PROFESSOR, ROL.STUDENT),
        allowNull: false,
    },
}, {
    hooks: {
        beforeCreate: async (usuario) => {
            usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
        },
    },
    tableName: TABLE_NAME.USUARIOS, 
});

// Asociación uno a uno
Usuario.associate = models => {
    Usuario.belongsTo(models.Persona, {
        foreignKey: TABLE_FIELDS.UID_PERSONA,
        onDelete: 'CASCADE',
    });
};

    return Usuario;
}
