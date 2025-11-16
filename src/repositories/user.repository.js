import Users from "../models/User.model.js";

class UserRepository {

    static async createUser(name, email, avatar = "", password) {
        const user = await Users.create({
            name,
            email,
            avatar,
            password,
        })
        return user
    }

    static async getAll() {

        const users = await Users.find()
        return users
    }

    static async getById(user_id) {
        const user_found = await Users.findById(user_id)
        return user_found
    }

    static async deleteById(user_id) {
        await Users.findByIdAndDelete(user_id)
        return true
    }

    static async updateById(user_id, new_values) {
        const user_updated = await Users.findByIdAndUpdate(
            user_id,
            new_values,
            {
                new: true
            }
        )

        return user_updated
    }

    static async getByEmail(email) {
        const user = await Users.findOne({ email: email })
        return user
    }
}

export default UserRepository