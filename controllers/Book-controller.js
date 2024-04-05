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
    const { title, author, price, volume, rate, image } = req.body;
    // console.log(req.body);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        price,
        volume,
        rate,
        image,
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
  const {id} = req.params;
  try {
    const idbook = await db.book.findFirst({
      where: { id: +id },
    });
    res.json({ idbook });
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await db.subscription.findMany();
    res.json({subscriptions});
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  const {id} = req.params;
  try {
    const rs = await db.book.delete({
      where: {id: +id},
    });
    res.json({ msg: "Delete ok", result: rs});
  } catch (err) {
    next(err);
  }
};

exports.creativeSubscriptions = async (req,res,next) => {
  try {
    const { start , end , userId , bookId } = req.body;
    
    const subscription = await prisma.subscription.create({
      data: {
        start:new Date(start),
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

