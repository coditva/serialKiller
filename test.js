const serialKiller = require('.'),
    _ = require('lodash');

function runTest (testName, data) {
    console.info('\n[TEST]', testName);

    let stringified = serialKiller.stringify(data),
        parsed = serialKiller.parse(stringified);

    if (_.isEqual(data, parsed)) {
        console.info('pass');
    } else {
        console.error('fail');
        console.log('data   :\n', data);
        console.log('parsed :\n', parsed);
    }
}


let circularObj = {
    a: 'hi',
    b: 'bye'
};
circularObj.c = circularObj;

runTest('string', 'some string');
runTest('regex', /a-z/g);
runTest('bigint', BigInt(100000));
runTest('undefined', undefined);
runTest('null', null);
runTest('object', { a: /a-z/ });
runTest('array', [null, undefined, [ null, { a: undefined }]]);
runTest('circular', circularObj);
runTest('symbol', {
    sym: Symbol.for('sym'),
    num: Symbol.for(100),
    iter: Symbol.iterator
});



let obj = {
    a: [null, undefined],
    b: undefined,
    c: /a-z/,
    d: Symbol('hello'),
    e: 1n,
    f: function hello (a, b) {
        return 123;
    },
    g: {
        x: /a-z/,
        y: false
    }
};
obj.g.z = obj.f;

let stringified = serialKiller.stringify(obj);

console.log('\n\n');
console.log(stringified, '\n');
console.log(serialKiller.parse(stringified));
