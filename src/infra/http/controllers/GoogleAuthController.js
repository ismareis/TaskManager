const GoogleCalendarService = require('../../services/GoogleCalendarService');
const SaveGoogleTokensUseCase = require('../../../application/use-cases/google/SaveGoogleTokensUseCase');
const ClearGoogleTokensUseCase = require('../../../application/use-cases/google/ClearGoogleTokensUseCase');

class GoogleAuthController {
    static redirect(req, res) {
        console.log("/auth/google/login");
        const url = GoogleCalendarService.getAuthUrl(req.user.id);
        res.json({
            message: "Access the URL to log into your google account",
            url: url
        });
    }

    static async callback(req, res) {
        console.log("/auth/google/callback");
        const { code, state } = req.query;
        const userId = GoogleCalendarService.verifyState(state);

        const tokens = await GoogleCalendarService.exchangeCodeForTokens(code);
        await SaveGoogleTokensUseCase.execute({ userId, tokens });

        res.send('<h1>Google Calendar coneected!</h1><p>You can close this tab.</p>');
    }

    static async logout(req, res){
        console.log("/auth/google/logout");
        await ClearGoogleTokensUseCase.execute(req.user.id);

        return res.status(200).json({
            message: "Logged out successfully"
        });
    }
}

module.exports = GoogleAuthController;