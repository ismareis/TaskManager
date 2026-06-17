const GoogleCalendarService = require('../../infra/services/GoogleCalendarService');
const SaveGoogleTokensUseCase = require('../../application/use-cases/google/SaveGoogleTokensUseCase');
const ClearGoogleTokensUseCase = require('../../application/use-cases/google/ClearGoogleTokensUseCase');

class GoogleAuthController {
    static redirect(req, res) {
        const url = GoogleCalendarService.getAuthUrl(req.user.id);
        res.status(200).json({
            message: "Access the URL to log into your google account",
            url: url
        });
    }

    static async callback(req, res) {
        const { code, state } = req.query;
        const userId = GoogleCalendarService.verifyState(state);

        const tokens = await GoogleCalendarService.exchangeCodeForTokens(code);
        await SaveGoogleTokensUseCase.execute({ userId, tokens });

        res.status(200).send('<h1>Google Calendar connected!</h1><p>You can close this tab.</p>');
    }

    static async logout(req, res){
        await ClearGoogleTokensUseCase.execute(req.user.id);

        return res.status(200).json({
            message: "Logged out successfully"
        });
    }
}

module.exports = GoogleAuthController;