const loginUseCase = require("../../../application/use-cases/auth/LoginUseCase");

class AuthController {
    static async login(req, res) {
        console.log("/auth/login");
        try {
            const { username, password } = req.body;

            const token = await loginUseCase.execute(
                username,
                password
            );

            return res.status(200).json({ token });
        }
        catch (error) {
            return res.status(401).json({
                message: error.message
            });
        }
    }
}

module.exports = AuthController;