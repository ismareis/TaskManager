const { google } = require('googleapis');

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env')
});

const UserRepository = require('../database/repositories/UserRepository');
const JwtService = require('../services/JwtService');

class GoogleCalendarService {

    static validateGoogleConfig(){
        const errors = [];
        if(!process.env.GOOGLE_CLIENT_ID)
            errors.push("Google Client Id not configured");

        if(!process.env.GOOGLE_CLIENT_SECRET)
            errors.push("Google Client Secret not configured");

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    static buildOAuthClient() {
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `http://localhost:${process.env.PORT}/auth/google/callback`
        );
    }

    static getAuthUrl(userId){
        const oauth2Client = GoogleCalendarService.buildOAuthClient();
        const state = JwtService.generateGoogleAuthToken(userId);
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar.events'],
            prompt: 'consent',
            state,
        });
    }

    static verifyState(state) {
        const { userId } = JwtService.verifyToken(state);
        return userId;
    }

    static async exchangeCodeForTokens(code) {
        const oauth2Client = GoogleCalendarService.buildOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    }

    static async getValidClient(user) {
        const oauth2Client = GoogleCalendarService.buildOAuthClient();

        const isExpired = new Date() >= new Date(user.googleTokenExpiry);

        if (isExpired) {
        oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

        const { credentials } = await oauth2Client.refreshAccessToken();

        await UserRepository.updateGoogleTokens(user.id, {
            googleAccessToken: credentials.access_token,
            googleTokenExpiry: new Date(credentials.expiry_date),
        });

        oauth2Client.setCredentials(credentials);
        } else {
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });
        }

        return oauth2Client;
    }

}

module.exports = GoogleCalendarService;