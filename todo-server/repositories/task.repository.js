import Task from "../models/Task.js";

class TaskRepository {
  async findByUserId(userId) {
    return Task.find({ userId });
  }

  async findById(id) {
    return Task.findById(id);
  }

  async create(task) {
    const newTask = new Task(task);
    return newTask.save();
  }

  async update(id, task) {
    return Task.findByIdAndUpdate(id, task, { new: true });
  }

  async delete(id) {
    return Task.findByIdAndDelete(id);
  }
}

export default TaskRepository;
