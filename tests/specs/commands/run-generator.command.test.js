'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');
const nl = '\n';

const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

test('Type', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	t.is(typeof runGenerator, 'function');
});

test.cb('generate with a function as generator - call the generator passing a generate function and options', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const stdoutBuffer = [];

	t.plan(8);

	let generateCalled = false;

	function generator(generate, options){
		t.is(Object.keys(options).length, 0);

		const {
			optionOne = 'optionOneDefaultValue',
			optionTwo = 'optionTwoDefaultValue'
		} = options;

		t.is(arguments.length, 2);
		t.is(generate, getGenerateInstance());
		t.is(optionOne, 'optionOneDefaultValue');
		t.is(optionTwo, 'optionTwoDefaultValue');

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-name generate will`,
			`run the generator "generator" with the options {}`
		)+nl);

		setTimeout(() => {
			generate();
			generateCalled = true;
		}, 20);
	}

	const runGeneratorPromise = runGenerator({
		generator,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-name' }
	});

	t.true(runGeneratorPromise instanceof Promise);

	runGeneratorPromise.then(()=>{
		t.true(generateCalled);
		t.end();
	});
});

test.cb.todo('concurent calls');


test.todo('generate with a function as generator - generate synchronous call');


test.todo('timeout option - error if generator never calls the generate function');
test.todo('error if generator calls the generate function twice or more');

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