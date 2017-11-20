'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type', t => {
	const getComponent = requireFromIndex('sources/commands/get-component.command');

	t.is(typeof getComponent, 'function');
});

test.todo('tests');
test.todo('handle JVL here');
