'use strict';

const { TABLE_FIELDS, TABLE_NAME } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.INFORMES, {
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
          model: TABLE_NAME.ESTUDIANTES, // Nombre de la tabla referenciada
          key: TABLE_FIELDS.UID_ESTUDIANTE  // Columna de la tabla referenciada
        },
      },
      id_caso: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: TABLE_NAME.CASOS, // Nombre de la tabla referenciada
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
    await queryInterface.dropTable(TABLE_NAME.INFORMES);
    
  }
};
