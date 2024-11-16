const express = require('express');
const { consultaCedula } = require('../controllers/tseController');
const router = express.Router();

router.post('/tse', async (req, res) => {
    const { cedula } = req.body;

    console.log('cedula -->>>', cedula );
    if (!cedula) {
        return res.status(400).json({ error: 'La cédula es requerida.' });
    }

    try {
        const resultado = await consultaCedula(cedula);
        res.status(200).json({ resultado });
    } catch (error) {
        res.status(500).json({
            error: {
                a: error.message,
                b: error.stack,
                c: error
            
        } });
    }
});

module.exports = router;
