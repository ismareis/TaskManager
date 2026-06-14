const GoogleCalendarService = require('@src/infra/services/GoogleCalendarService');
const JwtService = require('@src/infra/services/JwtService');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const { google } = require('googleapis');

jest.mock('googleapis', () => {
    const OAuth2 = jest.fn();

    return {
        google: {
            auth: {
                OAuth2
            },
            calendar: jest.fn()
        }
    };
});

describe('GoogleCalendarService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        process.env.GOOGLE_CLIENT_ID = 'client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
        process.env.PORT = '3000';
    });

    describe('validateGoogleConfig', () => {
        it('should return valid when google config exists', () => {
            const result = GoogleCalendarService.validateGoogleConfig();

            expect(result).toEqual({
                isValid: true,
                errors: []
            });
        });

        it('should return errors when google config is missing', () => {
            delete process.env.GOOGLE_CLIENT_ID;
            delete process.env.GOOGLE_CLIENT_SECRET;

            const result = GoogleCalendarService.validateGoogleConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Google Client Id not configured'
            );
            expect(result.errors).toContain(
                'Google Client Secret not configured'
            );
        });
    });

    describe('buildOAuthClient', () => {
        it('should create oauth client', () => {
            GoogleCalendarService.buildOAuthClient();

            expect(google.auth.OAuth2).toHaveBeenCalledWith(
                'client-id',
                'client-secret',
                'http://localhost:3000/auth/google/callback'
            );
        });
    });

    describe('getAuthUrl', () => {
        it('should generate auth url', () => {
            const generateAuthUrl = jest.fn().mockReturnValue('auth-url');

            GoogleCalendarService.buildOAuthClient = jest.fn()
                .mockReturnValue({
                    generateAuthUrl
                });

            JwtService.generateGoogleAuthToken = jest.fn()
                .mockReturnValue('state-token');

            const result = GoogleCalendarService.getAuthUrl(1);

            expect(result).toBe('auth-url');

            expect(
                JwtService.generateGoogleAuthToken
            ).toHaveBeenCalledWith(1);

            expect(generateAuthUrl).toHaveBeenCalledWith({
                access_type: 'offline',
                scope: [
                    'https://www.googleapis.com/auth/calendar.events'
                ],
                prompt: 'consent',
                state: 'state-token'
            });
        });
    });

    describe('verifyState', () => {
        it('should return user id from state token', () => {
            JwtService.verifyToken = jest.fn()
                .mockReturnValue({
                    userId: 55
                });

            const result = GoogleCalendarService.verifyState(
                'token'
            );

            expect(result).toBe(55);
        });
    });

    describe('exchangeCodeForTokens', () => {
        it('should exchange authorization code for tokens', async () => {
            const getToken = jest.fn().mockResolvedValue({
                tokens: {
                    access_token: 'access-token'
                }
            });

            GoogleCalendarService.buildOAuthClient = jest.fn()
                .mockReturnValue({
                    getToken
                });

            const result =
                await GoogleCalendarService.exchangeCodeForTokens(
                    'code'
                );

            expect(getToken).toHaveBeenCalledWith('code');

            expect(result).toEqual({
                access_token: 'access-token'
            });
        });
    });

    describe('getValidClient', () => {
        it('should use existing credentials when token is not expired', async () => {
            const setCredentials = jest.fn();

            const oauthClient = {
                setCredentials
            };

            GoogleCalendarService.buildOAuthClient = jest.fn()
                .mockReturnValue(oauthClient);

            const user = {
                googleAccessToken: 'access',
                googleRefreshToken: 'refresh',
                googleTokenExpiry: new Date(
                    Date.now() + 60_000
                )
            };

            const result =
                await GoogleCalendarService.getValidClient(
                    user
                );

            expect(setCredentials).toHaveBeenCalledWith({
                access_token: 'access',
                refresh_token: 'refresh'
            });

            expect(result).toBe(oauthClient);
        });

        it('should refresh token when expired', async () => {
            const setCredentials = jest.fn();

            const refreshAccessToken = jest.fn()
                .mockResolvedValue({
                    credentials: {
                        access_token: 'new-token',
                        expiry_date: Date.now() + 3600000
                    }
                });

            const oauthClient = {
                setCredentials,
                refreshAccessToken
            };

            GoogleCalendarService.buildOAuthClient = jest.fn()
                .mockReturnValue(oauthClient);

            UserRepository.updateGoogleTokens =
                jest.fn().mockResolvedValue();

            const user = {
                id: 1,
                googleRefreshToken: 'refresh',
                googleTokenExpiry: new Date(
                    Date.now() - 60_000
                )
            };

            await GoogleCalendarService.getValidClient(
                user
            );

            expect(refreshAccessToken)
                .toHaveBeenCalled();

            expect(
                UserRepository.updateGoogleTokens
            ).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    googleAccessToken: 'new-token'
                })
            );
        });
    });

    describe('TaskToEvent', () => {
        it('should convert task to google event', () => {
            const dueDate = new Date(
                '2026-01-01T10:00:00.000Z'
            );

            const task = {
                id: 1,
                title: 'Study',
                description: 'Node.js',
                priority: TaskPriority.HIGH,
                status: TaskStatus.PENDING,
                dueDate
            };

            const result =
                GoogleCalendarService.TaskToEvent(task);

            expect(result.summary).toBe('Study');

            expect(
                result.extendedProperties.private.taskId
            ).toBe('1');

            expect(
                result.start.dateTime
            ).toBe(dueDate.toISOString());

            expect(
                result.end.dateTime
            ).toBe(dueDate.toISOString());
        });

        it('should use completion date when provided', () => {
            const dueDate = new Date(
                '2026-01-01T10:00:00.000Z'
            );

            const completionDate = new Date(
                '2026-01-02T10:00:00.000Z'
            );

            const task = {
                id: 1,
                title: 'Study',
                priority: TaskPriority.HIGH,
                status: TaskStatus.DONE,
                dueDate,
                completionDate
            };

            const result =
                GoogleCalendarService.TaskToEvent(task);

            expect(
                result.end.dateTime
            ).toBe(completionDate.toISOString());
        });
    });

    describe('createEvent', () => {
        it('should create calendar event', async () => {
            const insert = jest.fn().mockResolvedValue({
                data: {
                    id: 'google-event-id'
                }
            });

            GoogleCalendarService.GetValidCalendar =
                jest.fn().mockResolvedValue({
                    events: { insert }
                });

            GoogleCalendarService.TaskToEvent =
                jest.fn().mockReturnValue({
                    summary: 'Task'
                });

            const result =
                await GoogleCalendarService.createEvent(
                    {},
                    {}
                );

            expect(result).toBe('google-event-id');
        });
    });

    describe('updateEvent', () => {
        it('should update calendar event', async () => {
            const update = jest.fn().mockResolvedValue({
                data: {
                    id: 'updated-event-id'
                }
            });

            GoogleCalendarService.GetValidCalendar =
                jest.fn().mockResolvedValue({
                    events: { update }
                });

            GoogleCalendarService.TaskToEvent =
                jest.fn().mockReturnValue({
                    summary: 'Task'
                });

            const result =
                await GoogleCalendarService.updateEvent(
                    {},
                    {
                        googleEventId: 'event-id'
                    }
                );

            expect(result).toBe('updated-event-id');
        });
    });

    describe('deleteEvent', () => {
        it('should delete calendar event', async () => {
            const deleteFn = jest.fn()
                .mockResolvedValue();

            GoogleCalendarService.GetValidCalendar =
                jest.fn().mockResolvedValue({
                    events: {
                        delete: deleteFn
                    }
                });

            await GoogleCalendarService.deleteEvent(
                {},
                {
                    googleEventId: 'event-id'
                }
            );

            expect(deleteFn).toHaveBeenCalledWith({
                calendarId: 'primary',
                eventId: 'event-id'
            });
        });
    });
});