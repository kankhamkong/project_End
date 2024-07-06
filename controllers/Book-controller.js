const prisma = require("../models/db");
const db = require("../models/db");
const { Status } = require("@prisma/client");

exports.getByUser = async (req, res, next) => {
  try {
    const todos = await db.user.findMany({
      where: { userId: req.user.id },
    });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
};

exports.addBook = async (req, res, next) => {
  try {
    const { title, author, price, volume, rate, image,category } = req.body;
    // console.log(req.body);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        price,
        volume,
        rate,
        image,
        currency: "THB",
        category
      },
    });
    res.json({ book });
  } catch (err) {
    next(err);
  }
};

exports.updateTodo = async (req, res, next) => {
  // validate req.params + req.body
  const { id } = req.params;
  const data = req.body;
  try {
    const rs = await db.todo.update({
      data: { ...data },
      where: { id: +id, userId: req.user.id },
    });
    res.json({ msg: "Update ok", result: rs });
  } catch (err) {
    next(err);
  }
};

exports.deleteTodo = async (req, res, next) => {
  const { id } = req.params;
  try {
    const rs = await db.todo.delete({
      where: { id: +id, userId: req.user.id },
    });
    res.json({ msg: "Delete ok", result: rs });
  } catch (err) {
    next(err);
  }
};

exports.getAllStatus = async (req, res, next) => {
  res.json({ status: Object.values(Status) });
};

exports.getBook = async (req, res, next) => {
  try {
    const Book = await db.book.findMany();
    res.json({ Book });
  } catch (err) {
    next(err);
  }
};

exports.getByid = async (req, res, next) => {
  const { id } = req.params;
  try {
    const idbook = await db.book.findFirst({
      where: { id: +id },
    });
    res.json({ idbook });
  } catch (err) {
    next(err);
  }
};

exports.getBookOptions = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const idbook = await db.book.findFirst({
      where: { id: +id },
    });

    const books = await db.book.findMany({
      where: {
        id: {
          not: +id,
        },
        AND: {
          author: idbook.author,
        },
      },
      take: limit,
      skip: skip,
    });

    res.json({ books });
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await db.subscription.findMany();
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  const { id } = req.params;
  try {
    const rs = await db.book.delete({
      where: { id: +id },
    });
    res.json({ msg: "Delete ok", result: rs });
  } catch (err) {
    next(err);
  }
};

exports.creativeSubscriptions = async (req, res, next) => {
  try {
    const { start, end, userId, bookId } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        start: new Date(start),
        end: new Date(end),
        userId,
        bookId,
      },
    });
    res.json(subscription);
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user.id;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      console.error("Book not found");
      return res.status(404).json({ error: "Book not found" });
    }

    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
      },
    });

    console.log("Existing cart item:", existingCartItem);

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          amount:
            parseFloat(book.price) * (existingCartItem.quantity + quantity),
        },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: {
          book: { connect: { id: bookId } },
          quantity,
          amount: parseFloat(book.price) * quantity,
          user: { connect: { id: userId } },
        },
      });
    }

    console.log("Cart item:", cartItem);
    res.json({ cartItem });
  } catch (err) {
    console.error("Error in addToCart:", err);
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
      include: { book: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const newAmount = parseFloat(cartItem.book.price) * quantity;

    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: {
        quantity,
        amount: newAmount,
      },
    });

    res.json({ updatedCartItem });
  } catch (err) {
    next(err);
  }
};

exports.getCartByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        user: true,
        book: true,
      },
    });

    res.json({ cartItems });
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userId = req.user.id;
    const rs = await prisma.cart.deleteMany({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    res.json({ msg: "Item removed from cart", result: rs });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: Number(userId),
      },
      include: { book: true },
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: "No items in cart" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );

    const order = await prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        total_price: totalAmount,
        date: new Date().toISOString(),
        status: 0, // Initialize status to 0 at order level
      },
    });

    const orderDetailsData = cartItems.map((item) => ({
      order_id: order.id,
      book_id: item.book.id,
      quantity: item.quantity,
      amount: item.amount,
      price: item.book.price,
    }));

    await prisma.order_details.createMany({
      data: orderDetailsData,
    });

    await prisma.cart.deleteMany({
      where: { userId: Number(userId) },
    });

    res.json({ result: "Create Order successfully", order });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const order = await prisma.order.findFirst({
      where: { userId: Number(userId), status: 0 }, //อันนี้คือ get order โดยใช้ user_id ใช่ไหม ถ้าจะให้แอดมินดูได้ต้อง ลบ userId ออก ไม่ต้องใช้
      include: { user: true },
    });
    console.log(order);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderDetails = await prisma.order_details.findMany({
      where: { order_id: order.id },
      include: { book: true },
    });

    res.json({ order, orderDetails });
  } catch (err) {
    next(err);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: { user: true },
    });

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetailHistory = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const orderDetails = await prisma.order_details.findMany({
      where: { order_id: Number(order_id) },
      include: { book: true },
    });

    if (!orderDetails.length) {
      return res.status(404).json({ error: "No order details found" });
    }

    res.json({ orderDetails });
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: {
        Order: {
          include: {
            order_details: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });

    if (payments.length === 0) {
      console.log("No payment found");
    }
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { paymentData } = req.body;
    console.log(paymentData);
    const rs = await prisma.payment.create({
      data: {
        totalQuantity: paymentData.totalQuantity,
        totalPrice: paymentData.totalAmount,
        orderId: paymentData.orderId,
        method: paymentData.method,
        userId: req.user.id,
        status: 1,
        realname: paymentData.realname,
        surname: paymentData.surname,
        address: paymentData.address,
      },
    });

    if (!rs) {
      return res.status(400).json({ message: "Unable to create payment" });
    }

    const updateOrder = await prisma.order.update({
      where: {
        id: rs.orderId,
      },
      data: {
        status: 1,
      },
    });

    res.json({ payment: rs, order: updateOrder });
  } catch (error) {
    next(error);
  }
};


exports.cancelPayment = async (req, res, next) => {
  try {
    const { paymentData } = req.body;
    const rs = await prisma.payment.create({
      data: {
        totalQuantity: paymentData.totalQuantity,
        totalPrice: paymentData.totalAmount,
        orderId: paymentData.orderId,
        method: paymentData.method,
        userId: req.user.id,
        status: 2,
      },
    });

    const rs1 = await prisma.order.update({
      where: {
        id: rs.orderId,
      },
      data: {
        status: 2,
      },
    });
    res.json({ rs, rs1 });
  } catch (error) {
    new error();
  }
};

exports.finishPayment = async (req, res, next) => {
  try {
    const { paymentData } = req.body;
    const rs = await prisma.payment.create({
      where: { id: paymentData.id },
      data: {
        status: 1, // Payment completed
        method: paymentData.method,
      },
    });

    res.json(rs);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistoryForAdmin = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        Order: {
          include: {
            order_details: {
              include: {
                book: true,
              },
            },
          },
        },
        user: true, // include ข้อมูลผู้ใช้งาน
      },
    });

    if (payments.length === 0) {
      console.log("No payments found");
    }
    res.json(payments);
  } catch (error) {
    next(error);
  }
};
