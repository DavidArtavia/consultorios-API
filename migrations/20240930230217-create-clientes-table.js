'use strict';

const { TABLE_NAME } = require("../src/constants/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.CLIENTES, {
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
    await queryInterface.dropTable(TABLE_NAME.CLIENTES);
  },
};
