let Api = {
    error: {
        unauthenticated: function (res) {
            return Api.write(res, Api.message(401, 'You are not logged in !'))
        },
        not_found: function (res,reason) {
            return Api.write(res, Api.message(404, reason?reason:'Not Found!'))
        },
        custom: function (res, code, message) {
            return Api.write(res, Api.message(code, message))
        }

    },
    ok: {
        data: function (res, data) {
            return Api.write(res, Api.messageData(200, data))
        }, success: function (res) {
            return Api.write(res, Api.messageData(200, 'OK'))
        }
    },
    message: function (code, message) {
        return {status: code, message: message}
    },
    messageData: function (code, data) {
        return {status: code, data: data}
    },
    write: function (res, data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

};
module.exports = Api;