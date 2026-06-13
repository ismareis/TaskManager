const GetUserUseCase = require('../../../application/use-cases/users/GetUserUseCase')

class UserController {
    static async getById(req,res) {
        console.log("GET users/:id");

        const { id } = req.params;

        const user = await GetUserUseCase.execute(id);

        return res.status(200).json(user);
    }
}

module.exports = UserController;