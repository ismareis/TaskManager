const Task = require("../../../domain/entities/Task");

class TaskMapper {
    static toDomain(row) {
        if (!row) return null;

        return new Task({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            dueDate: row.due_date,
            completionDate: row.completion_date,
            disabled: row.disabled
        });
    }

    static toPersistence(task) {
        if (!task) return null;

        return {
            id: task.id,
            user_id: task.userId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.dueDate,
            completion_date: task.completionDate,
            disabled: task.disabled
        };
    }
}

module.exports = TaskMapper;