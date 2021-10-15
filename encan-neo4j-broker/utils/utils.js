const Utils = {
    isPrimitive: function (value) {
        return (typeof value !== 'object' && typeof value !== 'function') || value === null;

    },
    isObject: function (value) {
        return typeof value == 'object' && value != null;

    },

};
module.exports = Utils;