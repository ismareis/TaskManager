const TaskStatus = require('../../../../domain/enums/TaskStatus');
const TaskPriority = require('../../../../domain/enums/TaskPriority');

exports.seed = async function(knex) {
    const admin = await knex('users')
        .where({ username: 'admin' })
        .first();

    const user = await knex('users')
        .where({ username: 'user' })
        .first();
    
    await knex('tasks').del();

    await knex('tasks').insert([
        {
            user_id: admin.id,
            title: 'Review system configuration',
            description: 'Review application settings',
            status: TaskStatus.PENDING,
            priority: TaskPriority.HIGH,
            due_date: new Date()
        },
        {
            user_id: user.id,
            title: 'Complete onboarding',
            description: 'Read project documentation',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            due_date: new Date()
        }
    ]);
};