const Student = require("../models/Student");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getAllStudents = async (req, res) => {
  try {
    const { search, course, year, sort } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    if (course) {
      query.course = new RegExp(`^${escapeRegex(course)}$`, "i");
    }

    if (year) {
      query.year = Number(year);
    }

    const sortOptions = {
      createdAt: { createdAt: -1 },
      name: { lastName: 1, firstName: 1 },
      grade: { grade: -1 },
    };

    const students = await Student.find(query).sort(
      sortOptions[sort] || sortOptions.createdAt
    );

    res.status(200).json({ count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ data: student });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student id" });
    }
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ message: "Student created successfully", data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A student with this email already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Error creating student", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student updated successfully", data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A student with this email already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student id" });
    }
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully", data: student });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student id" });
    }
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const avgGrade = await Student.aggregate([
      { $group: { _id: null, average: { $avg: "$grade" } } },
    ]);
    const byCourse = await Student.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      total,
      averageGrade: avgGrade[0] ? Math.round(avgGrade[0].average * 100) / 100 : 0,
      byCourse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};
