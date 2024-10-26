'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('password1234', 10);

    return queryInterface.bulkInsert('usuarios', [
      {
        primer_nombre: 'Alexis',
        segundo_nombre: 'Michael',
        primer_apellido: 'Smith',
        segundo_apellido: 'Johnson',
        cedula: '1098765432',
        telefono: '605432189',
        username: 'alexis.smith',
        email: 'alexis.smith@gmail.com',
        password_hash: hashedPassword, // Contraseña encriptada
        rol: 'administrador',
        especialidad: 'Matemáticas',
        carnet: null, // Null para profesores o admin que no tienen carné
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('usuarios', null, {});
  }
};
