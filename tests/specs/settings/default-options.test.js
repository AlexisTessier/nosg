'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type and content', t => {
	const defaultOptions = requireFromIndex('sources/settings/default-options');

	t.is(typeof defaultOptions, 'object');

	t.deepEqual(defaultOptions, {
		sourcesDirectory: 'sources'
	});
});
