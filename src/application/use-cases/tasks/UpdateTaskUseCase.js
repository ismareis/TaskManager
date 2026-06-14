const Task = require('../../../domain/entities/Task');
const TaskRepository = require('../../../infra/database/repositories/TaskRepository');

const TaskStatus = require("../../../domain/enums/TaskStatus");
const AccessLevel = require("../../../domain/enums/AccessLevel");
const TaskPriority = require("../../../domain/enums/TaskPriority");

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');

class UpdateTaskUseCase {
    static async execute(authenticatedUser, id, data) {
        if (!id) {
            throw new ValidationError(['Invalid task id']);
        }

        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError(['Request body is required']);
        }

        const task = await TaskRepository.findById(id);

        if (!task) {
            throw new NotFoundError('Task not found');
        }

        const isOwner = authenticatedUser.id === task.userId;
        const isAdmin = authenticatedUser.accessLevel === AccessLevel.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to update this task');
        }

        if (data.title !== undefined) {
            task.title = data.title;
        }

        if (data.description !== undefined) {
            task.description = data.description;
        }

        if (data.dueDate !== undefined) {
            task.dueDate = Task.parseDate(data.dueDate);
        }
        
        if (data.status !== undefined) {
            task.status = data.status;
        }

        if (data.completionDate !== undefined) {
            task.completionDate = Task.parseDate(data.completionDate);
            
            if (task.completionDate) {
                task.status = TaskStatus.COMPLETED;
            }
        }

        if (data.priority !== undefined) {
            task.priority = data.priority;
        }


        const validation = task.validate();

        if (!validation.isValid) {
            throw new ValidationError(validation.errors);
        }

        const updatedTask = await TaskRepository.update(task);

        return {
            id: updatedTask.id,
            userId: updatedTask.userId,
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: updatedTask.dueDate,
            completionDate: updatedTask.completionDate,
            priority: TaskPriority.toPresentation(updatedTask.priority),
            status: TaskStatus.toPresentation(updatedTask.status)
        };
    }
}

module.exports = UpdateTaskUseCase;