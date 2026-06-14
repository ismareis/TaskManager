const CreateTaskUseCase = require('../../../application/use-cases/tasks/CreateTaskUseCase');

class TaskController {
    static async create(req, res){
        console.log("POST /tasks");

        const task = await CreateTaskUseCase.execute(req.user, req.body);

        return res.status(201).json({
            id: task.id
        });
    }
}

module.exports = TaskController;