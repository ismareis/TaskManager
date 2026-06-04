class AccessLevel {
    static USER = 1;
    static ADMIN = 2;

    static isValid(value) {
        return [
            AccessLevel.USER,
            AccessLevel.ADMIN
        ].includes(value);
    }
}

module.exports = AccessLevel;