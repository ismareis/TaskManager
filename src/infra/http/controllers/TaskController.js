const CreateTaskUseCase = require('../../../application/use-cases/tasks/CreateTaskUseCase');
const GetTaskUseCase = require('../../../application/use-cases/tasks/GetTaskUseCase');

class TaskController {
    static async getById(req,res) {
        console.log("GET tasks/:id");

        const { id } = req.params;

        const task = await GetTaskUseCase.execute(req.user, id);

        return res.status(200).json(task);
    }

    static async create(req, res){
        console.log("POST /tasks");

        const task = await CreateTaskUseCase.execute(req.user, req.body);

        return res.status(201).json({
            id: task.id
        });
    }
}

module.exports = TaskController;