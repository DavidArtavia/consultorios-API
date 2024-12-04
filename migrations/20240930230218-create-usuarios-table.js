'use strict';

const { DataTypes } = require('sequelize');
const { ROL, TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.USUARIOS, {
      id_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: TABLE_NAME.PERSONAS,  // Referencia a la tabla persona
          key: TABLE_FIELDS.UID_PERSONA,  // Columna referenciada en persona
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      username: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        }
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_temp_password: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rol: {
        type: Sequelize.ENUM(ROL.SUPERADMIN, ROL.PROFESSOR, ROL.STUDENT),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME.USUARIOS);
  }
};
