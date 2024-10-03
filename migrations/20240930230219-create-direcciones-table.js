'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('direcciones', {
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
          model: 'persona', // Nombre de la tabla a la que haces referencia
          key: 'id_persona', // Columna a la que estás referenciando
        },
        onDelete: 'CASCADE', // Opción para eliminar en cascada si la fila en la tabla 'persona' es eliminada
        onUpdate: 'CASCADE', 
      },
      direccion_exacta: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      canton: {
        type: Sequelize.STRING(55),
        allowNull: false,
      },
      distrito: {
        type: Sequelize.STRING(55),
        allowNull: false,
      },
      localidad: {
        type: Sequelize.STRING(55),
        allowNull: false,
      },
      provincia: {
        type: Sequelize.STRING(55),
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
    await queryInterface.dropTable('direcciones');

  }
};
