'use strict';

const test = require('ava');

const sinon = require('sinon');

const msg = require('@alexistessier/msg');
const nl = '\n';

const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');
const mockFunction = requireFromIndex('tests/mocks/mock-function');

test('Type', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	t.is(typeof runGenerator, 'function');
});

/*---------------*/
/*- Basic usage -*/
/*---------------*/

test.cb('function as generator - generator is called with a generate function', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	function generator(generate){
		t.is(arguments.length, 2);

		t.is(typeof generate, 'function');
		t.is(typeof generate.use, 'function');
		t.is(typeof generate.on, 'function');
		t.is(typeof generate.off, 'function');

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-name run-generator will`,
			`run the generator "generator" with the options {}.`
		)+nl);

		t.end();
	}

	const runGeneratorPromise = runGenerator({
		generator,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-name' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('function as generator - generate instance can be overrided', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const generateOverride = mockFunction();
	generateOverride.on = ()=>{return;}

	const runGeneratorPromise = runGenerator({
		generator(generate){
			t.is(typeof generate, 'function');
			t.is(generate.on, generateOverride.on);

			generate({filepath:'file content'}, {
				optionOne: 'value one'
			}, 'arg3', 'arg4');

			t.true(generateOverride.calledOnce);
			const callOneArgs = generateOverride.getCall(0).args;
			t.is(callOneArgs.length, 4);
			t.deepEqual(callOneArgs[0], {filepath:'file content'});

			t.is(typeof callOneArgs[1], 'object');
			const optionsKeys = Object.keys(callOneArgs[1]);

			t.is(optionsKeys.length, 1);
			t.true(optionsKeys.includes('optionOne'));
			t.is(callOneArgs[1].optionOne, 'value one');

			t.is(callOneArgs[1].eventData, undefined);

			t.is(callOneArgs[2], 'arg3');
			t.is(callOneArgs[3], 'arg4');

			t.end();
		},
		generate: generateOverride,
		stdout: mockWritableStream(),
		cli: {name: 'cli-name-test'}
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('function as generator - generate synchronous call', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	let generateCalled = false;

	function generatorSync(generate){
		generate();
		generateCalled = true;
	}

	const runGeneratorPromise = runGenerator({
		generator: generatorSync,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test' }
	});

	runGeneratorPromise.then(()=>{
		t.true(generateCalled);

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test run-generator will`,
			`run the generator "generatorSync" with the options {}.`
		)+nl+msg(
			`SUCCESS: nosg-test run-generator correctly`,
			`runned the generator "generatorSync" with the options {}.`
		)+nl);

		t.end();
	});
});

test.cb('function as generator - generate asynchronous call', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	let generateCalled = false;

	function generatorAsync(generate){
		setTimeout(() => {
			generate();
			generateCalled = true;
		}, 20);
	}

	const runGeneratorPromise = runGenerator({
		generator: generatorAsync,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-async' }
	});

	runGeneratorPromise.then(()=>{
		t.true(generateCalled);

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-async run-generator will`,
			`run the generator "generatorAsync" with the options {}.`
		)+nl+msg(
			`SUCCESS: nosg-test-async run-generator correctly`,
			`runned the generator "generatorAsync" with the options {}.`
		)+nl);

		t.end();
	});
});

test.cb('must bind only one finish event from generate', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const onArgs = [];
	const offArgs = [];

	const generateInstance = Object.assign((generateConfig, options)=>onArgs.forEach(onArg => {
		if (onArg.event === 'finish') {
			const inOffArgs = offArgs.filter(
				offArg => offArg.event === 'finish'
			).filter(
				offArg => offArg.handler === onArg.handler
			).length > 0;

			if (!inOffArgs) {
				onArg.handler({
					data: undefined,
					errors: [],
					success: []
				});
			}
		}
	}), {
		on(event, handler){
			onArgs.push({event, handler});
		},
		off(event, handler){
			offArgs.push({event, handler});
		}
	})

	runGenerator({
		cli: { name: 'cli-name' },
		stdout: mockWritableStream(),
		generate: generateInstance,
		generator(generate){
			t.is(onArgs.length, 1);

			const onEvent = onArgs[0].event;
			const onHandler = onArgs[0].handler;

			t.is(onEvent, 'finish');
			t.is(typeof onHandler, 'function');
			
			t.is(offArgs.length, 0);

			generate();

			t.is(onArgs.length, 1);

			const onEvent2 = onArgs[0].event;
			const onHandler2 = onArgs[0].handler;

			t.is(onEvent2, onEvent);
			t.is(onHandler2, onHandler);

			t.is(offArgs.length, 1);

			const offEvent = offArgs[0].event;
			const offHandler = offArgs[0].handler;

			t.is(offEvent, onEvent);
			t.is(offHandler, onHandler);

			generateInstance();

			t.is(onArgs.length, 1);

			const onEvent3 = onArgs[0].event;
			const onHandler3 = onArgs[0].handler;

			t.is(onEvent3, onEvent);
			t.is(onHandler3, onHandler);

			t.is(offArgs.length, 1);

			const offEvent2 = offArgs[0].event;
			const offHandler2 = offArgs[0].handler;

			t.is(offEvent2, onEvent);
			t.is(offHandler2, onHandler);

			t.end();
		}
	});
});

/*------------------*/
/*- options option -*/
/*------------------*/

test.cb('function as generator - generator is called with no options by default', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	function generator(generate, options){
		t.is(arguments.length, 2);
		t.is(typeof options, 'object');
		t.is(Object.keys(options).length, 0);

		const {
			optionOne = 'optionOneDefaultValue',
			optionTwo = 'optionTwoDefaultValue'
		} = options;

		t.is(optionOne, 'optionOneDefaultValue');
		t.is(optionTwo, 'optionTwoDefaultValue');

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-defautl-options run-generator will`,
			`run the generator "generator" with the options {}.`
		)+nl);

		t.end();
	}

	const runGeneratorPromise = runGenerator({
		generator,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-defautl-options' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('function as generator - generator is called with options if provided', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	function generator(generate, options){
		t.is(arguments.length, 2);
		t.is(typeof options, 'object');
		t.is(Object.keys(options).length, 2);

		const {
			optionOne = 'optionOneDefaultValue',
			optionTwo = 'optionTwoDefaultValue'
		} = options;

		t.is(optionOne, 'option value 1');
		t.is(optionTwo, 'option value 2');

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-options run-generator will`,
			`run the generator "generator" with the options {"optionOne":"option value 1","optionTwo":"option value 2"}.`
		)+nl);

		t.end();
	}

	const runGeneratorPromise = runGenerator({
		generator,
		options: {
			optionOne: 'option value 1',
			optionTwo: 'option value 2'
		},
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-options' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

/*------------------*/
/*- Timeout option -*/
/*------------------*/

test.cb('timeout option - error if generator never calls the generate function', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	let errorDetected = false;

	t.plan(3);

	setTimeout(()=>{
		t.false(errorDetected);
	}, 80);


	setTimeout(()=>{
		t.true(errorDetected);
		t.end();
	}, 120);

	(async () => {
		try{
			await runGenerator({
				generator(){ return; },
				timeout: 100,
				stdout: mockWritableStream(),
				cli: { name: 'cli-name' }
			});
			t.fail();
		}
		catch(notCalledGenerateError){
			errorDetected = true;
			t.is(notCalledGenerateError.message, msg(
				`cli-name run-generator detected an error`,
				`in the generator "generator". The generator "generator"`,
				`doesn't have called yet the generate function after a timeout of 100ms.`,
				`Try to increase the timeout option when using cli-name run-generator,`,
				`or check that the generator works correctly and actually calls the generate function.`
			));
		}
	})();
});

test.todo('timeout option - error if generate never emit finish');
test.todo('timeout default value');

/*------------------*/

test.todo('handle multiple generate calls in generator');

test.todo('error if trying to override eventData when calling generate');
test.todo('error if generate emit an error event');

test.todo('handle asynchronous generate calls in generator - using Promise');
test.todo('handle asynchronous generate calls in generator - using callback');

test.todo('runGenerator with an absolute Javascript Value Locator as generator');
test.todo('runGenerator with an asbolute Javascript Value Locator as generator and no options');
test.todo('runGenerator with a relative Javascript Value Locator as generator');
test.todo('runGenerator with a relative Javascript Value Locator as generator and no options');

test.todo('runGenerator with a complete component path as generator');
test.todo('runGenerator with a complete component path as generator and no options');
test.todo('runGenerator with a complete component path as generator and overriding sourcesDirectory');
test.todo('runGenerator with a complete component path as generator and overriding sourcesDirectory and no options');

test.todo('runGenerator with a partial component path as generator');
test.todo('runGenerator with a partial component path as generator and no options');
test.todo('runGenerator with a partial component path as generator and overriding sourcesDirectory');
test.todo('runGenerator with a partial component path as generator and overriding sourcesDirectory and no options');

test.todo('runGenerator with a nested component path as generator');
test.todo('runGenerator with a nested component path as generator and no options');
test.todo('runGenerator with a nested component path as generator and overriding sourcesDirectory');
test.todo('runGenerator with a nested component path as generator and overriding sourcesDirectory and no options');

test.todo('runGenerator with a generator name as generator');
test.todo('runGenerator with a generator name as generator and no options');
test.todo('runGenerator with a generator name as generator and overriding sourcesDirectory');
test.todo('runGenerator with a generator name as generator and overriding sourcesDirectory and no options');

/*---------------*/

test.todo('log enhancement');

/*---------------*/

test.todo('runGenerator with unvalid generator');
test.todo('runGenerator with unvalid options');
test.todo('runGenerator with unvalid sourcesDirectory');
test.todo('runGenerator with unvalid timeout');
test.todo('runGenerator with unvalid generate instance');
test.todo('runGenerator with unvalid stdout');
test.todo('runGenerator with unvalid cli object');

/*---------------*/