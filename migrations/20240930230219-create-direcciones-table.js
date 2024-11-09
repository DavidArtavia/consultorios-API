'use strict';

const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.DIRECCIONES, {
      id_direccion: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { // Aquí especificas la tabla y columna a la que hace referencia
          model: TABLE_NAME.PERSONAS,  // Referencia a la tabla persona
          key: TABLE_FIELDS.UID_PERSONA,  // Columna referenciada en persona
        },
        onDelete: 'CASCADE', // Opción para eliminar en cascada si la fila en la tabla 'persona' es eliminada
        onUpdate: 'CASCADE', 
      },
      direccion_exacta: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      canton: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      distrito: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      localidad: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      provincia: {
        type: Sequelize.TEXT,
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME.DIRECCIONES);

  }
};
