'use strict';

const { TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('informes', {
      id_informe: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_estudiante: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estudiantes', // Nombre de la tabla referenciada
          key: TABLE_FIELDS.UID_ESTUDIANTE  // Columna de la tabla referenciada
        },
      },
      id_caso: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'casos', // Nombre de la tabla referenciada
          key: TABLE_FIELDS.UID_CASO  // Columna de la tabla referenciada
        },
      },
      contenido_informe: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fecha_entrega: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: TABLE_FIELDS.FECHA_ENTREGA
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
    await queryInterface.dropTable('informes');

  }
};
