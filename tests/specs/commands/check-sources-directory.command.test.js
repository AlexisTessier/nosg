'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');
const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const logs = requireFromIndex('sources/settings/logs');

test('Type', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');

	t.is(typeof checkSourcesDirectory, 'function');
});

test('usage with an absolute valid sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const sourcesDirectory = pathFromIndex('tests/mocks/sources-directory');

	const checkSourcesDirectoryResult = checkSourcesDirectory({
		sourcesDirectory,
		stdout: mockWritableStream(stdoutBuffer)
	});

	t.is(checkSourcesDirectoryResult, sourcesDirectory);

	const successLog = logs.validSourcesDirectory({sourcesDirectory});
	t.is(stdoutBuffer.join(''), `SUCCESS: ${successLog}\n`);
});

test('usage with a relative valid sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const sourcesDirectory = 'tests/mocks/sources-directory';

	const checkSourcesDirectoryResult = checkSourcesDirectory({
		sourcesDirectory,
		stdout: mockWritableStream(stdoutBuffer)
	});

	t.is(checkSourcesDirectoryResult, pathFromIndex(sourcesDirectory));

	const successLog = logs.validSourcesDirectory({sourcesDirectory: pathFromIndex(sourcesDirectory)});
	t.is(stdoutBuffer.join(''), `SUCCESS: ${successLog}\n`);
});

test('usage with a valid sources directory - default value', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const checkSourcesDirectoryResult = checkSourcesDirectory({
		stdout: mockWritableStream(stdoutBuffer)
	});

	t.is(checkSourcesDirectoryResult, pathFromIndex('sources'));

	const successLog = logs.validSourcesDirectory({sourcesDirectory: pathFromIndex('sources')});
	t.is(stdoutBuffer.join(''), `SUCCESS: ${successLog}\n`);
});

/*----------------*/

test('usage with an unexistent absolute sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const unexistentAbsolutePath = pathFromIndex('tests/mocks/unexistent/sources/directory/path');

	const unexistentAbsolutePathError = t.throws(() => {
		checkSourcesDirectory({
			sourcesDirectory: unexistentAbsolutePath,
			stdout: mockWritableStream()
		});
	});

	t.is(unexistentAbsolutePathError.message, logs.unexistentSourcesDirectory({sourcesDirectory: unexistentAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
});

test('usage with an unexistent relative sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const unexistentRelativePath = 'tests/mocks/unexistent/sources/directory/path'

	const unexistentRelativePathError = t.throws(() => {
		checkSourcesDirectory({
			sourcesDirectory: unexistentRelativePath,
			stdout: mockWritableStream()
		});
	});

	t.is(unexistentRelativePathError.message, logs.unexistentSourcesDirectory({
		sourcesDirectory: pathFromIndex(unexistentRelativePath)
	}));

	t.is(stdoutBuffer.join(''), '');
});

test('usage with a not directory absolute sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const unvalidAbsolutePath = pathFromIndex('tests/mocks/not-a-directory');

	const unvalidAbsolutePathError = t.throws(() => {
		checkSourcesDirectory({
			sourcesDirectory: unvalidAbsolutePath,
			stdout: mockWritableStream()
		});
	});

	t.is(unvalidAbsolutePathError.message, logs.unvalidSourcesDirectory({sourcesDirectory: unvalidAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
});

test('usage with a not directory relative sources directory', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');
	const stdoutBuffer = [];

	const unvalidRelativePath = 'tests/mocks/not-a-directory';

	const unvalidRelativePathError = t.throws(() => {
		checkSourcesDirectory({
			sourcesDirectory: unvalidRelativePath,
			stdout: mockWritableStream()
		});
	});

	t.is(unvalidRelativePathError.message, logs.unvalidSourcesDirectory({
		sourcesDirectory: pathFromIndex(unvalidRelativePath)
	}));

	t.is(stdoutBuffer.join(''), '');
});

test.todo('should work without stdout option');

/*-----------------------*/

function unvalidParametersMacro(t, unvalidParameters, errorMessage) {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');

	const unvalidParametersError = t.throws(() => {
		checkSourcesDirectory(...unvalidParameters);
	});

	t.true(unvalidParametersError instanceof TypeError);
	t.is(unvalidParametersError.message, errorMessage);
}

test('usage with unvalid parameters - number', unvalidParametersMacro, [42], 
	`42 (number) is not a valid option object.`
);
test('usage with unvalid parameters - string', unvalidParametersMacro, ["hello"], 
	`hello (string) is not a valid option object.`
);
test('usage with unvalid parameters - true', unvalidParametersMacro, [true], 
	`true (boolean) is not a valid option object.`
);
test('usage with unvalid parameters - false', unvalidParametersMacro, [false], 
	`false (boolean) is not a valid option object.`
);
test('usage with unvalid parameters - function', unvalidParametersMacro, [function notObject(){return;}], 
	`function notObject() {\n\treturn;\n} (function) is not a valid option object.`
);
test('usage with unvalid parameters - array', unvalidParametersMacro, [[]], 
	` (object) is not a valid option object.`
);

test.todo('usage with unvalid option sourcesDirectory');
test.todo('usage with unvalid option stdout');

/*-----------------------*/

test.todo('log enhancement using stringable');
test.todo('log enhancement');