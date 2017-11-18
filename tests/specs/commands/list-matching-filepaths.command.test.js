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

	t.is(stdoutBuffer.join(''), '');
}

test('usage with a complete component path', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	fakeSourcesParentDirectory: pathFromIndex('tests/mocks'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	]
});
test.todo('usage with a complete component path and overriding sourcesDirectory');
test.todo('usage with a complete component path - matching no file');
test.todo('usage with a complete component path - matching no file (try with a matching directory)');
test.todo('usage with a complete component path - matching no file (try with a matching no js file)');
test.todo('usage with a complete component path - matching no file (try with a matching extensionless file)');

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

test.todo('unvalid parameters')

test.todo('unvalid component path');

test.todo('unvalid sources directory');

