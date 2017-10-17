'use strict';

const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('Type and API', t => {
	const nosgCliFromIndex = requireFromIndex('cli');
	const nosgCli = requireFromIndex('sources/nosg-cli');

	const pkg = requireFromIndex('package.json');

	t.is(nosgCliFromIndex, nosgCli);
	t.is(typeof nosgCli, 'function');

	t.is(nosgCli.version, pkg.version);
	t.is(nosgCli.name, pkg.name);
	t.is(nosgCli.name, 'nosg');
});

test.todo('nosg generate')
test.todo('nosg create')
test.todo('nosg build')
test.todo('nosg watch')