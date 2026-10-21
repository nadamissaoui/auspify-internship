const Transaction = require("../models/Transaction");

exports.getTransactions = async (req, res) => {
  try {
    const { type, category, from, to, search } = req.query;
    const query = { user: req.user._id };

    if (type && ["income", "expense"].includes(type)) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.status(200).json({ count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    const transaction = await Transaction.create(payload);
    res.status(201).json({ message: "Transaction created", data: transaction });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Error creating transaction", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction updated", data: transaction });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted", data: transaction });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;

    const byCategory = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const monthly = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const recent = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      income,
      expense,
      balance: income - expense,
      transactionCount: totals.reduce((sum, t) => sum + t.count, 0),
      byCategory,
      monthly,
      recent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
};
