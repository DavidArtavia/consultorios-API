'use strict';

const { TABLE_NAME } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.PERSONAS, {
      id_persona: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      primer_nombre: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      segundo_nombre: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      primer_apellido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      segundo_apellido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cedula: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      telefono: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      telefono_adicional: {
        type: Sequelize.TEXT,
        allowNull: true,
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
} );
  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME.PERSONAS);
  }
};
