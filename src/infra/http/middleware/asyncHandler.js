module.exports = (handler) =>
    (req, res, next) =>
        Promise.resolve(handler(req, res, next))
            .then(() => {
                if(res.statusCode)
                    console.log(`Status: ${res.statusCode}`);
            })
            .catch(next);