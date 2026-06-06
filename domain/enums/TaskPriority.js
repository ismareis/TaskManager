class TaskPriority {
    static LOW = 1;
    static MEDIUM = 2;
    static HIGH = 3;

    static All = [
            TaskPriority.LOW,
            TaskPriority.MEDIUM,
            TaskPriority.HIGH
        ];

    static isValid(value) {
        return this.All.includes(value);
    }
}

module.exports = TaskPriority;