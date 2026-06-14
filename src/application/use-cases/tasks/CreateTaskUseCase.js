const Task = require('../../../domain/entities/Task');
const TaskRepository = require('../../../infra/database/repositories/TaskRepository');
const UserRepository = require('../../../infra/database/repositories/UserRepository');

const TaskStatus = require("../../../domain/enums/TaskStatus");
const TaskPriority = require("../../../domain/enums/TaskPriority");
const ValidationError = require('../../../domain/errors/ValidationError');


class CreateTaskUseCase {
    static async execute(authenticatedUser, data){
        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError('Request body is required');
        }

        const user = UserRepository.findById(authenticatedUser.id);
        if(!user){
            throw new ValidationError('Invalid User');
        }

        const task = new Task({
            userId: authenticatedUser.id,
            title: data.title,
            description: data.description,
            status: data.status || TaskStatus.PENDING,
            priority: data.priority || TaskPriority.LOW,
            dueDate: Task.parseDate(data.dueDate),
            completionDate: Task.parseDate(data.completionDate),
        });

        if (data.completionDate !== undefined){
            task.status = TaskStatus.COMPLETED;
        }

        const validation = task.validate();

        if(!validation.isValid){
            throw new ValidationError(validation.errors);
        }
        const createdTask = TaskRepository.create(task);

        return createdTask;
    }
}

module.exports = CreateTaskUseCase;