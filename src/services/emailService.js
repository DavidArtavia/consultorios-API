const transporter = require('../config/emailConfig');
const { CustomError } = require('../handlers/responseHandler');
const { HttpStatus } = require('../constants/constants');

class EmailService {
    constructor() {
        this.transporter = transporter;
    }

    async verificarConexion() {
        try {
            await this.transporter.verify();
            console.log('Conexión con Gmail establecida correctamente');
        } catch (error) {
            console.error('Error en la conexión con Gmail:', error);
            throw new CustomError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Error al conectar con el servicio de correo'
            );
        }
    }

    async enviarCorreoRecuperacion(email, datos) {
        try {
            const mailOptions = {
                from: `"Consultorios Jurídicos UCR, sede Guanacaste" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: 'Recuperación de Contraseña - Consultorios Jurídicos',
                html: this.getTemplateRecuperacion(datos)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return info;

        } catch (error) {
            console.error('Error al enviar email:', error);
            throw new CustomError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Error al enviar el correo de recuperación'
            );
        }
    }

    getTemplateRecuperacion(datos) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Recuperación de Contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
                
                <p>Estimado(a) ${datos.nombre_completo},</p>
                
                <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0;">Su contraseña temporal es:</p>
                    <strong style="font-size: 20px; color: #2c3e50; display: block; margin: 10px 0;">
                        ${datos.tempPassword}
                    </strong>
                </div>
                
                <p style="color: #666;">
                    Por razones de seguridad, deberá cambiar esta contraseña temporal 
                    la próxima vez que inicie sesión.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <small style="color: #888;">
                        Este es un correo automático, por favor no responda a este mensaje.
                    </small>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async enviarNotificacionSolicitud({ to, data }) {
        try {
            const mailOptions = {
                from: `"Consultorios Jurídicos" <${process.env.GMAIL_USER}>`,
                to: to,
                subject: `Resultado de solicitud de eliminación de estudiante - ${data.decision}`,
                html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Resultado de Solicitud</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center;">Notificación de Solicitud</h2>
                    
                    <p>Estimado(a) profesor(a) ${data.profesor},</p>
                    
                    <p>Su solicitud de eliminación para el estudiante:</p>
                    <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Nombre:</strong> ${data.estudiante}</p>
                        <p><strong>Cédula:</strong> ${data.cedula}</p>
                    </div>
                    
                    <p>Ha sido <strong>${data.decision === 'aceptado' ?
                        'ACEPTADA' : 'DENEGADA'}</strong>.</p>
                    
                    ${data.decision === 'aceptado' ?
                        '<p>El estudiante ha sido desactivado del sistema.</p>' :
                        '<p>No se realizaron cambios en el estado del estudiante.</p>'}
                    
                    <p style="color: #666;">Fecha de procesamiento: ${data.fecha}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <small style="color: #888;">
                            Este es un correo automático, por favor no responda a este mensaje.
                        </small>
                    </div>
                </div>
            </body>
            </html>
            `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return info;

        } catch (error) {
            console.error('Error al enviar email:', error);
            throw new CustomError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Error al enviar la notificación por correo'
            );
        }
    }
}

module.exports = new EmailService();