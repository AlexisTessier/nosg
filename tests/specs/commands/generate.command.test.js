'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type', t => {
	const generate = requireFromIndex('sources/commands/generate.command');

	t.is(typeof generate, 'function');
});

test.skip('generate with a function as generator', t => {
	const generate = requireFromIndex('sources/commands/generate.command');

	function generator(){
		
	}
});
test.todo('generate with a Javascript Value Locator as generator');

test.todo('generate with a component path (complete) as generator');
test.todo('generate with a generator name as generator');
test.todo('generate with a component path (complete) as generator and overriding sourcesDirectory');
test.todo('generate with a generator name as generator and overriding sourcesDirectory');

test.todo('generate with a function as generator and passing options');
test.todo('generate with a Javascript Value Locator as generator and passing options');

test.todo('generate with a component path (complete) as generator and passing options');
test.todo('generate with a generator name as generator and passing options');
test.todo('generate with a component path (complete) as generator and overriding sourcesDirectory and passing options');
test.todo('generate with a generator name as generator and overriding sourcesDirectory and passing options');

test.todo('generate wrong arguments errors handling');
