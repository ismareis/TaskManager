const TaskRepository = require('../../../infra/database/repositories/TaskRepository');

const TaskStatus = require("../../../domain/enums/TaskStatus");
const TaskPriority = require("../../../domain/enums/TaskPriority");

const ValidationError = require('../../../domain/errors/ValidationError');

class ListTasksUseCase {
    static parseStatus(value) {
        if (value === undefined) return undefined;

        const normalizedValue = String(value).trim().toLowerCase();

        const numericValue = Number(normalizedValue);

        if (Number.isInteger(numericValue) && TaskStatus.isValid(numericValue)) {
            return numericValue;
        }

        const statusMap = {
            pending: TaskStatus.PENDING,
            in_progress: TaskStatus.IN_PROGRESS,
            completed: TaskStatus.COMPLETED
        };

        return statusMap[normalizedValue] ?? null;
    }

    static parsePriority(value) {
        if (value === undefined) return undefined;

        const normalizedValue = String(value).trim().toLowerCase();

        const numericValue = Number(normalizedValue);

        if (Number.isInteger(numericValue) && TaskPriority.isValid(numericValue)) {
            return numericValue;
        }

        const priorityMap = {
            low: TaskPriority.LOW,
            medium: TaskPriority.MEDIUM,
            high: TaskPriority.HIGH
        };

        return priorityMap[normalizedValue] ?? null;
    }

    static parseBoolean(value, fieldName) {
        if (value === undefined) return undefined;

        const normalizedValue = String(value).trim().toLowerCase();

        if (['true', '1', 'yes'].includes(normalizedValue)) {
            return true;
        }

        if (['false', '0', 'no'].includes(normalizedValue)) {
            return false;
        }

        throw new ValidationError([`${fieldName} must be true or false`]);
    }

    static parseDate(value, fieldName, endOfDay = false) {
        if (value === undefined) return undefined;

        const valueAsString = String(value);
        const date = new Date(valueAsString);

        if (isNaN(date.getTime())) {
            throw new ValidationError([`${fieldName} must be a valid date`]);
        }

        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(valueAsString);

        if (isDateOnly && endOfDay) {
            date.setHours(23, 59, 59, 999);
        }

        if (isDateOnly && !endOfDay) {
            date.setHours(0, 0, 0, 0);
        }

        return date;
    }

    static parseSortBy(value) {
        if (value === undefined) return undefined;

        const normalizedValue = String(value).trim();

        const sortMap = {
            id: 'id',
            title: 'title',
            status: 'status',
            priority: 'priority',
            dueDate: 'due_date',
            completionDate: 'completion_date'
        };

        return sortMap[normalizedValue] ?? null;
    }

    static parseOrder(value) {
        if (value === undefined) return undefined;

        const normalizedValue = String(value).trim().toLowerCase();

        if (!['asc', 'desc'].includes(normalizedValue)) {
            return null;
        }

        return normalizedValue;
    }

    static async execute(authenticatedUser, queryParams = {}) {
        const userId = Number(authenticatedUser.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new ValidationError(['Invalid user id']);
        }

        const filters = {};

        if (queryParams.status !== undefined) {
            const status = this.parseStatus(queryParams.status);

            if (status === null) {
                throw new ValidationError(['Invalid status filter']);
            }

            filters.status = status;
        }

        if (queryParams.priority !== undefined) {
            const priority = this.parsePriority(queryParams.priority);

            if (priority === null) {
                throw new ValidationError(['Invalid priority filter']);
            }

            filters.priority = priority;
        }

        if (queryParams.dueBefore !== undefined) {
            filters.dueBefore = this.parseDate(queryParams.dueBefore, 'dueBefore', true);
        }

        if (queryParams.dueAfter !== undefined) {
            filters.dueAfter = this.parseDate(queryParams.dueAfter, 'dueAfter');
        }

        if (queryParams.completed !== undefined) {
            filters.completed = this.parseBoolean(queryParams.completed, 'completed');
        }

        if (queryParams.title !== undefined) {
            const title = String(queryParams.title).trim();

            if (title.length > 0) {
                filters.title = title;
            }
        }

        if (queryParams.sortBy !== undefined) {
            const sortBy = this.parseSortBy(queryParams.sortBy);

            if (sortBy === null) {
                throw new ValidationError(['Invalid sortBy filter']);
            }

            filters.sortBy = sortBy;
        }

        if (queryParams.order !== undefined) {
            const order = this.parseOrder(queryParams.order);

            if (order === null) {
                throw new ValidationError(['Invalid order filter']);
            }

            filters.order = order;
        }

        const tasks = await TaskRepository.findByUserId(userId, filters);

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