class AccessLevel {
    static USER = 1;
    static ADMIN = 2;

    static All = [
            AccessLevel.USER,
            AccessLevel.ADMIN
        ];

    static Names = {
        [AccessLevel.USER]: 'User',
        [AccessLevel.ADMIN]: 'Admin'
    };

    static isValid(value) {
        return AccessLevel.All.includes(value);
    }

    static toString(value) {
        return AccessLevel.Names[value] ?? 'UNKNOWN';
    }

    static toPresentation(value){
        return `${value} (${AccessLevel.toString(value)})`;
    }
}

module.exports = AccessLevel;