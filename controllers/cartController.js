// GET ALL CART ITEMS
exports.getCart = async (req, res) => {
  try {
    const cartItems = await req.cart.find().toArray();
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err });
  }
};

exports.addToCart = async (req, res) => {
  console.log("hello". req)
  try {
    let { classId } = req.body;
    classId = parseInt(classId);

    const classItem = await req.classes.findOne({ id: classId });
    console.log("classItem", classItem)

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classItem.spaces <= 0) {
      return res.status(400).json({ message: 'No spaces left' });
    }

     await req.classes.updateOne(
      { id: classId },
      { $inc: { spaces: -1 } }
    );

    const existing = await req.cart.findOne({ classId });

    if (existing) {
      
      await req.cart.updateOne(
        { classId },
        { $inc: { quantity: 1 } }
      );
    } else {
      await req.cart.insertOne({
        classId,
        subject: classItem.subject,
        img_url: classItem.img_url,
        location: classItem.location,
        price: classItem.price,
        icon: classItem.icon,
        quantity: 1,
      });
    }

    const updatedCart = await req.cart.find().toArray();
    res.json(updatedCart);

  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err });
  }
};


// DECREASE QUANTITY OR REMOVE
exports.decreaseCartItem = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);

    const item = await req.cart.findOne({ classId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (item.quantity > 1) {
      await req.cart.updateOne({ classId }, { $inc: { quantity: -1 } });
    } else {
      await req.cart.deleteOne({ classId });
    }

    const updatedCart = await req.cart.find().toArray();
    
    const updatedClass = await req.classes.updateOne({"id": classId}, {$inc : {spaces :+1}})
    console.log("updated class", updatedClass)
    res.json(updatedCart);

  } catch (err) {
    console.log("error", err)
    res.status(500).json({ message: 'Error decreasing item', error: err });
  }
};

// REMOVE COMPLETELY
exports.removeFromCart = async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);

    await req.cart.deleteOne({ classId });

    const updatedCart = await req.cart.find().toArray();
    res.json(updatedCart);

  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err });
  }
};

exports.clearCart = async (req, res) => {
  console.log("delete function called")
  try {
    await req.cart.deleteMany({});
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err });
  }
};
