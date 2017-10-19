'use strict';

const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('Type and API', t => {
	const nosgApiFromIndex = requireFromIndex('api');
	const nosgApi = requireFromIndex('sources/nosg-api');

	const pkg = requireFromIndex('package.json');

	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	t.is(nosgApiFromIndex, nosgApi);
	t.is(typeof nosgApi, 'object');

	t.is(nosgApi.version, pkg.version);

	t.is(nosgApi.runGenerator, runGenerator);
});