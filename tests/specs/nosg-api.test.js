'use strict';

const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('Type and API', t => {
	const nosgApiFromIndex = requireFromIndex('api');
	const nosgApi = requireFromIndex('sources/nosg-api');

	const pkg = requireFromIndex('package.json');

	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	t.is(nosgApiFromIndex, nosgApi);
	t.is(typeof nosgApi, 'object');

	t.is(Object.keys(nosgApi).length, 4);

	t.is(nosgApi.version, pkg.version);

	t.is(nosgApi.checkSourcesDirectory, checkSourcesDirectory);
	t.is(nosgApi.listMatchingFilepaths, listMatchingFilepaths);
	t.is(nosgApi.runGenerator, runGenerator);
});