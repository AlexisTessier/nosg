'use strict';

const msg = require('@alexistessier/msg');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const logs = requireFromIndex('sources/settings/logs');

/*--------------------*/

function unexistentAbsoluteSourcesDirectoryMacro(t, command){
	const stdoutBuffer = [];

	const unexistentAbsolutePath = pathFromIndex('tests/mocks/unexistent/sources/directory/path');

	const unexistentAbsolutePathError = t.throws(() => {
		command({
			sourcesDirectory: unexistentAbsolutePath,
			stdout: mockWritableStream(stdoutBuffer)
		});
	});

	t.is(unexistentAbsolutePathError.message, logs.unexistentSourcesDirectory({sourcesDirectory: unexistentAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
}

function unexistentRelativeSourcesDirectoryMacro(t, command){
	const stdoutBuffer = [];

	const unexistentRelativePath = 'tests/mocks/unexistent/sources/directory/path'

	const unexistentRelativePathError = t.throws(() => {
		command({
			sourcesDirectory: unexistentRelativePath,
			stdout: mockWritableStream(stdoutBuffer)
		});
	});

	t.is(unexistentRelativePathError.message, msg(
		logs.unexistentSourcesDirectory({
			sourcesDirectory: pathFromIndex(unexistentRelativePath)
		}), logs.ensureCurrentWorkingDirectory()
	));

	t.is(stdoutBuffer.join(''), '');
}

function notDirectoryAbsoluteSourcesDirectoryMacro(t, command){
	const stdoutBuffer = [];

	const unvalidAbsolutePath = pathFromIndex('tests/mocks/not-a-directory');

	const unvalidAbsolutePathError = t.throws(() => {
		command({
			sourcesDirectory: unvalidAbsolutePath,
			stdout: mockWritableStream(stdoutBuffer)
		});
	});

	t.is(unvalidAbsolutePathError.message, logs.unvalidSourcesDirectory({sourcesDirectory: unvalidAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
}

function notDirectoryRelativeSourcesDirectoryMacro(t, command){
	const stdoutBuffer = [];

	const unvalidRelativePath = 'tests/mocks/not-a-directory';

	const unvalidRelativePathError = t.throws(() => {
		command({
			sourcesDirectory: unvalidRelativePath,
			stdout: mockWritableStream(stdoutBuffer)
		});
	});

	t.is(unvalidRelativePathError.message, msg(
		logs.unvalidSourcesDirectory({
			sourcesDirectory: pathFromIndex(unvalidRelativePath)
		}), logs.ensureCurrentWorkingDirectory()
	));

	t.is(stdoutBuffer.join(''), '');
}

module.exports = {
	unexistentAbsoluteSourcesDirectoryMacro,
	unexistentRelativeSourcesDirectoryMacro,
	notDirectoryAbsoluteSourcesDirectoryMacro,
	notDirectoryRelativeSourcesDirectoryMacro
};