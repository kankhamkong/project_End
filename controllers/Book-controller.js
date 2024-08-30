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
    const { title, author, price, volume, rate, image, category, stock } = req.body;

    const stockInt = parseInt(stock, 10);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        price,
        volume,
        rate,
        image,
        currency: "THB", // Default value for currency
        category,
        stock: stockInt,
      },
    });
    res.json({ book });
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  // Convert stock to integer if it exists in the request body
  if (data.stock) {
    data.stock = parseInt(data.stock, 10);
  }

  try {
    const rs = await prisma.book.update({
      data: { ...data },
      where: { id: parseInt(id, 10) }, // Ensure `id` is an integer
    });
    res.json({ msg: "อัพเดทเรียบร้อย", result: rs });
  } catch (err) {
    next(err);
  }
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

let ddp


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

      ddp = existingCartItem.quantity + quantity
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


    if (quantity > ddp) {
      return res.status(400).json({ error: "Requested quantity exceeds available stock" });
    }

    const newAmount = parseFloat(cartItem.book.price) * quantity;

    const quantityDifference = cartItem.quantity - quantity; 

    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: {
        quantity,
        amount: newAmount,
      },
    });

    if (quantityDifference > 0) {
      await prisma.book.update({
        where: { id: cartItem.book.id },
        data: {
          stock: cartItem.book.stock + quantityDifference,
        },
      });
    }

    if (quantityDifference !== 0) {
      await prisma.book.update({
        where: { id: cartItem.book.id },
        data: {
          stock: cartItem.book.stock + quantityDifference,
        },
      });
    }

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

    // Retrieve the cart item with the associated book details before deletion
    const cartItem = await prisma.cart.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        book: true
      }
    });

    // Check if the cart item exists and belongs to the user
    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Delete the cart item
    const rs = await prisma.cart.deleteMany({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    // Update the book's stock by adding back the quantity of the removed cart item
    const updatedBook = await prisma.book.update({
      where: {
        id: cartItem.book.id
      },
      data: {
        stock: cartItem.book.stock + cartItem.quantity // Increase the stock by the quantity of the removed cart item
      }
    });

    res.json({ msg: "Item removed from cart", result: rs, updatedBook });
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

    // await prisma.cart.deleteMany({
    //   where: { userId: Number(userId) },
    // });

    res.json({ result: "Create Order successfully", order });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // ดึงข้อมูลคำสั่งซื้อที่สร้างล่าสุด (status: 0)
    const order = await prisma.order.findFirst({
      where: { userId: Number(userId), status: 0 },
      orderBy: {
        date: 'desc',  // เรียงตามวันที่สร้างจากใหม่ไปเก่า
      },
      include: { user: true },
    });

    // ถ้าไม่พบคำสั่งซื้อ ให้แจ้งเตือน
    if (!order) {
      return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
    }

    // ดึงข้อมูลรายละเอียดของคำสั่งซื้อ
    const orderDetails = await prisma.order_details.findMany({
      where: { order_id: order.id },
      include: { book: true },
    });

    // ส่งข้อมูลคำสั่งซื้อและรายละเอียดกลับไป
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
        address: paymentData.address,
        statusdelovery: 0,
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

    await prisma.cart.deleteMany({
      where: { userId: Number(req.user.id) }, // แก้ไขเป็น req.user.id แทน userId
    });

    res.json({ payment: rs, order: updateOrder });
  } catch (error) {
    next(error);
  }
};


exports.cancelPayment = async (req, res, next) => {
  try {
    const { paymentData } = req.body;
    console.log(paymentData)
    if(paymentData === undefined){
      return res.status(400).json({ message: "Data is undefined" });
    }

    const rs = await prisma.payment.create({
      data: {
        totalQuantity: paymentData.totalQuantity,
        totalPrice: paymentData.totalAmount,
        orderId: paymentData.orderId,
        method: paymentData.method,
        userId: req.user.id,
        status: 2,
        statusdelovery: 0,
      },
    });

    console.log(rs)

    if (!rs) {
      return res.status(400).json({ message: "Unable to create payment" });
    }
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

exports.updatePaymentStatuscancel = async (req, res, next) => {
  try {
    const { status, statusdelovery } = req.body;
    const { id } = req.params; // Payment ID from the request parameters

    console.log(id, status, statusdelovery);
    console.log(req.body)

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id:+id }, // Use the 'id' directly from req.params
      data: {
        status: status, // Use the status from the request body
        statusdelovery: statusdelovery, // Use the statusdelovery from the request body
      },
    });

    // If you need to update the order status as well, uncomment and complete the following code:
    // const updatedOrder = await prisma.order.update({
    //   where: { id: orderId }, // Replace 'orderId' with the correct order ID
    //   data: { status: 4 }, // Assuming 4 is the status you want to set for the order
    // });

    res.json({ payment: updatedPayment });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try{
    const {statusdelovery} = req.body;
    const {id} = req.params;

    const updatedPayment = await prisma.payment.update({
      where: { id:+id }, // Use the 'id' directly from req.params
      data: { 
        statusdelovery: statusdelovery, // Use the statusdelovery from the request body
      },
    });

    res.json({ payment: updatedPayment });
  } catch (error) {
    next(error);
  }
}

exports.createAddress = async (req, res, next) => {
  try {
    const {
      realname,
      surname,
      phone,
      address,
      district,
      province,
      postcode,
    } = req.body;
    const userId = req.user.id;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        realname,
        surname,
        phone,
        address,
        district,
        province,
        postcode,
      },
    });

    res.json({ message: "Address created successfully", newAddress });
  } catch (error) {
    next(error);
  }
};

exports.getAddressesByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    res.json({ addresses });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params; // Address ID from the request parameters
    const {
      realname,
      surname,
      phone,
      address,
      district,
      province,
      postcode,
    } = req.body;

    const updatedAddress = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        realname,
        surname,
        phone,
        address,
        district,
        province,
        postcode,
      },
    });

    res.json({ message: "Address updated successfully", updatedAddress });
  } catch (error) {
    next(error);
  }
};
