import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Task from "./models/Task.js";
import RepositoryFactory from "./factories/repository.factory.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);
const userRepository = RepositoryFactory.createRepository("User");
const JWT_SECRET = process.env.JWT_SECRET;

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    const savedUser = await userRepository.save(user);
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await userRepository.findOne(req.body.username);
    if (!user) {
      return res.status(400).send("Cannot find user");
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ token, username: user.username });
    } else {
      res.send("Not Allowed");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const authenticateToken = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token == null) return next(new Error("No token"));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error("Invalid token"));
    socket.userId = user.userId;
    next();
  });
};
io.use(authenticateToken);

io.on("connection", async (socket) => {
  console.log("User connected", socket.userId);
  const taskRepository = RepositoryFactory.createRepository("Task");

  socket.on("getTasks", async () => {
    try {
      const tasks = await taskRepository.findByUserId(socket.userId);
      socket.emit("updateTasks", tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
    }
  });

  socket.on("addTask", async (task) => {
    try {
      const newTask = new Task({ ...task.task, userId: socket.userId });
      await taskRepository.create(newTask);
      const tasks = await taskRepository.findByUserId(socket.userId);
      io.emit("updateTasks", tasks);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  });

  socket.on("removeTask", async (id) => {
    try {
      await taskRepository.delete(id);
      const tasks = await taskRepository.findByUserId(socket.userId);
      io.to(socket.id).emit("updateTasks", tasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  });

  socket.on("toggleComplete", async (id) => {
    try {
      const task = await taskRepository.findById(id);
      if (task) {
        task.completed = !task.completed;
        await taskRepository.update(id, task);
        const tasks = await taskRepository.findByUserId(socket.userId);
        io.to(socket.id).emit("updateTasks", tasks);
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  });

  socket.on("editTask", async (id) => {
    try {
      const task = await taskRepository.findById(id);
      if (task) {
        task.isEditing = true;
        await taskRepository.update(id, task);
        const tasks = await taskRepository.findByUserId(socket.userId);
        io.to(socket.id).emit("updateTasks", tasks);
      }
    } catch (error) {
      console.error("Error editing task:", error);
    }
  });

  socket.on("releaseTask", async (id) => {
    try {
      const task = await taskRepository.findById(id);
      if (task) {
        task.isEditing = false;
        await taskRepository.update(id, task);
        const tasks = await taskRepository.findByUserId(socket.userId);
        io.to(socket.id).emit("updateTasks", tasks);
      }
    } catch (error) {
      console.error("Error releasing task:", error);
    }
  });

  socket.on("updateTask", async (taskData) => {
    try {
      const task = await taskRepository.update(taskData._id, taskData);
      if (task) {
        const tasks = await taskRepository.findByUserId(socket.userId);
        io.emit("updateTasks", tasks);
      } else {
        socket.emit("taskUpdateError", {
          message: "Task not found for update",
        });
        console.error("Task not found for update");
      }
    } catch (error) {
      socket.emit("taskUpdateError", {
        message: error.message || "Error updating task",
      });
      console.error("Error updating task:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.userId);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
