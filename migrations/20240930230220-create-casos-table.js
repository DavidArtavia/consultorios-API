'use strict';

const { TABLE_NAME } = require("../src/constants/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME.CASOS, {
      id_caso: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_cliente: { // Clave foránea referenciando a clientes
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clientes',  // Nombre de la tabla referenciada
          key: 'id_cliente',  // Columna de referencia
        },
        onDelete: 'CASCADE',
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
      id_contraparte: { // Clave foránea referenciando a contrapartes
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'contraparte',  // Nombre de la tabla referenciada
          key: 'id_contraparte',  // Columna de referencia
        },
        onDelete: 'SET NULL',
      },
      expediente: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      ley_7600: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tipo_proceso: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      cuantia_proceso: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      aporte_comunidad: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      sintesis_hechos: {
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
      },
      etapa_proceso: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      evidencia: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('activo', 'asesoria', 'terminado', 'archivado', 'asignado'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME.CASOS);
  },
};
