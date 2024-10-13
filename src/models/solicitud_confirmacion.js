const { TABLE_FIELDS, TABLE_NAME } = require('../constants/constants');

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
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: TABLE_NAME.PROFESORES,
                key: TABLE_FIELDS.UID_PROFESOR
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: TABLE_NAME.SOLICITUDES_CONFIRMACION,
    });

    SolicitudConfirmacion.associate = models => {
        SolicitudConfirmacion.belongsTo(models.Caso, {
            foreignKey: TABLE_FIELDS.UID_CASO,
            as: 'caso'
        });
        SolicitudConfirmacion.belongsTo(models.Estudiante, {
            foreignKey: TABLE_FIELDS.UID_ESTUDIANTE,
            as: 'estudiante'
        });
        SolicitudConfirmacion.belongsTo(models.Profesor, {
            foreignKey: TABLE_FIELDS.UID_PROFESOR,
            as: 'profesor'
        });
    };

    return SolicitudConfirmacion;
};
