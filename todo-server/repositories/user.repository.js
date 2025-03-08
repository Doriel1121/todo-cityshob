import User from "../models/User.js";

class UserRepository {
  async findOne(username) {
    return User.findOne({ username: username });
  }
  async save(user) {
    const newUser = new User(user);
    return newUser.save();
  }
}
export default UserRepository;
