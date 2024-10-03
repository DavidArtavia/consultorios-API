'use strict';

const { TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('asignaciondecasos', {
      id_asignacion: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_caso: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'casos', // Nombre de la tabla referenciada
          key: TABLE_FIELDS.UID_CASO  // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
      },
      id_estudiante: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estudiantes', // Nombre de la tabla referenciada
          key: TABLE_FIELDS.UID_ESTUDIANTE // Columna de la tabla referenciada
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('asignaciondecasos');

  }
};
