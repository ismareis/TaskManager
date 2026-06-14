const knex = require('../knex/connection');
const TaskMapper = require('../mappers/TaskMapper');

class TaskRepository {
    async findById(id) {
        const row = await knex('tasks')
            .where({
                id,
                disabled: false
            })
            .first();

        return TaskMapper.toDomain(row);
    }

    async create(task) {
        const data = TaskMapper.toPersistence(task);

        const [row] = await knex('tasks')
            .insert(data)
            .returning('*');

        return TaskMapper.toDomain(row);
    }

    async findByUserId(userId, filters = {}) {
        const query = knex('tasks')
            .where({
                user_id: userId,
                disabled: false
            });

        if (filters.status !== undefined) {
            query.andWhere('status', filters.status);
        }

        if (filters.priority !== undefined) {
            query.andWhere('priority', filters.priority);
        }

        if (filters.dueBefore !== undefined) {
            query.andWhere('due_date', '<=', filters.dueBefore);
        }

        if (filters.dueAfter !== undefined) {
            query.andWhere('due_date', '>=', filters.dueAfter);
        }

        if (filters.completed !== undefined) {
            if (filters.completed) {
                query.whereNotNull('completion_date');
            } else {
                query.whereNull('completion_date');
            }
        }

        if (filters.title !== undefined) {
            query.andWhere('title', 'ilike', `%${filters.title}%`);
        }

        const sortBy = filters.sortBy || 'due_date';
        const order = filters.order || 'asc';

        const rows = await query.orderBy(sortBy, order);

        return rows.map(TaskMapper.toDomain);
    }
    
    async update(task) {
        const data = TaskMapper.toPersistence(task);

        const [row] = await knex('tasks')
            .where({ id: task.id })
            .update(data)
            .returning('*');

        return TaskMapper.toDomain(row);
    }

    async updateCalendarEventId(taskId, googleEventId) {
        await await knex('tasks').where({ id: taskId }).update({ google_event_id: googleEventId });
    }
}

module.exports = new TaskRepository();