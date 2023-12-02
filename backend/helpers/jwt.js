const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;

    return jwt({
        secret,
        algorithms: ['HS256']
    })

        .unless({
            path: [
                { url: /\/api\/v1\/requests(.*)/, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] },
                { url: /\/api\/v1\/documents(.*)/, methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"] },
                { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS", "POST"] },
                `${api}/get/userRequests/:userid`,
                `${api}/users`,
                `${api}/users/login`,
                `${api}/users/register`,
                `${api}/requests/requestItems/:id`,
            ]
        })
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true)
    }

    done();
}


module.exports = authJwt
