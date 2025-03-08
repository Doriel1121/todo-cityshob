import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: String,
  completed: Boolean,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  dueDate: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isEditing: { type: Boolean, default: false },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
