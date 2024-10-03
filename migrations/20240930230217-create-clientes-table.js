'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id_cliente: {
        type: Sequelize.UUID, // Tipo UUID correcto
        allowNull: false,
        primaryKey: true, // Clave primaria
        references: {
          model: 'persona',  // Referencia a la tabla persona
          key: 'id_persona',  // Columna referenciada en persona
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_subsidiario: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'subsidarios',  // Referencia a la tabla subsidarios
          key: 'id_subsidiario',  // Columna referenciada en subsidarios
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: false,
      },
      ingreso_economico: {
        type: Sequelize.DECIMAL(15, 2),
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  },
};
