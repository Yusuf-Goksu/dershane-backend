const Parent = require('../models/Parent');
const Student = require('../models/Student');
const AppError = require('../utils/AppError');

class ParentService {

  // ⭐ Admin veliye öğrenci ekler
  async addStudentToParent(parentUserId, studentUserId) {
    const parent = await Parent.findOne({ user: parentUserId });
    if (!parent) {
      throw new AppError("Veli bulunamadı", 404);
    }

    const student = await Student.findOne({ user: studentUserId });
    if (!student) {
      throw new AppError("Öğrenci bulunamadı", 404);
    }

    // Duplicate kontrol
    const alreadyExists = parent.students.some(
      id => id.toString() === student._id.toString()
    );

    if (!alreadyExists) {
      parent.students.push(student._id);
      await parent.save();
    }

    return { message: "Öğrenci veliye başarıyla eklendi", parent };
  }

  // ⭐ Veli kendi öğrencilerini görür
  async getMyStudents(userId, role) {
    if (role !== "parent") {
      throw new AppError("Bu işlem sadece veliler içindir", 403);
    }

    const parent = await Parent.findOne({ user: userId }).populate({
      path: "students",
      populate: { path: "user", select: "-password" }
    });

    if (!parent) {
      throw new AppError("Veli bulunamadı", 404);
    }

    return parent.students;
  }
}

module.exports = new ParentService();
