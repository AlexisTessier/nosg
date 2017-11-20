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

async function usageMacro(t, {
	componentPath,
	expectedResult,
	sourcesDirectory,
	stdout = true
}) {
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');
	const stdoutBuffer = [];

	const cwd = sinon.stub(process, 'cwd').callsFake(() => {
		cwd.restore();
		return pathFromIndex('tests/mocks');
	});

	const listMatchingFilepathsPromise = listMatchingFilepaths({
		componentPath,
		sourcesDirectory,
		stdout: stdout ? mockWritableStream(stdoutBuffer) : undefined
	});

	t.true(listMatchingFilepathsPromise instanceof Promise);

	const listMatchingFilepathsResult = await listMatchingFilepathsPromise;

	t.true(listMatchingFilepathsResult instanceof Array);
	t.deepEqual(listMatchingFilepathsResult, expectedResult);

	t.is(stdoutBuffer.join(''), !stdout ? '' : [
		`LOG: List of filepaths matching "${componentPath}":`,
		...expectedResult.map(res => `\t- "${res}"`),
		''
	].join('\n'));
}

test('usage with a complete component path', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	]
});
test('usage with a complete component path with .js extension', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a.js',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	]
});
test('usage with a complete component path with no js extension', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a.txt',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.txt.js')
	]
});
test('usage with a complete component path and overriding sourcesDirectory', usageMacro, {
	componentPath: 'components-set-b/layer-a/custom-component-a',
	sourcesDirectory: 'custom-src-dir',
	expectedResult: [
		pathFromIndex('tests/mocks/custom-src-dir/components-set-b/layer-a/custom-component-a.js')
	]
});
test('usage with a complete component path matching a directory with a index.js in it', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-i',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-i/index.js')
	]
});
test('usage with a complete component path - matching no file', usageMacro, {
	componentPath: 'components-set-a/layer-w/component-x',
	expectedResult: []
});
test('usage with a complete component path - matching no file (try with a matching directory without index.js in it)', usageMacro, {
	componentPath: 'components-set-d/layer-a/component-f-dir',
	expectedResult: []
});
test('usage with a complete component path - matching no file (try with a matching no js file)', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-no-js',
	expectedResult: []
});
test('usage with a complete component path with extension - matching no file (try with a matching no js file)', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-no-js.txt',
	expectedResult: []
});
test('usage with a complete component path - matching no file (try with a matching extensionless file)', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-no-ext',
	expectedResult: []
});
test('usage with a complete component path - matching more than one file', usageMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double.js'),
		pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double/index.js')
	]
});

test('usage with a layer/component path', usageMacro, {
	componentPath: 'layer-a/comp-from-layer',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/comp-set-layer/layer-a/comp-from-layer.js')
	]
});
test('usage with a layer/component path and overriding sourcesDirectory', usageMacro, {
	componentPath: 'layer-a/comp-from-layer',
	sourcesDirectory: 'custom-src-dir',
	expectedResult: [
		pathFromIndex('tests/mocks/custom-src-dir/comp-set-layer/layer-a/comp-from-layer.js')
	]
});
test.todo('usage with a layer/component path matching a directory with a index.js in it');
test.todo('usage with a layer/component path - matching no file');
test.todo('usage with a layer/component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a layer/component path - matching no file (try with a matching no js file)');
test.todo('usage with a layer/component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a layer/component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a layer/component path - matching more than one file');

test('usage with a set:component path', usageMacro, {
	componentPath: 'comp-set-layer:comp-from-layer',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/comp-set-layer/layer-a/comp-from-layer.js')
	]
});
test.todo('usage with a set:component path and overriding sourcesDirectory');
test.todo('usage with a set:component path matching a directory with a index.js in it');
test.todo('usage with a set:component path - matching no file');
test.todo('usage with a set:component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a set:component path - matching no file (try with a matching no js file)');
test.todo('usage with a set:component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a set:component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a set:component path - matching more than one file');

test('usage with a set:component/nested path', usageMacro, {
	componentPath: 'with-nested-path:nested-component/deep',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep.js')
	]
});
test.todo('usage with a set:component/nested path and overriding sourcesDirectory');
test.todo('usage with a set:component/nested path matching a directory with a index.js in it');
test.todo('usage with a set:component/nested path - matching no file');
test.todo('usage with a set:component/nested path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a set:component/nested path - matching no file (try with a matching no js file)');
test.todo('usage with a set:component/nested path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a set:component/nested path - matching no file (try with a matching extensionless file)');
test.todo('usage with a set:component/nested path - matching more than one file');

test('usage with a set:component/deep/nested path', usageMacro, {
	componentPath: 'with-nested-path:nested-component/nested-deep-component/deep-deep',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/nested-deep-component/deep-deep.js')
	]
});
test.todo('usage with a set:component/nested path and overriding sourcesDirectory');
test.todo('usage with a set:component/nested path matching a directory with a index.js in it');
test.todo('usage with a set:component/nested path - matching no file');
test.todo('usage with a set:component/nested path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a set:component/nested path - matching no file (try with a matching no js file)');
test.todo('usage with a set:component/nested path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a set:component/nested path - matching no file (try with a matching extensionless file)');
test.todo('usage with a set:component/nested path - matching more than one file');

test('usage with a component name', usageMacro, {
	componentPath: 'unique-component',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/unique-component.js')
	]
});
test.todo('usage with a component name and overriding sourcesDirectory');
test.todo('usage with a component name matching a directory with a index.js in it');
test.todo('usage with a component name - matching no file');
test.todo('usage with a component name - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a component name - matching no file (try with a matching no js file)');
test.todo('usage with a component name with extension - matching no file (try with a matching no js file)');
test.todo('usage with a component name - matching no file (try with a matching extensionless file)');
test.todo('usage with a component name - matching more than one file');

test('usage with a nested component path', usageMacro, {
	componentPath: 'with-nested-path/nested-layer/nested-component/deep',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep.js')
	]
});
test.todo('usage with a nested component path and overriding sourcesDirectory');
test.todo('usage with a nested component path matching a directory with a index.js in it');
test.todo('usage with a nested component path - matching no file');
test.todo('usage with a nested component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a nested component path - matching no file (try with a matching no js file)');
test.todo('usage with a nested component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a nested component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a nested component path - matching more than one file');

test('usage with a deep nested component path', usageMacro, {
	componentPath: 'with-nested-path/nested-layer/nested-component/nested-deep-component/deep-deep',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/nested-deep-component/deep-deep.js')
	]
});
test.todo('usage with a deep nested component path and overriding sourcesDirectory');
test.todo('usage with a deep nested component path matching a directory with a index.js in it');
test.todo('usage with a deep nested component path - matching no file');
test.todo('usage with a deep nested component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a deep nested component path - matching no file (try with a matching no js file)');
test.todo('usage with a deep nested component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a deep nested component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a deep nested component path - matching more than one file');

test('usage with an absolute component path', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/components-set-c/layer-a/generator-component-a'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-c/layer-a/generator-component-a.js')
	]
});
test.todo('usage with an absolute component path and overriding sourcesDirectory');
test.todo('usage with an absolute component path matching a directory with a index.js in it');
test.todo('usage with an absolute component path - matching no file');
test.todo('usage with an absolute component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with an absolute component path - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component path - matching no file (try with a matching extensionless file)');
test.todo('usage with an absolute component path - matching more than one file');

test('usage with an absolute component nested path', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep.js')
	]
});
test.todo('usage with an absolute component nested path and overriding sourcesDirectory');
test.todo('usage with an absolute component nested path matching a directory with a index.js in it');
test.todo('usage with an absolute component nested path - matching no file');
test.todo('usage with an absolute component nested path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with an absolute component nested path - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component nested path with extension - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component nested path - matching no file (try with a matching extensionless file)');
test.todo('usage with an absolute component nested path - matching more than one file');

test('usage with an absolute component glob', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/components-set-b/layer-a/*'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-b/layer-a/generator-component-a.js')
	]
});
test.todo('usage with an absolute component glob and overriding sourcesDirectory');
test.todo('usage with an absolute component glob matching a directory with a index.js in it');
test.todo('usage with an absolute component glob - matching no file');
test.todo('usage with an absolute component glob - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with an absolute component glob - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob with extension - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob - matching no file (try with a matching extensionless file)');
test.todo('usage with an absolute component glob - matching more than one file');

test('usage with an absolute component glob nested', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/with-nested-path/*/*/*'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep.js')
	]
});
test.todo('usage with an absolute component glob nested and overriding sourcesDirectory');
test.todo('usage with an absolute component glob nested matching a directory with a index.js in it');
test.todo('usage with an absolute component glob nested - matching no file');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob nested with extension - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching extensionless file)');
test.todo('usage with an absolute component glob nested - matching more than one file');

test('usage with an absolute component glob nested deep', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/with-nested-path/*/*/*/*'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/nested-deep-component/deep-deep.js')
	]
});
test.todo('usage with an absolute component glob nested and overriding sourcesDirectory');
test.todo('usage with an absolute component glob nested matching a directory with a index.js in it');
test.todo('usage with an absolute component glob nested - matching no file');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob nested with extension - matching no file (try with a matching no js file)');
test.todo('usage with an absolute component glob nested - matching no file (try with a matching extensionless file)');
test.todo('usage with an absolute component glob nested - matching more than one file');

test('usage with a relative component glob', usageMacro, {
	componentPath: 'components-set-b/layer-a/*',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-b/layer-a/generator-component-a.js')
	]
});
test.todo('usage with a relative component glob and overriding sourcesDirectory');
test.todo('usage with a relative component glob matching a directory with a index.js in it');
test.todo('usage with a relative component glob - matching no file');
test.todo('usage with a relative component glob - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a relative component glob - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob with extension - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob - matching no file (try with a matching extensionless file)');
test.todo('usage with a relative component glob - matching more than one file');

test('usage with a relative component glob nested', usageMacro, {
	componentPath: 'with-nested-path/*/*/*',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/deep.js')
	]
});
test.todo('usage with a relative component glob nested and overriding sourcesDirectory');
test.todo('usage with a relative component glob nested matching a directory with a index.js in it');
test.todo('usage with a relative component glob nested - matching no file');
test.todo('usage with a relative component glob nested - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a relative component glob nested - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob nested with extension - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob nested - matching no file (try with a matching extensionless file)');
test.todo('usage with a relative component glob nested - matching more than one file');

test('usage with a relative component glob nested deep', usageMacro, {
	componentPath: 'with-nested-path/*/*/*/*',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/with-nested-path/nested-layer/nested-component/nested-deep-component/deep-deep.js')
	]
});
test.todo('usage with a relative component glob nested deep and overriding sourcesDirectory');
test.todo('usage with a relative component glob nested deep matching a directory with a index.js in it');
test.todo('usage with a relative component glob nested deep - matching no file');
test.todo('usage with a relative component glob nested deep - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a relative component glob nested deep - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob nested deep with extension - matching no file (try with a matching no js file)');
test.todo('usage with a relative component glob nested deep - matching no file (try with a matching extensionless file)');
test.todo('usage with a relative component glob nested deep - matching more than one file');

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

test('should work without stdout', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	],
	stdout: false
});

test.cb('should reject when error in glob', t => {
	// mock an error from glob
	const fs = require('fs');
	const readdir = sinon.stub(fs, 'readdir').callsFake((path, cb) => {
		readdir.restore();
		cb(new Error('readdir error mock'));
	});

	// ensure glob is used in silent mode
	const consoleError = sinon.stub(console, 'error').callsFake(()=>{
		consoleError.restore();
		t.fail();
	});
	
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');

	const listMatchingFilepathsPromise = listMatchingFilepaths({
		componentPath: 'set://::unvalid;;:-+%'
	});

	t.true(listMatchingFilepathsPromise instanceof Promise);

	listMatchingFilepathsPromise.then(()=>t.fail()).catch(err=>{
		t.true(err instanceof Error);
		t.is(err.message, 'readdir error mock');
		t.end();
	});
});

test.todo('VANILLE TYPE DEPENDENT / unvalid parameters');
test.todo('VANILLE TYPE DEPENDENT / unvalid component path');
test.todo('VANILLE TYPE DEPENDENT / unvalid sources directory');