const Task = require('../../../domain/entities/Task');
const TaskRepository = require('../../../infra/database/repositories/TaskRepository');

const TaskStatus = require("../../../domain/enums/TaskStatus");
const AccessLevel = require("../../../domain/enums/AccessLevel");
const TaskPriority = require("../../../domain/enums/TaskPriority");
const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');

class GetTaskUseCase {
    static async execute(authenticatedUser, id) {
        if (!id) {
            throw new ValidationError('Invalid task id');
        }

        const task = await TaskRepository.findById(id);

        if (!task) {
            throw new NotFoundError('Task not found');
        }

        const isOwner = authenticatedUser.id === task.userId;
        const isAdmin = authenticatedUser.accessLevel === AccessLevel.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to get this task');
        }

        return {
            id: task.id,
            userId: task.userId,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            completionDate: task.completionDate,
            priority: TaskPriority.toPresentation(task.priority),
            status: TaskStatus.toPresentation(task.status),
            disabled: task.disabled
        };
    }
}

module.exports = GetTaskUseCase;