// Validation Middleware
// Input validation for API requests

const validateOrder = (req, res, next) => {
    const payload = startOrderValidation(req);
    
    if (!hasOrderRequiredFields(payload)) {
        return respondMissingOrderValidationFields(res);
    }
    
    if (!isOrderNameValid(payload.name)) {
        return respondInvalidOrderName(res);
    }
    
    if (!isOrderPhoneValid(payload.phone)) {
        return respondInvalidOrderPhone(res);
    }
    
    if (!isOrderCartValid(payload.cart)) {
        return respondInvalidOrderCart(res);
    }
    
    next();
};

function startOrderValidation(req) {
    return req.body || {};
}

function hasOrderRequiredFields(payload) {
    const { name, phone, cart } = payload;
    return Boolean(name && phone && cart);
}

function respondMissingOrderValidationFields(res) {
    return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, cart'
    });
}

function isOrderNameValid(name) {
    return typeof name === 'string' && name.trim().length >= 2;
}

function respondInvalidOrderName(res) {
    return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
    });
}

function isOrderPhoneValid(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
}

function respondInvalidOrderPhone(res) {
    return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
    });
}

function isOrderCartValid(cart) {
    return Array.isArray(cart) && cart.length > 0;
}

function respondInvalidOrderCart(res) {
    return res.status(400).json({
        success: false,
        message: 'Cart must be a non-empty array'
    });
}

module.exports = {
    validateOrder
};


