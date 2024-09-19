const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
});

// Importar y definir modelos
const Persona = require('./persona')(sequelize, Sequelize.DataTypes);
const Usuario = require('./usuario')(sequelize, Sequelize.DataTypes); // Añadir esta línea
const Estudiante = require('./estudiante')(sequelize, Sequelize.DataTypes);
const AsignacionDeCaso = require('./asignacionDeCasos')(sequelize, Sequelize.DataTypes);
const Caso = require('./caso')(sequelize, Sequelize.DataTypes);
const Cliente = require('./cliente')(sequelize, Sequelize.DataTypes);
const Contraparte = require('./contraparte')(sequelize, Sequelize.DataTypes);
const Avance = require('./avances')(sequelize, Sequelize.DataTypes);
const Direccion = require('./direccion')(sequelize, Sequelize.DataTypes);
const Informe = require('./informes')(sequelize, Sequelize.DataTypes);
const Profesor = require('./profesor')(sequelize, Sequelize.DataTypes);

const models = {
    Persona,
    Usuario, // Añadir esta línea
    Estudiante,
    AsignacionDeCaso,
    Caso,
    Cliente,
    Contraparte,
    Avance,
    Direccion,
    Informe,
    Profesor,
    sequelize, // connection instance (RAW queries)
    Sequelize, // library
};

// Ejecutar las asociaciones
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;
