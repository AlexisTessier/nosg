'use strict';

const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('Type and API', t => {
	const nosgFromIndex = requireFromIndex('index');
	const nosg = requireFromIndex('sources/nosg');

	const nosgApi = requireFromIndex('sources/nosg-api');
	const nosgCli = requireFromIndex('sources/nosg-cli');

	const pkg = requireFromIndex('package.json');

	t.is(pkg.name, 'nosg');

	t.is(nosgFromIndex, nosg);
	t.is(typeof nosg, 'object');

	t.is(nosg.api, nosgApi);
	t.is(nosg.cli, nosgCli);

	t.is(nosg.version, nosgApi.version);
	t.is(nosg.version, nosgCli.version);

	t.is(Object.keys(nosg).length, 3);
});