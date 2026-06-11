const loginUseCase = require("../../../application/use-cases/auth/LoginUseCase");
const logoutUseCase = require("../../../application/use-cases/auth/LogoutUseCase");

class AuthController {
    static async login(req, res) {
        console.log("/auth/login");
        const { username, password } = req.body;

        const token = await loginUseCase.execute(
            username,
            password
        );

        return res.status(200).json({ token });
    }

    static async logout(req, res){
        console.log("/auth/logout");

        const userId = req.user.id;

        const token = await logoutUseCase.execute(
            userId
        );

        return res.status(200).json({
            message: "Logged out successfully"
        });
    }
}

module.exports = AuthController;