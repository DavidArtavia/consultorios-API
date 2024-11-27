// models/usuario.js

const bcrypt = require('bcryptjs');
const { TABLE_NAME, TABLE_FIELDS, ROL, BCRYPT_CONFIG } = require('../src/constants/constants');

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
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.TEXT,
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
    is_temp_password: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    rol: {
        type: DataTypes.ENUM(ROL.SUPERADMIN, ROL.PROFESSOR, ROL.STUDENT),
        allowNull: false,
    },
}, {
    hooks: {
        beforeCreate: async (usuario) => {
            usuario.password_hash = await bcrypt.hash(usuario.password_hash, BCRYPT_CONFIG.SALT_ROUNDS);
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
