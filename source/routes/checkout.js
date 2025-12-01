const express = require('express');
const router = express.Router();
const cartOrderCtrl = require('../controllers/checkout');

router.post('/', cartOrderCtrl.checkoutOrder);
router.get('/', cartOrderCtrl.getcart_order);
// router.put('/decrease/:classId', cartCtrl.decreaseCartItem);
// router.delete('/remove/:classId', cartCtrl.removeFromCart);
// router.delete('/clear', cartCtrl.clearCart);

module.exports = router;
