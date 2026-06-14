class TaskPriority {
    static LOW = 1;
    static MEDIUM = 2;
    static HIGH = 3;

    static All = [
            TaskPriority.LOW,
            TaskPriority.MEDIUM,
            TaskPriority.HIGH
        ];

    static Names = {
        [TaskPriority.LOW]: 'Low',
        [TaskPriority.MEDIUM]: 'Medium',
        [TaskPriority.HIGH]: 'High'
    };

    static isValid(value) {
        return this.All.includes(value);
    }

    static toString(value) {
        return TaskPriority.Names[value] ?? 'UNKNOWN';
    }

    static toPresentation(value){
        return `${value} (${TaskPriority.toString(value)})`;
    }
}

module.exports = TaskPriority;