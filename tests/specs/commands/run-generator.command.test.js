'use strict';

const test = require('ava');

const sinon = require('sinon');

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

	t.plan(9);

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

		t.is(stdoutBuffer.join(''), msg(
			`LOG: nosg-test-name generate will`,
			`run the generator "generator" with the options {}`
		)+nl+msg(
			`SUCCESS: nosg-test-name generate correctly`,
			`runned the generator "generator" with the options {}`
		)+nl);

		t.end();
	});
});

test.todo('generate instance can be overrided');

test.cb('generate with a function as generator - generate synchronous call', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
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
			`LOG: nosg-test generate will`,
			`run the generator "generatorSync" with the options {}`
		)+nl+msg(
			`SUCCESS: nosg-test generate correctly`,
			`runned the generator "generatorSync" with the options {}`
		)+nl);

		t.end();
	});
});

test.cb('concurent calls - unique generate instance management - the finish event from one runGenerator call should not cause the finish event of an other runGenerator call', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const oneTimeout = 10;
	const oneTwoDelay = 20;
	const twoTimeout = oneTimeout+oneTwoDelay;

	t.plan(1);

	Promise.all([
		runGenerator({
			generator(generate){
				setTimeout(()=>generate(), oneTimeout);
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg' }
		}).then(()=>Promise.resolve(Date.now())),
		runGenerator({
			generator(generate){
				setTimeout(()=>generate(), twoTimeout);
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg' }
		}).then(()=>Promise.resolve(Date.now()))
	]).then(([runOne, runTwo]) => {
		t.true(runTwo - runOne >= oneTwoDelay);

		t.end();
	});
});

test.cb('must bind only one finish event from generate', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const onArgs = [];
	const offArgs = [];

	const generateInstance = Object.assign(()=>onArgs.forEach(onArg => {
		if (onArg.event === 'finish') {
			const inOffArgs = offArgs.filter(
				offArg => offArg.event === 'finish'
			).filter(
				offArg => offArg.handler === onArg.handler
			).length > 0;

			if (!inOffArgs) {
				onArg.handler();
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

test.todo('timeout default value');

test.todo('handle multiple generate calls in generator');

test.todo('handle asynchronous generate calls in generator - using Promise');
test.todo('handle asynchronous generate calls in generator - using callback');

test.todo('generate with a absolute Javascript Value Locator as generator');
test.todo('generate with a relative Javascript Value Locator as generator');

test.todo('generate with a component path (complete) as generator');
test.todo('generate with a generator name as generator');
test.todo('generate with a component path (complete) as generator and overriding sourcesDirectory');
test.todo('generate with a generator name as generator and overriding sourcesDirectory');

test.todo('generate with a function as generator and no options');
test.todo('generate with a Javascript Value Locator as generator and no options');

test.todo('generate with a component path (complete) as generator and no options');
test.todo('generate with a generator name as generator and no options');
test.todo('generate with a component path (complete) as generator and overriding sourcesDirectory and no options');
test.todo('generate with a generator name as generator and overriding sourcesDirectory and no options');

test.todo('generate wrong arguments errors handling');

/*---------------*/