const TaskRepository = require('../../../infra/database/repositories/TaskRepository');
const UserRepository = require('../../../infra/database/repositories/UserRepository');

const GoogleCalendarService = require('../../../infra/services/GoogleCalendarService');

const AccessLevel = require("../../../domain/enums/AccessLevel");

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');

class DeleteTaskUseCase {
    static async execute(authenticatedUser, id) {
        if (!id) {
            throw new ValidationError(['Invalid task id']);
        }

        const task = await TaskRepository.findById(id);

        if (!task) {
            throw new NotFoundError('Task not found');
        }

        const isOwner = Number(authenticatedUser.id) === Number(task.userId);
        const isAdmin = Number(authenticatedUser.accessLevel) === AccessLevel.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to delete this task');
        }

        task.disabled = true;

        const validation = task.validate();

        if (!validation.isValid) {
            throw new ValidationError(validation.errors);
        }

        const updatedTask = await TaskRepository.update(task);

        if(updatedTask){
            const user = await UserRepository.findById(authenticatedUser.id);
            if(user.isGoogleAuthenticated()){
                try {
                    if(updatedTask.googleEventId){
                        await GoogleCalendarService.deleteEvent(user, updatedTask);
                        await TaskRepository.updateCalendarEventId(updatedTask.id, null);
                    }
                }
                catch(err){
                    if(err.code === 404){
                        await TaskRepository.updateCalendarEventId(updatedTask.id, null);
                    }
                    console.error("Google Calendar Error: ", err.message);
                }
            }
        }
    }
}

module.exports = DeleteTaskUseCase;