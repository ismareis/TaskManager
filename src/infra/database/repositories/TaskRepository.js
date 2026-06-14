const knex = require('../knex/connection');
const TaskMapper = require('../mappers/TaskMapper');

class TaskRepository {
    async findById(id){
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

    async updateCalendarEventId(taskId, googleEventId) {
        await await knex('tasks').where({ id: taskId }).update({ google_event_id: googleEventId });
    }
}

module.exports = new TaskRepository();