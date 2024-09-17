// middlewares/auth.js
function verificarSesion(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ message: 'No autenticado' });
}

module.exports = verificarSesion;
