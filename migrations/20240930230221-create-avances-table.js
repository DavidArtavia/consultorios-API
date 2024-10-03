'use strict';

const { TABLE_FIELDS } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('avances', {
     id_avance: {
       type: Sequelize.UUID,
       defaultValue: Sequelize.UUIDV4,
       primaryKey: true,
       allowNull: false,
     },
     id_caso: {
       type: Sequelize.UUID,
       allowNull: false, references: {
         model: 'casos', // Nombre de la tabla referenciada
         key: TABLE_FIELDS.UID_CASO // Columna de la tabla referenciada
       },
     },
     fecha_avance: {
       type: Sequelize.DATE,
       allowNull: false,
       defaultValue: Sequelize.NOW,
     },
     gestion: {
       type: Sequelize.TEXT,
       allowNull: true,
     },
     resultado_concreto: {
       type: Sequelize.TEXT,
       allowNull: true,
     },
     evidencia: {
       type: Sequelize.TEXT,
       allowNull: true,
     },
     observaciones: {
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
     }
   });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('avances');

  }
};
