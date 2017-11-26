'use strict';

const test = require('ava');

const sinon = require('sinon');

const path = require('path');

const msg = require('@alexistessier/msg');
const nl = '\n';

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const checkSourcesDirectoryErrorsHandlingMacros = require('./check-sources-directory-errors-handling.macro');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');
const mockFunction = requireFromIndex('tests/mocks/mock-function');

const logs = requireFromIndex('sources/settings/logs');

test('Type', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	t.is(typeof runGenerator, 'function');
	t.is(runGenerator.name, 'runGeneratorCommand');
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

		const logMessage = logs.willRunGenerator({
			cli: {name: 'nosg-test-name'},
			command: 'run-generator',
			generator: 'generator',
			options: {}
		});
		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\n`);

		generate();

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
	runGeneratorPromise.catch(err => {return;});
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

		const logMessage = logs.willRunGenerator({
			cli: {name: 'nosg-test'},
			command: 'run-generator',
			generator: 'generatorSync',
			options: {}
		});

		const successMessage = logs.hasRunnedGenerator({
			cli: {name: 'nosg-test'},
			command: 'run-generator',
			generator: 'generatorSync',
			options: {}
		});

		const generatedFilesMessage = logs.generatedFilesList();

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\nSUCCESS: ${successMessage}\nLOG: ${generatedFilesMessage}\n`);

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

		const logMessage = logs.willRunGenerator({
			cli: {name: 'nosg-test-async'},
			command: 'run-generator',
			generator: 'generatorAsync',
			options: {}
		});

		const successMessage = logs.hasRunnedGenerator({
			cli: {name: 'nosg-test-async'},
			command: 'run-generator',
			generator: 'generatorAsync',
			options: {}
		});

		const generatedFilesMessage = logs.generatedFilesList();

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\nSUCCESS: ${successMessage}\nLOG: ${generatedFilesMessage}\n`);

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

		const logMessage = logs.willRunGenerator({
			cli: { name: 'nosg-test-default-options' },
			command: 'run-generator',
			generator: 'generator',
			options: {}
		});

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\n`);

		generate();

		t.end();
	}

	const runGeneratorPromise = runGenerator({
		generator,
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-default-options' }
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

		const logMessage = logs.willRunGenerator({
			cli: { name: 'nosg-test-options' },
			command: 'run-generator',
			generator: 'generator',
			options: {optionOne:"option value 1",optionTwo:"option value 2"}
		});

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\n`);

		generate();

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

			generate();

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

			generate();

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

			generate();

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

			generate();

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

			generate();

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

			generate();

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

/*--------------------*/

test('Trying to use an unexistent absolute sourcesDirectory must throw error', t => {
	checkSourcesDirectoryErrorsHandlingMacros.unexistentAbsoluteSourcesDirectoryMacro(t,
		requireFromIndex('sources/commands/run-generator.command'),
		{
			generator(){
				t.fail();
			},
			cli: { name: 'nosg-test' }
		}
	)
});

test('Trying to use an unexistent relative sourcesDirectory must throw error', t => {
	checkSourcesDirectoryErrorsHandlingMacros.unexistentRelativeSourcesDirectoryMacro(t,
		requireFromIndex('sources/commands/run-generator.command'),
		{
			generator(){
				t.fail();
			},
			cli: { name: 'nosg-test' }
		}
	);
});

test('Trying to use an absolute path to a non directory sourcesDirectory must throw error', t => {
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryAbsoluteSourcesDirectoryMacro(t,
		requireFromIndex('sources/commands/run-generator.command'),
		{
			generator(){
				t.fail();
			},
			cli: { name: 'nosg-test' }
		}
	);
});

test('Trying to use a relative path to a non directory sourcesDirectory must throw error', t => {
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryRelativeSourcesDirectoryMacro(t,
		requireFromIndex('sources/commands/run-generator.command'),
		{
			generator(){
				t.fail();
			},
			cli: { name: 'nosg-test' }
		}
	);
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
			t.is(notCalledGenerateError.message, logs.generateNotCalledTimeout({
				cli: { name: 'cli-name' },
				command: 'run-generator',
				generator: 'generator',
				timeout: 100
			}));
		}
	})();
});

test.cb('timeout option - error if generate never emit finish', t => {
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
				generator(generate){ generate() },
				timeout: 100,
				stdout: mockWritableStream(),
				cli: { name: 'cli-name-2' },
				generate: Object.assign(function g() {return;}, { on(){return;} })
			});
			t.fail();
		}
		catch(finishEventNotEmittedError){
			errorDetected = true;
			t.is(finishEventNotEmittedError.message, logs.generateFinishEventNotEmittedTimeout({
				cli: { name: 'cli-name-2' },
				command: 'run-generator',
				generator: 'generator',
				timeout: 100
			}));
		}
	})();
});

test.cb.skip('timeout default value - never calls the generate function', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	let errorDetected = false;

	t.plan(3);

	setTimeout(()=>{
		t.false(errorDetected);
	}, 9980);

	setTimeout(()=>{
		t.true(errorDetected);
		t.end();
	}, 10020);

	(async () => {
		try{
			await runGenerator({
				generator: function generator2(){ return; },
				stdout: mockWritableStream(),
				cli: { name: 'cli-name-def' }
			});
			t.fail();
		}
		catch(notCalledGenerateError){
			errorDetected = true;
			t.is(notCalledGenerateError.message, logs.generateNotCalledTimeout({
				cli: { name: 'cli-name-def' },
				command: 'run-generator',
				generator: 'generator2',
				timeout: 10000
			}));
		}
	})();
});

test.cb.skip('timeout default value - generate never emit finish', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	let errorDetected = false;

	t.plan(3);

	setTimeout(()=>{
		t.false(errorDetected);
	}, 9980);

	setTimeout(()=>{
		t.true(errorDetected);
		t.end();
	}, 10020);

	(async () => {
		try{
			await runGenerator({
				generator: function generator4(generate){ generate() },
				stdout: mockWritableStream(),
				cli: { name: 'cli-name-2-def' },
				generate: Object.assign(function g() {return;}, { on(){return;} })
			});
			t.fail();
		}
		catch(finishEventNotEmittedError){
			errorDetected = true;
			t.is(finishEventNotEmittedError.message, logs.generateFinishEventNotEmittedTimeout({
				cli: { name: 'cli-name-2-def' },
				command: 'run-generator',
				generator: 'generator4',
				timeout: 10000
			}));
		}
	})();
});

/*------------------*/

function runGeneratorWithAStringAsGeneratorMacro(t, {
	generatorPath,
	generator,
	options,
	sourcesDirectory,
	expectedOptions,
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
		cli: { name: 'nosg-test-string' }
	});

	t.true(runGeneratorPromise instanceof Promise);

	runGeneratorPromise.then(()=>{
		t.true(generator.calledOnce);

		const call = generator.getCall(0).args;
		t.is(call.length, 2);

		t.is(typeof call[0], 'function');
		t.deepEqual(call[1], expectedOptions);

		const logMessage = logs.willRunGenerator({
			cli: {name: 'nosg-test-string'},
			command: 'run-generator',
			generator: generatorPath,
			options: options || {}
		});

		const successMessage = logs.hasRunnedGenerator({
			cli: {name: 'nosg-test-string'},
			command: 'run-generator',
			generator: generatorPath,
			options: options || {}
		});

		const generatedFilesMessage = logs.generatedFilesList();

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\nSUCCESS: ${successMessage}\nLOG: ${generatedFilesMessage}\n`);

		t.end();
	});
}

test.cb('runGenerator with a complete component path as generator', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-a/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-a/layer-a/generator-component-a'),
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources')
	}
});

test.cb('runGenerator with a complete component path as generator and options', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-b/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-b/layer-a/generator-component-a'),
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	options: {valueOne: 'value one'},
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources'),
		valueOne: 'value one'
	}
});

test.cb('runGenerator with a complete component path as generator and overriding sourcesDirectory', runGeneratorWithAStringAsGeneratorMacro, {
	generatorPath: 'components-set-c/layer-a/generator-component-a',
	generator: requireFromIndex('tests/mocks/sources/components-set-c/layer-a/generator-component-a'),
	sourcesDirectory: 'tests/mocks/sources',
	options: {valueTwo: 'value two'},
	expectedOptions: {
		sourcesDirectory: pathFromIndex('tests/mocks/sources'),
		valueTwo: 'value two'
	}
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

test.cb('display the created files when finished', t => {
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');
	const pathTemp1 = pathFromIndex('tmp/tests/display-created-files/one.txt');
	const pathTemp2 = pathFromIndex('tmp/tests/display-created-files/two.js');

	const stdoutBuffer = [];
	let generateCalled = false;

	const runGeneratorPromise = runGenerator({
		generator(generate){
			generateCalled = true;
			generate({
				[pathTemp1]: 'content text test',
				[pathTemp2]: `'use strict'; module.exports = 7`
			})
		},
		stdout: mockWritableStream(stdoutBuffer),
		cli: { name: 'nosg-test-display' }
	});

	t.true(runGeneratorPromise instanceof Promise);

	runGeneratorPromise.then((filesList) => {
		t.true(filesList instanceof Array);
		t.true(generateCalled);

		t.deepEqual(filesList, [
			pathTemp1,
			pathTemp2
		]);

		const logMessage = logs.willRunGenerator({
			cli: {name: 'nosg-test-display'},
			command: 'run-generator',
			generator: 'generator',
			options: {}
		});

		const successMessage = logs.hasRunnedGenerator({
			cli: {name: 'nosg-test-display'},
			command: 'run-generator',
			generator: 'generator',
			options: {}
		});

		const generatedFilesMessage = logs.generatedFilesList({filesList: [
			pathTemp1, pathTemp2
		].sort()});

		t.is(stdoutBuffer.join(''), `LOG: ${logMessage}\nSUCCESS: ${successMessage}\nLOG: ${generatedFilesMessage}\n`);

		t.end();
	})
});

test.todo('error if generate emit an error event');

/*---------------*/

function unvalidGeneratorMacro(t, unvalidValue, errorMessage){
	const runGenerator = requireFromIndex('sources/commands/run-generator.command');

	const unvalidGeneratorError = t.throws(()=>{
		runGenerator({
			generator: unvalidValue
		})
	});

	t.true(unvalidGeneratorError instanceof TypeError);
	t.is(unvalidGeneratorError.message, logs.unvalidGenerator({generator: unvalidValue}));
}

unvalidGeneratorMacro.title = providedTitle => (
	`runGenerator with unvalid generator - ${providedTitle}`
)

test('with number', unvalidGeneratorMacro, 2);
test('with empty array', unvalidGeneratorMacro, []);
test('with empty object', unvalidGeneratorMacro, {});
test('with array', unvalidGeneratorMacro, ['value', 4]);
test('with object', unvalidGeneratorMacro, {key: 'value'});
test('with regexp', unvalidGeneratorMacro, /regexp/);
test('with false', unvalidGeneratorMacro, false);
test('with undefined', unvalidGeneratorMacro, undefined);
test('with null', unvalidGeneratorMacro, null);
test('with true', unvalidGeneratorMacro, true);
test.skip('with symbol', unvalidGeneratorMacro, Symbol());

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

test.todo('should work without stdout option');
test.todo('should work without cli option');