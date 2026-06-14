const knex = require('../knex/connection');
const TaskMapper = require('../mappers/TaskMapper');

class TaskRepository {
    async create(task) {
        const data = TaskMapper.toPersistence(task);

        const [row] = await knex('tasks')
            .insert(data)
            .returning('*');

        return TaskMapper.toDomain(row);
    }
}

module.exports = new TaskRepository();