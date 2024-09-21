// utils/helpers.js

const obtenerNombreCompleto = (persona) => {
    if (!persona) return null;
    return `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim();
};

module.exports = obtenerNombreCompleto;