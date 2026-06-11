class AccessLevel {
    static USER = 1;
    static ADMIN = 2;

    static All = [
            AccessLevel.USER,
            AccessLevel.ADMIN
        ];

    static isValid(value) {
        return this.All.includes(value);
    }
}

module.exports = AccessLevel;