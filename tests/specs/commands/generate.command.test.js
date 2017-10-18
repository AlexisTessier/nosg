'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');
const nl = '\n';

const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

test('Type', t => {
	const generate = requireFromIndex('sources/commands/generate.command');

	t.is(typeof generate, 'function');
});

test.cb('generate with a function as generator - call the generator passing a generate function and options', t => {
	const generateCommand = requireFromIndex('sources/commands/generate.command');
	const stdoutBuffer = [];

	function generator(generate, options){
		t.is(Object.keys(options).length, 0);

		const {
			optionOne = 'optionOneDefaultValue',
			optionTwo = 'optionTwoDefaultValue'
		} = options;

		t.is(arguments.length, 2);
		t.is(typeof generate, 'function');
		t.is(optionOne, 'optionOneDefaultValue');
		t.is(optionTwo, 'optionTwoDefaultValue');

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-name generate will`,
			`run the generator "generator" with the options {}`
		)+nl);

		t.end();
	}

	generateCommand({
		generator,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-name' }
	});
});
test.todo('generate with a absolute Javascript Value Locator as generator');
test.todo('generate with a relative Javascript Value Locator as generator');

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

/*---------------*/

test.todo('Create a generator using the generate function passed to the generator');