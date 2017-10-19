'use strict';

const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('Type and API', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const getGenerateInstanceFromIndex = requireFromIndex('get-generate-instance');

	t.is(getGenerateInstance, getGenerateInstanceFromIndex);
	t.is(typeof getGenerateInstance, 'function');
});

test.todo('use get generate instance');