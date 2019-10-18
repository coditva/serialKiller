const flatted = require('flatted'),

    MODIFIER = '__modifier',
    SEPARATOR = ';',
    UNDEFINED_IDENTIFIER = 'u',
    SYMBOL_IDENTIFIER = 's',
    BIGINT_IDENTIFIER = 'b',
    REGEXP_IDENTIFIER = 'r',

    modifierLength = MODIFIER.length;

/**
 * Returns the string value for the Symbol.
 * e.g. If there's a Symbol defined as Symbol('id'), this function returns 'id'.
 *
 * @note we're not using `Symbol.description` because it's support in NodeJS is
 * not documented.
 *
 * @param {Symbol} value - Symbol to be processed
 * @returns {String} - The primitive of the Symbol
 */
function encodeSymbolToString (value) {
    let result = value.toString();

    return result.substring(7, result.length - 1);
}

/**
 * Converts a regex in string to the actual regex.
 *
 * e.g. If passed a string with value `/a-z/gm`, it converts it to the regexp
 * instance for this value.
 *
 * @param {String} str - The regex as a string
 * @returns {RegExp} - RegExp instance for the string
 */
function getRegexFromString (str) {
    let start = 1,
        end = str.lastIndexOf('/');

    return new RegExp(str.substring(start, end), str.substring(end + 1));
}


let replacer = function (_key, value) {
    if (value === undefined) {
        return MODIFIER + SEPARATOR + UNDEFINED_IDENTIFIER;
    }

    if (typeof value === 'symbol') {
        return MODIFIER + SEPARATOR + SYMBOL_IDENTIFIER + SEPARATOR + encodeSymbolToString(value);
    }

    if (typeof value === 'bigint') {
        return MODIFIER + SEPARATOR + BIGINT_IDENTIFIER + SEPARATOR + value.toString();
    }

    if (value instanceof RegExp) {
        return MODIFIER + SEPARATOR + REGEXP_IDENTIFIER + SEPARATOR + value.toString();
    }

    return value;
};

let reviver = function (_key, value) {
    if (typeof value === 'string' && value.startsWith(MODIFIER)) {
        let type = value.substring(modifierLength + 1, modifierLength + 2);

        switch (type) {
            case 'u':
                return undefined;

            case 'r':
                return getRegexFromString(value.substring(modifierLength + 3));

            case 'b':
                return BigInt(value.substring(modifierLength + 3));

            case 's':
                // We might want to remove `Symbol.for` for performance if we're
                // sure we don't need to get the reference to the original
                // symbol.
                return Symbol.for(value.substring(modifierLength + 3));
        }
    }

    return value;
};

let stringReviver = function (_key, value) {
    if (typeof value === 'string' && value.startsWith(MODIFIER)) {
        let type = value.substring(modifierLength + 1, modifierLength + 2),
            data = value.substring(modifierLength + 3);

        switch (type) {
            case 'u':
                return 'undefined';

            case 'b':
                return data + 'n';

            case 'r':
            case 's':
                return data;
        }
    }

    if (value && typeof value === 'object') {
        return value;
    }

    return String(value);
}

module.exports = {
    stringify: function (data, options) {
        return flatted.stringify(data, replacer, options);
    },

    parse: function (data, options) {
        return flatted.parse(data, reviver, options);
    },

    toString: function (data, options) {
        return flatted.parse(data, stringReviver, options);
    }
};
