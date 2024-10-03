'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contraparte', {
      id_contraparte: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: { // Aquí especificas la tabla y columna a la que hace referencia
          model: 'persona', // Nombre de la tabla a la que haces referencia
          key: 'id_persona', // Columna a la que estás referenciando
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
    await queryInterface.dropTable('contraparte');

  }
};
