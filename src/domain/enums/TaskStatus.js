class TaskStatus {
    static PENDING = 1;
    static IN_PROGRESS = 2;
    static COMPLETED = 3;

    static All = [
            TaskStatus.PENDING,
            TaskStatus.IN_PROGRESS,
            TaskStatus.COMPLETED
        ];
    
    static Names = {
        [TaskStatus.PENDING]: 'Pending',
        [TaskStatus.IN_PROGRESS]: 'In Progress',
        [TaskStatus.COMPLETED]: 'Completed'
    };

    static isValid(value) {
        return this.All.includes(value);
    }

    static toString(value) {
        return TaskStatus.Names[value] ?? 'UNKNOWN';
    }

    static toPresentation(value){
        return `${value} (${TaskStatus.toString(value)})`;
    }
}

module.exports = TaskStatus;