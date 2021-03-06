'use strict';

const test = require('ava');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const logs = requireFromIndex('sources/settings/logs');

const errorsHandlingMacros = require('./check-sources-directory-errors-handling.macro');

/*--------------------*/

test('Type', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');

	t.is(typeof checkSourcesDirectory, 'function');
	t.is(checkSourcesDirectory.name, 'checkSourcesDirectoryCommand');
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

test('usage with an unexistent absolute sources directory',
	errorsHandlingMacros.unexistentAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/check-sources-directory.command')
);

test('usage with an unexistent relative sources directory',
	errorsHandlingMacros.unexistentRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/check-sources-directory.command')
);

test('usage with a not directory absolute sources directory',
	errorsHandlingMacros.notDirectoryAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/check-sources-directory.command')
);

test('usage with a not directory relative sources directory',
	errorsHandlingMacros.notDirectoryRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/check-sources-directory.command')
);

test('should work without stdout option', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');

	const sourcesDirectory = pathFromIndex('tests/mocks/sources-directory');

	const checkSourcesDirectoryResult = checkSourcesDirectory({
		sourcesDirectory
	});

	t.is(checkSourcesDirectoryResult, sourcesDirectory);

	const successLog = logs.validSourcesDirectory({sourcesDirectory});
});

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

test.todo('VANILLE TYPE DEPENDENT / usage with unvalid option sourcesDirectory');
test.todo('VANILLE TYPE DEPENDENT / usage with unvalid option stdout');

/*-----------------------*/

test.todo('STRINGABLE DEPENDENT / log enhancement using stringable');
test.todo('WAIT FOR BATTE TESTING / log enhancement');