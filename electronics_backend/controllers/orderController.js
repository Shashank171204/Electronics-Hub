import orderModel from "../models/orderModel.js";

const newOrder = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || !body.email || !body.items) {
      return res
        .status(400)
        .json({ message: "Order needs an email and items" });
    }

    // NOTE: this was missing `await`, so the handler responded 200 with a
    // pending Promise (which serialises to `{}`) before the insert finished —
    // the client saw "success" for an order that never saved, and a rejection
    // became an unhandled promise rejection instead of an error response.
    const result = await orderModel.create(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const showOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await orderModel.find({ email: id });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export { newOrder, showOrder };
