'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');

const requireFromIndex = require('../../utils/require-from-index');

test.todo('Add type assertions to check parameters');

test('Type and content', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs, 'object');

	t.deepEqual(Object.keys(logs).sort(), [
		'listMatchingFilepaths',
		'componentFound',
		'componentNotFound',
		'noFilepathMatching',
		'manyFilepathsMatching',
		'unvalidGenerator',
		'unvalidSourcesDirectory',
		'unexistentSourcesDirectory',
		'ensureCurrentWorkingDirectory',
		'generateNotCalledTimeout',
		'generateFinishEventNotEmittedTimeout',
		'willRunGenerator',
		'hasRunnedGenerator',
		'validSourcesDirectory',
		'generatedFilesList'
	].sort());
});

test.skip('componentFound', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.componentFound, 'function');
	t.is(logs.componentFound({ componentPath: 'hello' }), msg(
		`Component "hello" found at path "undefined"`
	));

	t.is(logs.componentFound({ componentPath: 'rock-and-billy', fullComponentPath: 'hello-2' }), msg(
		`Component "rock-and-billy" found at path "hello-2"`
	));

	t.is(logs.componentFound({ componentPath: 'doe', fullComponentPath: 'full-filepath' }), msg(
		`Component "doe" found at path "full-filepath"`
	));

	t.is(logs.componentFound({
		componentPath: 'doe2',
		layer: 'generator',
		fullComponentPath: 'full-filepath2'
	}), msg(
		`Component generator "doe2" found at path "full-filepath2"`
	));

	t.is(logs.componentFound({
		componentPath: 'groot',
		layer: 'rocket launcher',
		fullComponentPath: 'pathTest'
	}), msg(
		`Component rocket launcher "groot" found at path "pathTest"`
	));
});

test('componentNotFound', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.componentNotFound, 'function');
	t.is(logs.componentNotFound({ componentPath: 'hello' }), msg(
		`Component "hello" not found.`
	));

	t.is(logs.componentNotFound({ componentPath: 'rock-and-billy' }), msg(
		`Component "rock-and-billy" not found.`
	));
});

test.todo('handle layer option');

test('noFilepathMatching', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.noFilepathMatching, 'function');
	t.is(logs.noFilepathMatching({ componentPath: 'hello' }), msg(
		`No filepath match the component path "hello".`
	));

	t.is(logs.noFilepathMatching({ componentPath: 'world.js' }), msg(
		`No filepath match the component path "world.js".`
	));
});

test.todo('handle layer option');

test('manyFilepathsMatching', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.manyFilepathsMatching, 'function');
	t.is(logs.manyFilepathsMatching({ componentPath: 'hello world' }), msg(
		`More than one filepath match the component path "hello world".`,
		`Try to use a more accurate component path.`
	));

	t.is(logs.manyFilepathsMatching({ componentPath: 'test.txt' }), msg(
		`More than one filepath match the component path "test.txt".`,
		`Try to use a more accurate component path.`
	));
});

test.todo('handle layer option');

test('listMatchingFilepaths', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.listMatchingFilepaths, 'function');
	t.is(logs.listMatchingFilepaths({
		componentPath: 'hello world',
		filepaths: ['puma warrior', 'superman vs batman']
	}), `The filepaths matching "hello world" are:\n\t- puma warrior\n\t- superman vs batman`);

	t.is(logs.listMatchingFilepaths({
		componentPath: 'hello',
		filepaths: ['rocket warrior', 'banana.banana.js', 'test']
	}), `The filepaths matching "hello" are:\n\t- rocket warrior\n\t- banana.banana.js\n\t- test`);

	t.is(logs.listMatchingFilepaths({
		componentPath: 'test-hello-again',
		filepaths: ['rocket warrior']
	}), `One filepath matchs "test-hello-again":\n\t- rocket warrior`);

	t.is(logs.listMatchingFilepaths({
		componentPath: 'test-hello-again-2',
		filepaths: ['rocket warrior']
	}), `One filepath matchs "test-hello-again-2":\n\t- rocket warrior`);

	t.is(logs.listMatchingFilepaths({
		componentPath: 'no/match/test',
		filepaths: []
	}), logs.noFilepathMatching({componentPath: 'no/match/test'}));
});

test.todo('handle layer option');

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

test('generatedFilesList', t => {
	const logs = requireFromIndex('sources/settings/logs');

	t.is(typeof logs.generatedFilesList, 'function');
	t.is(logs.generatedFilesList({ filesList: ['hello.js', 'test'] }),
		`The following files were generated:\n\t- hello.js\n\t- test`
	);

	t.is(logs.generatedFilesList({ filesList: ['hellobis.js', 'moretest', 'third.txt'] }),
		`The following files were generated:\n\t- hellobis.js\n\t- moretest\n\t- third.txt`
	);

	t.is(logs.generatedFilesList({ filesList: ['hellobis.js'] }),
		`The following file was generated:\n\t- hellobis.js`
	);

	t.is(logs.generatedFilesList({ filesList: [] }),
		`No file generated.`
	);

	t.is(logs.generatedFilesList({}),
		`No file generated.`
	);

	t.is(logs.generatedFilesList(),
		`No file generated.`
	);
});