'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');

const requireFromIndex = require('../../utils/require-from-index');

test('Type and content', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs, 'object');

	t.deepEqual(Object.keys(logs).sort(), [
		'componentNotFound',
		'unvalidGenerator',
		'unvalidSourcesDirectory',
		'unexistentSourcesDirectory',
		'ensureCurrentWorkingDirectory',
		'generateNotCalledTimeout',
		'generateFinishEventNotEmittedTimeout',
		'willRunGenerator',
		'hasRunnedGenerator',
		'validSourcesDirectory'
	].sort());
});

test('componentNotFound', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.componentNotFound, 'function');
	t.is(logs.componentNotFound({ componentPath: 'hello' }), msg(
		`No component found matching "hello".`
	));

	t.is(logs.componentNotFound({ componentPath: 'rock-and-billy' }), msg(
		`No component found matching "rock-and-billy".`
	));
});

test('unvalidGenerator', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.unvalidGenerator, 'function');
	t.is(logs.unvalidGenerator({ generator: 42 }), msg(
		`42 (number) is not a valid generator value. Generator can be a function,`,
		`a component path to a function or a Javascript Value Locator to a function.`
	));

	t.is(logs.unvalidGenerator({ generator: "hello" }), msg(
		`hello (string) is not a valid generator value. Generator can be a function,`,
		`a component path to a function or a Javascript Value Locator to a function.`
	));
});

test('unvalidSourcesDirectory', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.unvalidSourcesDirectory, 'function');
	t.is(logs.unvalidSourcesDirectory({ sourcesDirectory: 42 }),
		`"42" is not a valid sources directory path. The path was found but it's not a directory.`
	);

	t.is(logs.unvalidSourcesDirectory({ sourcesDirectory: "hello" }),
		`"hello" is not a valid sources directory path. The path was found but it's not a directory.`
	);
});

test('unexistentSourcesDirectory', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.unexistentSourcesDirectory, 'function');
	t.is(logs.unexistentSourcesDirectory({ sourcesDirectory: 42 }),
		`"42" is not a valid sources directory path. The directory doesn't seem to exist.`
	);

	t.is(logs.unexistentSourcesDirectory({ sourcesDirectory: "hello" }),
		`"hello" is not a valid sources directory path. The directory doesn't seem to exist.`
	);
});

test('ensureCurrentWorkingDirectory', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.ensureCurrentWorkingDirectory, 'function');

	t.is(logs.ensureCurrentWorkingDirectory(),
		`Ensure that you are running the command in an appropriate current working directory.`
	);
});

test('generateNotCalledTimeout', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.generateNotCalledTimeout, 'function');
	t.is(logs.generateNotCalledTimeout({
		cli: {name: 'cli-name'},
		command: 'command-name',
		generator: 'gen-name',
		timeout: 220
	}), msg(
		`cli-name command-name detected an error in the generator "gen-name".`,
		`The generator "gen-name" doesn't have called yet the generate function`,
		`after a timeout of 220ms. Try to increase the timeout option when using`,
		`cli-name command-name, or check that the generator works correctly and`,
		`actually calls the generate function.`
	));

	t.is(logs.generateNotCalledTimeout({
		command: 'command-name-2',
		generator: function generatorName2(){return;},
		timeout: 42
	}), msg(
		`undefined command-name-2 detected an error in the generator "generatorName2".`,
		`The generator "generatorName2" doesn't have called yet the generate function`,
		`after a timeout of 42ms. Try to increase the timeout option when using`,
		`undefined command-name-2, or check that the generator works correctly and`,
		`actually calls the generate function.`
	));
});

test('generateFinishEventNotEmittedTimeout', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.generateFinishEventNotEmittedTimeout, 'function');
	t.is(logs.generateFinishEventNotEmittedTimeout({
		cli: {name:'cli-name'},
		command: 'command-name',
		generator: 'gen-name',
		timeout: 220
	}), msg(
		`cli-name command-name detected an error in the generator "gen-name".`,
		`The generator "gen-name" generate instance doesn't have emitted yet a`,
		`finish event after a timeout of 220ms. Try to increase the timeout option`,
		`when using cli-name command-name, or check that the generator works correctly`,
		`and actually calls the generate function.`
	));

	t.is(logs.generateFinishEventNotEmittedTimeout({
		command: 'command-name-2',
		generator: function generatorName2(){return;},
		timeout: 42
	}), msg(
		`undefined command-name-2 detected an error in the generator "generatorName2".`,
		`The generator "generatorName2" generate instance doesn't have emitted yet a`,
		`finish event after a timeout of 42ms. Try to increase the timeout option`,
		`when using undefined command-name-2, or check that the generator works correctly`,
		`and actually calls the generate function.`
	));
});

test('willRunGenerator', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.willRunGenerator, 'function');
	t.is(logs.willRunGenerator({
		cli: {name:'cli-test'},
		command: 'command-test',
		generator: 'path-to-generator',
		options: '{}'
	}), `cli-test command-test will run the generator "path-to-generator" with the options "{}".`);

	t.is(logs.willRunGenerator({
		command: 'command-test-2',
		generator: function generatorName2(){return;},
		options: '{key: 42}'
	}), `undefined command-test-2 will run the generator "generatorName2" with the options "{key: 42}".`);
});

test('hasRunnedGenerator', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.hasRunnedGenerator, 'function');
	t.is(logs.hasRunnedGenerator({
		cli: {name:'cli-test'},
		command: 'command-test',
		generator: 'path-to-generator',
		options: '{}'
	}), `cli-test command-test correctly runned the generator "path-to-generator" with the options "{}".`);

	t.is(logs.hasRunnedGenerator({
		command: 'command-test-2',
		generator: function generatorName2(){return;},
		options: '{key: 42}'
	}), `undefined command-test-2 correctly runned the generator "generatorName2" with the options "{key: 42}".`);
});

test('validSourcesDirectory', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.validSourcesDirectory, 'function');
	t.is(logs.validSourcesDirectory({
		sourcesDirectory: 'hello'
	}), `The sources directory at path "hello" is valid.`);

	t.is(logs.validSourcesDirectory({
		sourcesDirectory: 42
	}), `The sources directory at path "42" is valid.`);
});