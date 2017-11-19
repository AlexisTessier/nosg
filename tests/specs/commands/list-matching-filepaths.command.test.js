'use strict';

const test = require('ava');

const sinon = require('sinon');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

test('Type', t => {
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');

	t.is(typeof listMatchingFilepaths, 'function');
});

/*--------------------------*/

function usageMacro(t, {
	componentPath,
	expectedResult,
	sourcesDirectory,
	fakeSourcesParentDirectory
}) {
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');
	const stdoutBuffer = [];

	if (fakeSourcesParentDirectory) {
		const cwd = sinon.stub(process, 'cwd').callsFake(() => {
			cwd.restore();
			return fakeSourcesParentDirectory;
		});
	}

	const listMatchingFilepathsResult = listMatchingFilepaths({
		componentPath,
		sourcesDirectory,
		stdout: mockWritableStream(stdoutBuffer)
	});

	t.true(listMatchingFilepathsResult instanceof Array);
	t.deepEqual(listMatchingFilepathsResult, expectedResult);

	t.is(stdoutBuffer.join(''), [
		`LOG: List of filepaths matching "${componentPath}":`,
		...expectedResult.map(res => `\t- "${res}"`),
		''
	].join('\n'));
}

test('usage with a complete component path', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	]
});
test('usage with a complete component path matching a directory with a index.js in it', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-i',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-i/index.js')
	]
});
test('usage with a complete component path and overriding sourcesDirectory', usageMacro, {
	componentPath: 'components-set-b/layer-a/custom-component-a',
	sourcesDirectory: 'custom-src-dir',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: [
		pathFromIndex('tests/mocks/custom-src-dir/components-set-b/layer-a/custom-component-a.js')
	]
});
test('usage with a complete component path - matching no file', usageMacro, {
	componentPath: 'components-set-a/layer-w/component-x',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: []
});
test('usage with a complete component path - matching no file (try with a matching directory without index.js in it)', usageMacro, {
	componentPath: 'components-set-d/layer-a/component-f-dir',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: []
});
test.todo('usage with a complete component path - matching no file (try with a matching no js file)');
test.todo('usage with a complete component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a complete component path - matching more than one file');

test.todo('usage with a layer/component path');
test.todo('usage with a layer/component path and overriding sourcesDirectory');
test.todo('usage with a layer/component path - matching no file');
test.todo('usage with a layer/component path - matching more than one file');

test.todo('usage with a set:component path');
test.todo('usage with a set:component path and overriding sourcesDirectory');
test.todo('usage with a set:component path - matching no file');
test.todo('usage with a set:component path - matching more than one file');

test.todo('usage with a component name');
test.todo('usage with a component name and overriding sourcesDirectory');
test.todo('usage with a component name - matching no file');
test.todo('usage with a component name - matching more than one file');

test.todo('usage with a nested component path');
test.todo('usage with a nested component path and overriding sourcesDirectory');
test.todo('usage with a nested component path');
test.todo('usage with a nested component path - matching no file');

/*--------------------------*/

test.todo('usage with an absolute Javascript Value Locator (string)');
test.todo('usage with a relative Javascript Value Locator (string)');
test.todo('usage with an absolute Javascript Value Locator (string) - matching no file');
test.todo('usage with a relative Javascript Value Locator (string) - matching no file');

test.todo('usage with an absolute Javascript Value Locator (object)');
test.todo('usage with a relative Javascript Value Locator (object)');
test.todo('usage with an absolute Javascript Value Locator (object) - matching no file');
test.todo('usage with a relative Javascript Value Locator (object) - matching no file');

/*--------------------------*/

test.skip('Trying to use an unexistent absolute sourcesDirectory must throw error', t => {
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

	t.is(unexistentAbsolutePathError.message, logs.unexistentSourcesDirectory({sourcesDirectory: unexistentAbsolutePath}));
});

test.skip('Trying to use an unexistent relative sourcesDirectory must throw error', t => {
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
		logs.unexistentSourcesDirectory({sourcesDirectory: pathFromIndex(unexistentRelativePath)}),
		logs.ensureCurrentWorkingDirectory()
	));
});

test.skip('Trying to use an absolute path to a non directory sourcesDirectory must throw error', t => {
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

	t.is(notDirectoryAbsolutePathError.message, logs.unvalidSourcesDirectory({sourcesDirectory: notDirectoryAbsolutePath}));
});

test.skip('Trying to use a relative path to a non directory sourcesDirectory must throw error', t => {
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
		logs.unvalidSourcesDirectory({sourcesDirectory: pathFromIndex(notDirectoryRelativePath)}),
		logs.ensureCurrentWorkingDirectory()
	));
});

/*--------------------------*/

test.todo('should work without stdout');

test.todo('VANILLE TYPE DEPENDENT / unvalid parameters');
test.todo('VANILLE TYPE DEPENDENT / unvalid component path');
test.todo('VANILLE TYPE DEPENDENT / unvalid sources directory');