// utils/imageUtils.js
const fs = require('fs');
const path = require('path');

const convertImageToBase64 = (imagePath) => {
    try {
        // Verificar si la ruta existe
        if (!fs.existsSync(imagePath)) {
            console.error(`La ruta de la imagen no existe: ${imagePath}`);
            return null;
        }

        // Verificar si es un archivo
        const stats = fs.statSync(imagePath);
        if (!stats.isFile()) {
            console.error(`La ruta no es un archivo: ${imagePath}`);
            return null;
        }

        // Verificar extensión
        const extension = path.extname(imagePath).toLowerCase().replace('.', '');
        if (!['jpg', 'jpeg', 'png'].includes(extension)) {
            console.error(`Formato de imagen no soportado: ${extension}`);
            return null;
        }

        // Leer el archivo de imagen
        console.log(`Intentando leer imagen: ${imagePath}`);
        const imageFile = fs.readFileSync(imagePath);
        console.log(`Tamaño de imagen: ${imageFile.length} bytes`);

        // Convertir a base64
        const base64Image = Buffer.from(imageFile).toString('base64');
        console.log(`Longitud base64: ${base64Image.length} caracteres`);

        // Construir data URL
        const mimeType = extension === 'jpg' ? 'jpeg' : extension;
        const dataUrl = `data:image/${mimeType};base64,${base64Image}`;

        // Verificar que la conversión fue exitosa
        console.log(`Conversión exitosa para: ${path.basename(imagePath)}`);

        return dataUrl;

    } catch (error) {
        console.error('Error detallado:', {
            message: error.message,
            stack: error.stack,
            path: imagePath,
            code: error.code
        });
        return null;
    }
};

// Función auxiliar para verificar imagen
const verifyImage = (imagePath) => {
    console.log('Verificando imagen:', {
        path: imagePath,
        exists: fs.existsSync(imagePath),
        extension: path.extname(imagePath),
        absolutePath: path.resolve(imagePath)
    });
};

module.exports = {
    convertImageToBase64,
    verifyImage
};