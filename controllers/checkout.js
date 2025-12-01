exports.getcart_order = async (req, res) => {
  try {
    const cart_orderItems = await req.cart_order.find().toArray();
    res.json(cart_orderItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart_order', error: err });
  }
};

exports.checkoutOrder = async (req, res) => {
  try {
    const { name, phone, lessonIDs, quantities } = req.body;

    if (!name || !phone || !lessonIDs || !quantities) {
      return res.status(400).json({ message: "Missing checkout information" });
    }

    if (!Array.isArray(lessonIDs) || !Array.isArray(quantities)) {
      return res.status(400).json({ message: "lessonIDs and quantities must be arrays" });
    }

    const order = {
      name,
      phone,
      lessonIDs,
      quantities,
      date: new Date()
    };

    await req.cart_order.insertOne(order);

    await req.cart.deleteMany({});

    res.json({
      message: "Order successfully placed!",
      order
    });

  } catch (err) {
    console.error("Checkout failed:", err);
    res.status(500).json({ message: "Checkout error", error: err });
  }
};


exports.decreasecart_orderItem = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);

    const item = await req.cart_order.findOne({ classId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart_order' });
    }

    if (item.quantity > 1) {
      await req.cart_order.updateOne({ classId }, { $inc: { quantity: -1 } });
    } else {
      await req.cart_order.deleteOne({ classId });
    }

    const updatedcart_order = await req.cart_order.find().toArray();
    
    const updatedClass = await req.classes.updateOne({"id": classId}, {$inc : {spaces :+1}})
    console.log("updated class", updatedClass)
    res.json(updatedcart_order);

  } catch (err) {
    console.log("error", err)
    res.status(500).json({ message: 'Error decreasing item', error: err });
  }
};

exports.removeFromCart_order = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);

    await req.cart_order.deleteOne({ classId });

    const updatedcart_order = await req.cart_order.find().toArray();
    res.json(updatedcart_order);

  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err });
  }
};

exports.clearcart_order = async (req, res) => {
  console.log("delete function called")
  try {
    await req.cart_order.deleteMany({});
    res.json({ message: 'cart_order cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart_order', error: err });
  }
};
