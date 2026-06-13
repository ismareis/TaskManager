const GetUserUseCase = require('../../../application/use-cases/users/GetUserUseCase')
const UpdateUserUseCase = require('../../../application/use-cases/users/UpdateUserUseCase');
const CreateUserUseCase = require('../../../application/use-cases/users/CreateUserUseCase')

class UserController {
    static async getById(req,res) {
        console.log("GET users/:id");

        const { id } = req.params;

        const user = await GetUserUseCase.execute(id);

        return res.status(200).json(user);
    }

    static async update(req, res) {
        console.log("PUT /users/:id");

        const { id } = req.params;

        const user = await UpdateUserUseCase.execute(req.user, id, req.body);

        return res.status(200).json(user);
    }

    static async create(req, res) {
        console.log("POST /users");

        const user = await CreateUserUseCase.execute(req.body);

        return res.status(201).json({
            id: user.id
        });
    }
}

module.exports = UserController;