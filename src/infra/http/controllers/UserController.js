const CreateUserUseCase = require('../../../application/use-cases/users/CreateUserUseCase');
const GetUserUseCase = require('../../../application/use-cases/users/GetUserUseCase');
const UpdateUserUseCase = require('../../../application/use-cases/users/UpdateUserUseCase');

class UserController {
    static async create(req, res) {
        console.log("POST /users");

        const user = await CreateUserUseCase.execute(req.body);

        return res.status(201).json({
            id: user.id
        });
    }
}

module.exports = UserController;