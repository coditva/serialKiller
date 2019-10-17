const flatted = require('flatted'),

    MODIFIER = '__modifier',
    SEPARATOR = ';',
    UNDEFINED_IDENTIFIER = 'u',
    SYMBOL_IDENTIFIER = 's',
    BIGINT_IDENTIFIER = 'b',
    REGEXP_IDENTIFIER = 'r',

    modifierLength = MODIFIER.length;

function encodeSymbolToString (value) {
    let result;

    result = value.toString();
    return result.substring(result.indexOf('(') + 1, result.lastIndexOf(')'));
}

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
                return Symbol.for(value.substring(modifierLength + 3));
        }
    }

    return value;
};

module.exports = {
    stringify: function (data, options) {
        return flatted.stringify(data, replacer, options);
    },

    parse: function (data, options) {
        return flatted.parse(data, reviver, options);
    }
};
