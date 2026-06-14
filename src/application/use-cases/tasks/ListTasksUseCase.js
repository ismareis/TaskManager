const TaskRepository = require('../../../infra/database/repositories/TaskRepository');

const TaskStatus = require("../../../domain/enums/TaskStatus");
const TaskPriority = require("../../../domain/enums/TaskPriority");
const ValidationError = require('../../../domain/errors/ValidationError');

class ListTasksUseCase {
    static async execute(authenticatedUser) {
        const tasks = await TaskRepository.findByUserId(authenticatedUser.id);

        return {
            tasks: tasks.map(task => ({
                id: task.id,
                userId: task.userId,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                completionDate: task.completionDate,
                priority: TaskPriority.toPresentation(task.priority),
                status: TaskStatus.toPresentation(task.status)
            }))
        };
    }
}

module.exports = ListTasksUseCase;