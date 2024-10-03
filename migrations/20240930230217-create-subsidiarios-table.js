'use strict';

const { DataTypes } = require('sequelize');
const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.SUBSIDIARIOS, {

      id_subsidiario: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: TABLE_NAME.PERSONAS,  // Nombre de la tabla a la que se hace referencia
          key: TABLE_FIELDS.UID_PERSONA,  // Nombre de la columna de referencia
        },
        onDelete: 'CASCADE',  // Elimina el subsidario si se elimina la persona
        onUpdate: 'CASCADE',  // Actualiza el subsidario si se actualiza la persona
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: false,
      },
      detalles: {
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
    await queryInterface.dropTable(TABLE_NAME.SUBSIDIARIOS);
  }
};
