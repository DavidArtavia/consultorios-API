'use strict';

const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.PROFESORES, {
      id_profesor: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: TABLE_NAME.PERSONAS,  // Referencia a la tabla persona
          key: TABLE_FIELDS.UID_PERSONA,  // Columna referenciada en persona
        },
        onDelete: 'CASCADE',  // Elimina el subsidario si se elimina la persona
        onUpdate: 'CASCADE',
      },
      especialidad: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
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
    await queryInterface.dropTable(TABLE_NAME.PROFESORES);

  }
};
