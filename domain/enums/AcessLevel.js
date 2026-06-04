class AccessLevel {
    static USER = 1;
    static MANAGER = 2;
    static ADMIN = 3;

    static isValid(value) {
        return [
            AccessLevel.USER,
            AccessLevel.MANAGER,
            AccessLevel.ADMIN
        ].includes(value);
    }
}

module.exports = AccessLevel;