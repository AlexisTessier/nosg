'use strict';

const test = require('ava');

const pathFromIndex = require('../utils/path-from-index');
const requireFromIndex = require('../utils/require-from-index');

test('Basic linking', t => {
	const pkg = requireFromIndex('package.json');

	t.is(typeof pkg.bin, 'object');
	t.is(pkg.bin.nosg, 'bin/nosg');

	process.argv = ['one', 'two', '#'];

	const detectCall = t.throws(() => {
		requireFromIndex('bin/nosg');
	});

	t.is(detectCall.message, `The command "#" is not a command of "nosg".`);
});