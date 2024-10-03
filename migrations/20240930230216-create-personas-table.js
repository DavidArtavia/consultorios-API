'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('persona', {
      id_persona: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      primer_nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      segundo_nombre: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      primer_apellido: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      segundo_apellido: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING(20),
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
    await queryInterface.dropTable('persona');
  }
};
