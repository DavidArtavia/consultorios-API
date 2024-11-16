// seeders/20221026-seedUsers.js
const { Persona, Usuario, Estudiante, Profesor, Direccion, sequelize } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await sequelize.transaction(async (transaction) => {

      const selecionar = 2; // 1 = estudiantes, 2 = profesores o admin

      const usersData = [
        {
          personaData: {
            primer_nombre: 'Nombre1',
            segundo_nombre: 'Nombre2',
            primer_apellido: 'Apellido1',
            segundo_apellido: 'Apellido2',
            cedula: '609990999',
            telefono: '50124872',
          },
          direccionData: {
            direccion_exacta: 'Dirección1',
            canton: 'Canton1',
            distrito: 'Distrito1',
            localidad: 'Localidad1',
            provincia: 'Provincia1',
          },
          userData: {
            username : 'username1',
            email : 'Nombre1@gmail.com',
            password_hash: '12345678', // Se encripta en el hook beforeCreate
            rol: 'administrador' // 'estudiante', 'profesor', 'administrador'
          },
          estudianteData: {
            carnet: 'B50555'
          },
          profesorData: {
            especialidad: 'Especialidad1'
          }
        },
      ];
      
      for (const data of usersData) {
        const { userData, personaData, direccionData, estudianteData, profesorData } = data;
        const persona = await Persona.create(personaData, { transaction });
        await Direccion.create({ ...direccionData, id_persona: persona.id_persona }, { transaction });
        await Usuario.create({ ...userData, id_persona: persona.id_persona }, { transaction });

        if (estudianteData && selecionar === 1) {
          await Estudiante.create({ ...estudianteData, id_estudiante: persona.id_persona }, { transaction });
        }
        if (profesorData && selecionar === 2) {
          await Profesor.create({ ...profesorData, id_profesor: persona.id_persona }, { transaction });
        }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('User', null, {});
    await queryInterface.bulkDelete('Persona', null, {});
    await queryInterface.bulkDelete('Estudiante', null, {});
    await queryInterface.bulkDelete('Profesor', null, {});
    await queryInterface.bulkDelete('Direccion', null, {});
  }
};
