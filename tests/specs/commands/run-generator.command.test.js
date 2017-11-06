'use strict';

const test = require('ava');

const sinon = require('sinon');

const path = require('path');

const msg = require('@alexistessier/msg');
const nl = '\n';

const pathFromIndex = require('../../utils/path-from-index');
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

	t.true(runGeneratorPromise instanceof Promise);

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

	t.true(runGeneratorPromise instanceof Promise);

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
		t.is(Object.keys(options).length, 1);

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
		t.is(Object.keys(options).length, 3);

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

/*---------------------------*/
/*- sourcesDirectory option -*/
/*---------------------------*/

test.cb('sourcesDirectory default value is accessible in the generator via the options object', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const runGeneratorPromise = runGenerator({
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 42);
			t.is(options.sourcesDirectory, path.join(process.cwd(), 'sources'));

			t.end();
		},
		options: {
			one: 42
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('sourcesDirectory (absolute one) option is accessible in the generator via the options object', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const absolutePath = pathFromIndex('tests/mocks/sources-directory');

	const runGeneratorPromise = runGenerator({
		sourcesDirectory: absolutePath,
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 43);
			t.is(options.sourcesDirectory, absolutePath);

			t.end();
		},
		options: {
			one: 43
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('sourcesDirectory (relative one) option is accessible in the generator via the options object', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const runGeneratorPromise = runGenerator({
		sourcesDirectory: 'tests/mocks/sources-directory',
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 44);
			t.is(options.sourcesDirectory, path.join(process.cwd(), 'tests/mocks/sources-directory'));

			t.end();
		},
		options: {
			one: 44
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('sourcesDirectory default value can be overrided using the options option', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const runGeneratorPromise = runGenerator({
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 'test value');
			t.is(options.sourcesDirectory, 'overriding default value');

			t.end();
		},
		options: {
			one: 'test value',
			sourcesDirectory: 'overriding default value'
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('sourcesDirectory absolute path value can be overrided using the options option', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const runGeneratorPromise = runGenerator({
		sourcesDirectory: pathFromIndex('tests/mocks/sources-directory'),
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 'test value');
			t.is(options.sourcesDirectory, 'overriding absolute path value');

			t.end();
		},
		options: {
			one: 'test value',
			sourcesDirectory: 'overriding absolute path value'
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test.cb('sourcesDirectory relative path value can be overrided using the options option', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const runGeneratorPromise = runGenerator({
		sourcesDirectory: 'tests/mocks/sources-directory',
		generator(generate, options){
			t.is(arguments.length, 2);
			t.is(typeof options, 'object');
			t.is(Object.keys(options).length, 2);

			t.is(options.one, 'test value 2');
			t.is(options.sourcesDirectory, 'overriding relative path value');

			t.end();
		},
		options: {
			one: 'test value 2',
			sourcesDirectory: 'overriding relative path value'
		},
		stdout: mockWritableStream(),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);
});

test('Trying to use an unexistent absolute sourcesDirectory must throw error', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const unexistentAbsolutePath = pathFromIndex('tests/mocks/unexistent/sources/directory/path');

	const unexistentAbsolutePathError = t.throws(() => {
		runGenerator({
			sourcesDirectory: unexistentAbsolutePath,
			generator(){
				t.fail();
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg-test' }
		});
	});

	t.is(unexistentAbsolutePathError.message, msg(
		`"${unexistentAbsolutePath}" is not a valid sources directory path.`,
		`The directory doesn't seem to exist.`
	));
});

test('Trying to use an unexistent relative sourcesDirectory must throw error', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const unexistentRelativePath = 'tests/mocks/unexistent/sources/directory/path';

	const unexistentRelativePathError = t.throws(() => {
		runGenerator({
			sourcesDirectory: unexistentRelativePath,
			generator(){
				t.fail();
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg-test' }
		});
	});

	t.is(unexistentRelativePathError.message, msg(
		`"${unexistentRelativePath}" is not a valid sources directory path.`,
		`The directory doesn't seem to exist. Ensure that you are running the run-generator`,
		`command in an appropriate current working directory.`
	));
});

test('Trying to use an absolute path to a non directory sourcesDirectory must throw error', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const notDirectoryAbsolutePath = pathFromIndex('tests/mocks/not-a-directory');

	const notDirectoryAbsolutePathError = t.throws(() => {
		runGenerator({
			sourcesDirectory: notDirectoryAbsolutePath,
			generator(){
				t.fail();
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg-test' }
		});
	});

	t.is(notDirectoryAbsolutePathError.message, msg(
		`"${notDirectoryAbsolutePath}" is not a valid sources directory path.`,
		`The path was found but it's not a directory.`
	));
});

test('Trying to use a relative path to a non directory sourcesDirectory must throw error', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const notDirectoryRelativePath = 'tests/mocks/not-a-directory'

	const notDirectoryRelativePathError = t.throws(() => {
		runGenerator({
			sourcesDirectory: notDirectoryRelativePath,
			generator(){
				t.fail();
			},
			stdout: mockWritableStream(),
			cli: { name: 'nosg-test' }
		});
	});

	t.is(notDirectoryRelativePathError.message, msg(
		`"${notDirectoryRelativePath}" is not a valid sources directory path.`,
		`The path was found but it's not a directory. Ensure that you are running the run-generator`,
		`command in an appropriate current working directory.`
	));
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

function runGeneratorWithAStringAsGeneratorMacro(t, {
	generatorPath,
	generator,
	options,
	sourcesDirectory,
	expectedOptions,
	expectedStdoutBufferContent,
	fakeSourcesParentDirectory
}) {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const stdoutBuffer = [];

	t.true(generator.notCalled);

	if (fakeSourcesParentDirectory) {
		const cwdCache = process.cwd();
		const cwd = sinon.stub(process, 'cwd').callsFake(() => {
			const stack = new Error('stack').stack;
			const inRunGenerateCommand = stack.indexOf('files-generator/sources/generate.js') < 0;

			if (inRunGenerateCommand) {
				cwd.restore();
				return fakeSourcesParentDirectory;
			}

			return cwdCache;
		});
	}

	const runGeneratorPromise = runGenerator({
		generator: generatorPath,
		options,
		sourcesDirectory,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test' }
	});

	t.true(runGeneratorPromise instanceof Promise);

	runGeneratorPromise.then(()=>{
		t.true(generator.calledOnce);

		const call = generator.getCall(0).args;
		t.is(call.length, 2);

		t.is(typeof call[0], 'function');
		t.deepEqual(call[1], expectedOptions);

		t.is(stdoutBuffer.join(''), expectedStdoutBufferContent);

		t.end();
	});
}

test.cb('runGenerator with a complete component path as generator', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-a/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-a/layer-a/generator-component-a'),
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources')
	},
	expectedStdoutBufferContent: msg(
		`LOG: nosg-test run-generator will`,
		`run the generator "components-set-a/layer-a/generator-component-a" with the options {}.`
	)+nl+msg(
		`SUCCESS: nosg-test run-generator correctly`,
		`runned the generator "components-set-a/layer-a/generator-component-a" with the options {}.`
	)+nl
});

test.cb('runGenerator with a complete component path as generator and options', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-b/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-b/layer-a/generator-component-a'),
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	options: {valueOne: 'value one'},
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources'),
		valueOne: 'value one'
	},
	expectedStdoutBufferContent: msg(
		`LOG: nosg-test run-generator will`,
		`run the generator "components-set-b/layer-a/generator-component-a" with the options {"valueOne":"value one"}.`
	)+nl+msg(
		`SUCCESS: nosg-test run-generator correctly`,
		`runned the generator "components-set-b/layer-a/generator-component-a" with the options {"valueOne":"value one"}.`
	)+nl
});

test.cb('runGenerator with a complete component path as generator and overriding sourcesDirectory', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-c/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-c/layer-a/generator-component-a'),
	sourcesDirectory: 'tests/mocks/sources',
	options: {valueTwo: 'value two'},
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources'),
		valueTwo: 'value two'
	},
	expectedStdoutBufferContent: msg(
		`LOG: nosg-test run-generator will`,
		`run the generator "components-set-c/layer-a/generator-component-a" with the options {"valueTwo":"value two"}.`
	)+nl+msg(
		`SUCCESS: nosg-test run-generator correctly`,
		`runned the generator "components-set-c/layer-a/generator-component-a" with the options {"valueTwo":"value two"}.`
	)+nl
});

test.todo('runGenerator with a layer/component path as generator');
test.todo('runGenerator with a layer/component path as generator and options');
test.todo('runGenerator with a layer/component path as generator and overriding sourcesDirectory');

test.todo('runGenerator with a set:component path as generator');
test.todo('runGenerator with a set:component path as generator and options');
test.todo('runGenerator with a set:component path as generator and overriding sourcesDirectory');

test.todo('runGenerator with a component name as generator');
test.todo('runGenerator with a component name as generator and options');
test.todo('runGenerator with a component name as generator and overriding sourcesDirectory');

test.todo('runGenerator with a nested component path as generator');
test.todo('runGenerator with a nested component path as generator and options');
test.todo('runGenerator with a nested component path as generator and overriding sourcesDirectory');

/*---------------*/

test.todo('runGenerator with a complete component path as generator - matching no file');
test.todo('runGenerator with a complete component path as generator - matching no valid generator');

test.todo('runGenerator with a layer/component path as generator - matching no file');
test.todo('runGenerator with a layer/component path as generator - matching no valid generator');
test.todo('runGenerator with a layer/component path as generator - matching more than one file');

test.todo('runGenerator with a set:component path as generator - matching no file');
test.todo('runGenerator with a set:component path as generator - matching no valid generator');
test.todo('runGenerator with a set:component path as generator - matching more than one file');

test.todo('runGenerator with a component name as generator - matching no file');
test.todo('runGenerator with a component name as generator - matching no valid generator');
test.todo('runGenerator with a component name as generator - matching more than one file');

/*---------------*/

test.todo('runGenerator with an absolute Javascript Value Locator (string) as generator');
test.todo('runGenerator with an asbolute Javascript Value Locator (string) as generator and options');
test.todo('runGenerator with a relative Javascript Value Locator (string) as generator');
test.todo('runGenerator with a relative Javascript Value Locator (string) as generator and options');
test.todo('runGenerator with an absolute Javascript Value Locator (string) as generator - matching no file');
test.todo('runGenerator with an absolute Javascript Value Locator (string) as generator - matching no valid generator');

test.todo('runGenerator with an absolute Javascript Value Locator (object) as generator');
test.todo('runGenerator with an asbolute Javascript Value Locator (object) as generator and options');
test.todo('runGenerator with a relative Javascript Value Locator (object) as generator');
test.todo('runGenerator with a relative Javascript Value Locator (object) as generator and options');
test.todo('runGenerator with an absolute Javascript Value Locator (object) as generator - matching no file');
test.todo('runGenerator with an absolute Javascript Value Locator (object) as generator - matching no valid generator');

/*---------------*/

test.todo('display the created files when finished');

test.todo('error if generate emit an error event');

/*---------------*/

function unvalidGeneratorMacro(t, unvalidValue, errorMessage){
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const unvalidGeneratorError = t.throws(()=>{
		runGenerator({
			generator: unvalidValue
		})
	});

	t.is(unvalidGeneratorError.message, errorMessage);
}

unvalidGeneratorMacro.title = providedTitle => (
	`runGenerator with unvalid generator - ${providedTitle}`
)

test('with number', unvalidGeneratorMacro, 2, msg(
	`2 (number) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with empty array', unvalidGeneratorMacro, [], msg(
	`(object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with empty object', unvalidGeneratorMacro, {}, msg(
	`[object Object] (object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with array', unvalidGeneratorMacro, ['value', 4], msg(
	`value,4 (object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with object', unvalidGeneratorMacro, {key: 'value'}, msg(
	`[object Object] (object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with regexp', unvalidGeneratorMacro, /regexp/, msg(
	`/regexp/ (object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with false', unvalidGeneratorMacro, false, msg(
	`false (boolean) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with undefined', unvalidGeneratorMacro, undefined, msg(
	`undefined (undefined) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with null', unvalidGeneratorMacro, null, msg(
	`null (object) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test('with true', unvalidGeneratorMacro, true, msg(
	`true (boolean) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));
test.skip('with symbol', unvalidGeneratorMacro, Symbol(), msg(
	`2 (number) is not a valid generator value.`,
	`Generator can be a function, a component path to`,
	`a function or a Javascript Value Locator to a function.`
));

/*---------------*/

test.todo('runGenerator with unvalid options');
test.todo('runGenerator with unvalid sourcesDirectory');
test.todo('runGenerator with unvalid timeout');
test.todo('runGenerator with unvalid generate instance');
test.todo('runGenerator with unvalid stdout');
test.todo('runGenerator with unvalid cli object');

/*---------------*/

test.todo('handle asynchronous generate calls in generator - using Promise');

test.todo('handle asynchronous generate calls in generator - using callback');

test.todo('handle multiple generate calls in generator');

test.todo('log enhancement');

/*---------------*/

/*----------------------*/
/*- File creation test -*/
/*----------------------*/

test.todo('test with actual file creation');
test.todo('test with actual file creation using a component path as generator');