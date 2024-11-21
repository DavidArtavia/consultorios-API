const transporter = require('../config/emailConfig');
const { CustomError } = require('../handlers/responseHandler');
const { HttpStatus } = require('../constants/constants');
const { convertImageToBase64, verifyImage } = require('../utils/imageUtils');
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = transporter;

        const ucrLogoPath = path.join(__dirname, '../assets/images/ucr-logo.jpg');
        const sgcderLogoPath = path.join(__dirname, '../assets/images/sgcder-logo.jpg');

        // Verificar rutas
        console.log('Verificando rutas de imágenes:');
        verifyImage(ucrLogoPath);
        verifyImage(sgcderLogoPath);

        // Convertir imágenes
        this.ucrLogo = convertImageToBase64(ucrLogoPath);
        this.sgcderLogo = convertImageToBase64(sgcderLogoPath);

        // Verificar resultados
        console.log('Estado de carga de imágenes:', {
            ucrLogo: !!this.ucrLogo,
            sgcderLogo: !!this.sgcderLogo
        });

        if (!this.ucrLogo || !this.sgcderLogo) {
            console.error('Error cargando las imágenes del correo');
        }
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
        const template = this.getTemplateRecuperacion(datos);

        try {
            // Verificar que las imágenes estén cargadas
            if (!this.ucrLogo || !this.sgcderLogo) {
                console.error('Error: Las imágenes no están cargadas correctamente');
                throw new CustomError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Error en la configuración de imágenes del correo'
                );
            }

            const mailOptions = {
                from: {
                    name: 'Consultorios Jurídicos UCR, Sede Guanacaste',
                    address: process.env.GMAIL_USER
                },
                to: email,
                subject: 'Recuperación de Contraseña - Consultorios Jurídicos',
                html: template,
                attachments: [  // Agregar esto
                    {
                        filename: 'ucr-logo.jpg',
                        path: path.join(__dirname, '../assets/images/ucr-logo.jpg'),
                        cid: 'ucr-logo'
                    },
                    {
                        filename: 'sgcder-logo.jpg',
                        path: path.join(__dirname, '../assets/images/sgcder-logo.jpg'),
                        cid: 'sgcder-logo'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado exitosamente:', {
                messageId: info.messageId,
                to: email,
                subject: mailOptions.subject
            });

            return info;

        } catch (error) {
            console.error('Error detallado al enviar email:', {
                error: error.message,
                stack: error.stack
            });

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
        <style>
            .logo-container {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo-image {
                display: block;
                margin: 10px auto;
                max-width: 150px;
                height: auto;
            }
            .header-text {
                margin-top: 10px;
                color: #666;
            }
            .header-text h3 {
                margin: 5px 0;
                color: #4a235a;
            }
            .header-text h4 {
                margin: 5px 0;
                font-weight: normal;
                color: #666;
            }
            .main-title {
                color: #4a235a;
                text-align: center;
                margin: 30px 0;
            }
            .password-container {
                background: #fff;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
                border: 1px solid #e8e8e8;
            }
            .password-text {
                font-size: 20px;
                color: #4a235a;
                margin: 10px 0;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #888;
                font-size: 12px;
            }
        </style>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div class="logo-container">
                <img class="logo-image" src="cid:ucr-logo" alt="UCR Logo">
                <img class="logo-image" src="cid:sgcder-logo" alt="SG-CDer Logo">
                <div class="header-text">
                    <h3>Carrera de Derecho</h3>
                    <h4>Sede de Guanacaste</h4>
                </div>
            </div>

            <h2 class="main-title">Recuperación de Contraseña</h2>
            
            <p style="color: #333;">Estimado(a) ${datos.nombre_completo},</p>
            
            <div class="password-container">
                <p style="margin: 0; color: #666;">Su contraseña temporal es:</p>
                <div class="password-text">
                    ${datos.tempPassword}
                </div>
            </div>
            
            <p style="color: #666; text-align: justify;">
                Por razones de seguridad, deberá cambiar esta contraseña temporal 
                la próxima vez que inicie sesión en el sistema.
            </p>
            
            <div class="footer">
                <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                <p>Consultorios Jurídicos UCR © ${new Date().getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    async enviarNotificacionSolicitud({ to, data }) {
        const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Notificación de Solicitud</title>
        <style>
            .logo-container {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo-image {
                display: block;
                margin: 10px auto;
                max-width: 150px;
                height: auto;
            }
            .header-text {
                margin-top: 10px;
                color: #666;
            }
            .header-text h3 {
                margin: 5px 0;
                color: #4a235a;
            }
            .header-text h4 {
                margin: 5px 0;
                font-weight: normal;
                color: #666;
            }
            .main-title {
                color: #4a235a;
                text-align: center;
                margin: 30px 0;
            }
            .student-info {
                background: #fff;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #e8e8e8;
            }
            .status-text {
                font-size: 18px;
                color: #4a235a;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .info-label {
                color: #4a235a;
                font-weight: bold;
            }
            .date-text {
                color: #666;
                font-style: italic;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #888;
                font-size: 12px;
            }
        </style>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div class="logo-container">
                <img class="logo-image" src="cid:ucr-logo" alt="UCR Logo">
                <img class="logo-image" src="cid:sgcder-logo" alt="SG-CDer Logo">
                <div class="header-text">
                    <h3>Consultorios Jurídicos</h3>
                    <h4>Sede de Guanacaste</h4>
                </div>
            </div>

            <h2 class="main-title">Notificación de Solicitud</h2>
            
            <p style="color: #333;">Estimado(a) profesor(a) ${data.profesor},</p>
            
            <p style="color: #4a235a;">Su solicitud de eliminación para el estudiante:</p>
            
            <div class="student-info">
                <p><span class="info-label">Nombre:</span> ${data.estudiante}</p>
                <p><span class="info-label">Cédula:</span> ${data.cedula}</p>
            </div>
            
            <p class="status-text">
                Ha sido ${data.decision === 'aceptado' ?
                '<span style="color: #27ae60;">ACEPTADA</span>' :
                '<span style="color: #c0392b;">DENEGADA</span>'}
            </p>
            
            ${data.decision === 'aceptado' ?
                '<p style="color: #27ae60; text-align: center;">El estudiante ha sido desactivado del sistema.</p>' :
                '<p style="color: #c0392b; text-align: center;">No se realizaron cambios en el estado del estudiante.</p>'
            }
            
            <p class="date-text">Fecha de procesamiento: ${data.fecha}</p>
            
            <div class="footer">
                <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                <p>Consultorios Jurídicos UCR © ${new Date().getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
    `;

        try {
            // Verificar que las imágenes estén cargadas
            if (!this.ucrLogo || !this.sgcderLogo) {
                console.error('Error: Las imágenes no están cargadas correctamente');
                throw new CustomError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Error en la configuración de imágenes del correo'
                );
            }

            const mailOptions = {
                from: {
                    name: 'Consultorios Jurídicos UCR, Sede Guanacaste',
                    address: process.env.GMAIL_USER
                },
                to: to,
                subject: `Resultado de solicitud de eliminación de estudiante - ${data.decision.toUpperCase()}`,
                html: template,
                attachments: [
                    {
                        filename: 'ucr-logo.jpg',
                        path: path.join(__dirname, '../assets/images/ucr-logo.jpg'),
                        cid: 'ucr-logo'  // usar este ID en el src de la imagen
                    },
                    {
                        filename: 'sgcder-logo.jpg',
                        path: path.join(__dirname, '../assets/images/sgcder-logo.jpg'),
                        cid: 'sgcder-logo'  // usar este ID en el src de la imagen
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado exitosamente:', {
                messageId: info.messageId,
                to: to,
                subject: mailOptions.subject
            });

            return info;

        } catch (error) {
            console.error('Error detallado al enviar email:', {
                error: error.message,
                stack: error.stack
            });

            throw new CustomError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Error al enviar la notificación por correo'
            );
        }
    }
}

module.exports = new EmailService();