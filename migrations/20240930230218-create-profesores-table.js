'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('profesores', {
   
      id_profesor: {
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
      especialidad: {
        type: Sequelize.STRING(50),
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
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('profesores');

  }
};
