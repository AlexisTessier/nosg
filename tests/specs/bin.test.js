'use strict';

const test = require('ava');

const sinon = require('sinon');

const pathFromIndex = require('../utils/path-from-index');
const requireFromIndex = require('../utils/require-from-index');

const argv = require('string-argv');

test.cb('Basic linking', t => {
	const pkg = requireFromIndex('package.json');

	t.plan(4);
	t.is(typeof pkg.bin, 'object');
	t.is(pkg.bin.nosg, 'bin/nosg');

	process.argv = argv('node nosg.js #');

	const stderrWrite = sinon.spy(process.stderr, 'write');

	requireFromIndex('bin/nosg');

	setTimeout(()=>{
		t.true(stderrWrite.calledOnce);
		t.true(stderrWrite.withArgs(
			`The command "#" is not a command of "nosg".`
		).calledOnce);

		t.end();
	}, 2000);
});