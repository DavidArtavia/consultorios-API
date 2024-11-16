const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

exports.consultaCedula = async (cedula) => {
    let driver;
    try {
        // Configuración del navegador en modo headless
        const options = new chrome.Options(); // Aquí usamos "new" con chrome.Options()
        options.addArguments('--headless');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://servicioselectorales.tse.go.cr/chc/resultado_persona.aspx');

        // Ingresar la cédula en el campo correspondiente
        const inputCedula = await driver.findElement(By.name('ctl00$MainContent$txtCedula'));
        await inputCedula.sendKeys(cedula);

        // Hacer clic en el botón de consulta
        const submitButton = await driver.findElement(By.name('ctl00$MainContent$btnConsultar'));
        await submitButton.click();

        // Esperar la carga y extraer datos de la página
        await driver.sleep(3000); // Ajusta el tiempo de espera según sea necesario

        const result = await driver.findElement(By.id('MainContent_lblResultado')).getText(); // Ajusta el selector según el elemento que contiene el resultado
        return result;
    } catch (error) {
        console.log('error -->>>', error );
        throw new Error('Error al realizar la consulta.');
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
};
