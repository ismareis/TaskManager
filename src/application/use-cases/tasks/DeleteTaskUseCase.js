const TaskRepository = require('../../../infra/database/repositories/TaskRepository');

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

        await TaskRepository.update(task);
    }
}

module.exports = DeleteTaskUseCase;