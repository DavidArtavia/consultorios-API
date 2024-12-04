'use strict';

const { TABLE_FIELDS, TABLE_NAME } = require("../src/constants/constants");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME.SOLICITUD_CONFIRMACION, {
      id_solicitud: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      id_caso: {
        type: Sequelize.UUID,
        allowNull: true, // Será null si la solicitud es para eliminar o actualizar estudiante.
        references: {
          model: TABLE_NAME.CASOS, // Referencia a la tabla 'casos'.
          key: TABLE_FIELDS.UID_CASO
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_estudiante: {
        type: Sequelize.UUID,
        allowNull: true, // Será null si la solicitud es para un caso.
        references: {
          model: TABLE_NAME.ESTUDIANTES, // Referencia a la tabla 'estudiantes'.
          key: TABLE_FIELDS.UID_ESTUDIANTE
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      accion: {
        type: Sequelize.ENUM('eliminar', 'actualizar'),
        allowNull: false
      },
      detalles: {
        type: Sequelize.TEXT,
        allowNull: true // Campo opcional para detalles adicionales sobre la solicitud.
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aceptado', 'denegado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      createdBy: {
        type: Sequelize.UUID, // ID del profesor que hizo la solicitud.
        allowNull: false,
        references: {
          model: TABLE_NAME.PROFESORES,
          key: TABLE_FIELDS.UID_PROFESOR
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(TABLE_NAME.SOLICITUD_CONFIRMACION);
  }
};
