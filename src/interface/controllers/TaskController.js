const CreateTaskUseCase = require('../../application/use-cases/tasks/CreateTaskUseCase');
const GetTaskUseCase = require('../../application/use-cases/tasks/GetTaskUseCase');
const DeleteTaskUseCase = require('../../application/use-cases/tasks/DeleteTaskUseCase');
const ListTasksUseCase = require('../../application/use-cases/tasks/ListTasksUseCase');
const UpdateTaskUseCase = require('../../application/use-cases/tasks/UpdateTaskUseCase');

class TaskController {
    static async getById(req,res) {
        const { id } = req.params;

        const task = await GetTaskUseCase.execute(req.user, id);

        return res.status(200).json(task);
    }

    static async create(req, res){
        const task = await CreateTaskUseCase.execute(req.user, req.body);

        return res.status(201).json({
            id: task.id
        });
    }

    static async delete(req, res) {
        const { id } = req.params;

        await DeleteTaskUseCase.execute(req.user, id);

        return res.status(204).send();
    }
    static async list(req, res) {
        const result = await ListTasksUseCase.execute(req.user, req.query);

        return res.status(200).json(result);
    }
    static async update(req, res) {
        const { id } = req.params;

        const task = await UpdateTaskUseCase.execute(req.user, id, req.body);

        return res.status(200).json(task);
    }
}

module.exports = TaskController;