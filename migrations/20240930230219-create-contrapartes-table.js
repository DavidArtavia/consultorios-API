'use strict';

const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.CONTRAPARTES, {
      id_contraparte: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: { // Aquí especificas la tabla y columna a la que hace referencia
          model: TABLE_NAME.PERSONAS,  // Referencia a la tabla persona
          key: TABLE_FIELDS.UID_PERSONA,  // Columna referenciada en persona
        },
        onDelete: 'CASCADE', // Opción para eliminar en cascada si la fila en la tabla 'persona' es eliminada
        onUpdate: 'CASCADE',
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: false,
      },
      detalles: {
        type: Sequelize.TEXT,

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
    await queryInterface.dropTable(TABLE_NAME.CONTRAPARTES);

  }
};
