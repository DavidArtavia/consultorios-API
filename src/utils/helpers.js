// utils/helpers.js

const getFullName = (persona) => {
    if (!persona) return null;
    return `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim();
};

module.exports = getFullName;