'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type', t => {
	const log = requireFromIndex('sources/tools/log');

	t.is(typeof log, 'function');
});

test.todo('behaviour');