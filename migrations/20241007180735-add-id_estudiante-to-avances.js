'use strict';

const { TABLE_NAME, TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME.AVANCES, TABLE_FIELDS.UID_ESTUDIANTE, {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: TABLE_NAME.ESTUDIANTES,  // Nombre de la tabla a la que se refiere la FK
        key: TABLE_FIELDS.UID_ESTUDIANTE,  // Llave primaria en la tabla Estudiantes
      },
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(TABLE_NAME.AVANCES, TABLE_FIELDS.UID_ESTUDIANTE);
  }
};
