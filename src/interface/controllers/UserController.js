const GetUserUseCase = require('../../application/use-cases/users/GetUserUseCase')
const UpdateUserUseCase = require('../../application/use-cases/users/UpdateUserUseCase');
const DeleteUserUseCase = require('../../application/use-cases/users/DeleteUserUseCase');
const CreateUserUseCase = require('../../application/use-cases/users/CreateUserUseCase')

class UserController {
    static async getById(req,res) {
        const { id } = req.params;

        const user = await GetUserUseCase.execute(id);

        return res.status(200).json(user);
    }

    static async update(req, res) {
        const { id } = req.params;

        const user = await UpdateUserUseCase.execute(req.user, id, req.body);

        return res.status(200).json(user);
    }

    static async delete(req, res) {
        const { id } = req.params;
        
        await DeleteUserUseCase.execute(req.user, id);

        return res.status(204).send();
    }

    static async create(req, res) {
        const user = await CreateUserUseCase.execute(req.body);

        return res.status(201).json({
            id: user.id
        });
    }
}

module.exports = UserController;