const { t } = require("i18next");
const { TABLE_NAME, TABLE_FIELDS } = require("../src/constants/constants");

module.exports = (sequelize, DataTypes) => {
    const SolicitudConfirmacion = sequelize.define('SolicitudConfirmacion', {
        id_solicitud: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        id_caso: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: TABLE_NAME.CASOS,
                key: TABLE_FIELDS.UID_CASO
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        id_estudiante: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: TABLE_NAME.ESTUDIANTES,
                key: TABLE_FIELDS.UID_ESTUDIANTE
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        accion: {
            type: DataTypes.ENUM('eliminar', 'actualizar'),
            allowNull: false
        },
        detalles: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'aceptado', 'denegado'),
            allowNull: false,
            defaultValue: 'pendiente'
        },
        createdBy: { // Profesor o usuario que creó la solicitud
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: TABLE_NAME.PROFESORES,
                key: TABLE_FIELDS.UID_PROFESOR
            }
        },
    }, {
        tableName: TABLE_NAME.SOLICITUD_CONFIRMACION,
    });

    SolicitudConfirmacion.associate = models => {
        SolicitudConfirmacion.belongsTo(models.Caso, {
            foreignKey: TABLE_FIELDS.UID_CASO,
        });
        SolicitudConfirmacion.belongsTo(models.Estudiante, {
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
        });
        SolicitudConfirmacion.belongsTo(models.Persona, {
            as: 'Creador',
            foreignKey: 'createdBy',
            include: [{
                model: models.Profesor
            }, {
                model: models.Usuario
            }]
        });
    };

    return SolicitudConfirmacion;
};
