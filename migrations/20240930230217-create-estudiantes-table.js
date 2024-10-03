'use strict';

const { TABLE_NAME } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.ESTUDIANTES, {
      id_estudiante: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'persona',  // Nombre de la tabla a la que se hace referencia
          key: 'id_persona',  // Nombre de la columna de referencia
        },
        onDelete: 'CASCADE',  // Elimina el subsidario si se elimina la persona
        onUpdate: 'CASCADE',
      },
      carnet: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
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
    await queryInterface.dropTable(TABLE_NAME.ESTUDIANTES);

  }
};
