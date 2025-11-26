// Validation Middleware
// Input validation for API requests

const validateOrder = (req, res, next) => {
    const { name, phone, cart } = req.body;
    
    // Check for required fields
    if (!name || !phone || !cart) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: name, phone, cart'
        });
    }
    
    // Validate name
    if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Name must be at least 2 characters long'
        });
    }
    
    // Validate phone
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format'
        });
    }
    
    // Validate cart
    if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Cart must be a non-empty array'
        });
    }
    
    next();
};

module.exports = {
    validateOrder
};


