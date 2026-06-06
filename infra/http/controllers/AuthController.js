const loginUseCase = require("../../../application/use-cases/auth/LoginUseCase");
const logoutUseCase = require("../../../application/use-cases/auth/LogoutUseCase");

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

    static async logout(req, res){
        console.log("/auth/logout");
        try {
            const userId = req.user.id;

            const token = await logoutUseCase.execute(
                userId
            );

            return res.status(200).json({
                message: "Logged out successfully"
             });
        }
        catch (error) {
            return res.status(401).json({
                message: error.message
            });
        }
    }
}

module.exports = AuthController;