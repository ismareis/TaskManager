const TaskStatus = require("../enums/TaskStatus");
const TaskPriority = require("../enums/TaskPriority");

class Task {
    static TITLE_MAX_LENGTH = 100;
    static DESCRIPTION_MAX_LENGTH = 1000;

    constructor({
        id,
        userId,
        title,
        description,
        status,
        priority,
        dueDate,
        completionDate = null,
        disabled = false,
        user = null
    }) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completionDate = completionDate;
        this.disabled = disabled;
        this.user = user;
    }

    validateRequiredMaxLength(value, fieldName, maxLength, errors) {
        if (!value || value.trim().length === 0) {
            errors.push(`${fieldName} is required`);
            return;
        }

        if (value.length > maxLength) {
            errors.push(`${fieldName} must have at most ${maxLength} characters`);
        }
    }

    validateRequiredDate(value, fieldName, errors) {
        if (!value) {
            errors.push(`${fieldName} is required`);
            return;
        }

        const date = new Date(value);

        if (!(date instanceof Date) || isNaN(date.getTime())) {
            errors.push(`${fieldName} must be a valid date`);
        }
    }

    validateOptionalDate(value, fieldName, errors) {
        if (!value) {
            return;
        }

        const date = new Date(value);

        if (!(date instanceof Date) || isNaN(date.getTime())) {
            errors.push(`${fieldName} must be a valid date`);
        }
    }

    validate() {
        const errors = [];

        this.validateRequiredMaxLength(this.title, 'Title', Task.TITLE_MAX_LENGTH, errors);
        this.validateRequiredDate(this.dueDate, 'Due Date', errors);

        if (this.description) {
            this.validateRequiredMaxLength(this.description, 'Description', Task.DESCRIPTION_MAX_LENGTH, errors);
        }

        this.validateOptionalDate(this.completionDate, 'Completion Date', errors);

        if (!Number.isInteger(this.userId) || this.userId <= 0) {
            errors.push('Invalid User Id');
        }

        if (!TaskStatus.isValid(this.status)) {
            errors.push('Invalid status');
        }

        if (!TaskPriority.isValid(this.priority)) {
            errors.push('Invalid priority');
        }

        if (typeof this.disabled !== 'boolean') {
            errors.push('Disabled must be a boolean');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static parseDate(value) {
        if (value === undefined || value === null) {
            return null;
        }

        return new Date(value);
    }
}

module.exports = Task;