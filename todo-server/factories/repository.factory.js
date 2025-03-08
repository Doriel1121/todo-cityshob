import TaskRepository from "../repositories/task.repository.js";
import UserRepository from "../repositories/user.repository.js";

class RepositoryFactory {
  static createRepository(modelName) {
    switch (modelName) {
      case "Task":
        return new TaskRepository();
      case "User":
        return new UserRepository();
      default:
        throw new Error(`Repository for ${modelName} not found`);
    }
  }
}

export default RepositoryFactory;
