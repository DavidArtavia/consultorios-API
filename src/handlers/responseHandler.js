// responseHandler.js
const
    
    
    
    sendResponse = ({ res, statusCode, message, data = {} }) => {
    res.status(statusCode).json({
        status: statusCode,
        message,
        data,
    });
};


class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
module.exports = { sendResponse, CustomError };
