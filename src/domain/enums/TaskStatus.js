class TaskStatus {
    static PENDING = 1;
    static IN_PROGRESS = 2;
    static COMPLETED = 3;

    static All = [
            TaskStatus.PENDING,
            TaskStatus.IN_PROGRESS,
            TaskStatus.COMPLETED
        ];

    static isValid(value) {
        return this.All.includes(value);
    }
}

module.exports = TaskStatus;