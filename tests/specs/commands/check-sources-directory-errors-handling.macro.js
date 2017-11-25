'use strict';

const msg = require('@alexistessier/msg');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const logs = requireFromIndex('sources/settings/logs');

/*--------------------*/

function unexistentAbsoluteSourcesDirectoryMacro(t, command, options = {}){
	const stdoutBuffer = [];

	const unexistentAbsolutePath = pathFromIndex('tests/mocks/unexistent/sources/directory/path');

	const unexistentAbsolutePathError = t.throws(() => {
		command(Object.assign({
			sourcesDirectory: unexistentAbsolutePath,
			stdout: mockWritableStream(stdoutBuffer)
		}, options));
	});

	t.is(unexistentAbsolutePathError.message, logs.unexistentSourcesDirectory({sourcesDirectory: unexistentAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
}

function unexistentRelativeSourcesDirectoryMacro(t, command, options = {}){
	const stdoutBuffer = [];

	const unexistentRelativePath = 'tests/mocks/unexistent/sources/directory/path'

	const unexistentRelativePathError = t.throws(() => {
		command(Object.assign({
			sourcesDirectory: unexistentRelativePath,
			stdout: mockWritableStream(stdoutBuffer)
		}, options));
	});

	t.is(unexistentRelativePathError.message, msg(
		logs.unexistentSourcesDirectory({
			sourcesDirectory: pathFromIndex(unexistentRelativePath)
		}), logs.ensureCurrentWorkingDirectory()
	));

	t.is(stdoutBuffer.join(''), '');
}

function notDirectoryAbsoluteSourcesDirectoryMacro(t, command, options = {}){
	const stdoutBuffer = [];

	const unvalidAbsolutePath = pathFromIndex('tests/mocks/not-a-directory');

	const unvalidAbsolutePathError = t.throws(() => {
		command(Object.assign({
			sourcesDirectory: unvalidAbsolutePath,
			stdout: mockWritableStream(stdoutBuffer)
		}, options));
	});

	t.is(unvalidAbsolutePathError.message, logs.unvalidSourcesDirectory({sourcesDirectory: unvalidAbsolutePath}));

	t.is(stdoutBuffer.join(''), '');
}

function notDirectoryRelativeSourcesDirectoryMacro(t, command, options = {}){
	const stdoutBuffer = [];

	const unvalidRelativePath = 'tests/mocks/not-a-directory';

	const unvalidRelativePathError = t.throws(() => {
		command(Object.assign({
			sourcesDirectory: unvalidRelativePath,
			stdout: mockWritableStream(stdoutBuffer)
		}, options));
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