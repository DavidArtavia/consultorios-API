'use strict';

const { DataTypes } = require('sequelize');
const { ROL } = require('../src/constants/constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('usuarios', {
     id_usuario: {
       type: DataTypes.UUID,
       defaultValue: DataTypes.UUIDV4,
       primaryKey: true,
       allowNull: false,
     },
     id_persona: {
       type: Sequelize.UUID,
       allowNull: false,
       references: {
         model: 'persona',
         key: 'id_persona',
       },
       onDelete: 'CASCADE',
       onUpdate: 'CASCADE', 
     },
     username: {
       type: Sequelize.STRING(50),
       allowNull: false,
       unique: true,
     },
     email: {
       type: Sequelize.STRING(50),
       allowNull: false,
       unique: true,
       validate: {
         isEmail: true,
       }
     },
     password_hash: {
       type: Sequelize.TEXT,
       allowNull: false,
     },
     rol: {
       type: Sequelize.ENUM(ROL.SUPERADMIN, ROL.PROFESSOR, ROL.STUDENT),
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
    await queryInterface.dropTable('usuarios');
  }
};
