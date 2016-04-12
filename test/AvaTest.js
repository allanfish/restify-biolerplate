import test from 'ava';

test('foo', t => {
    t.pass();
});

test('bar', async t => {
    const bar = Promise.resolve('bar');

    t.is(await bar, 'bar');
});

test("promise", t => {
    t.plan(1);

    return Promise.resolve(3).then(n => {
        t.is(n, 3);
    });
});

test.cb(t => {
    t.plan(1);

    someAsyncFunction(() => {
        t.pass();
        t.end();
    });
});


