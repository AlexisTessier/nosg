'use strict';

const test = require('ava');

const sinon = require('sinon');

const msg = require('@alexistessier/msg');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const checkSourcesDirectoryErrorsHandlingMacros = require('./check-sources-directory-errors-handling.macro');

const logs = requireFromIndex('sources/settings/logs');

/*------------------*/

test('Type', t => {
	const getComponent = requireFromIndex('sources/commands/get-component.command');

	t.is(typeof getComponent, 'function');
	t.is(getComponent.name, 'getComponentCommand');
});

/*------------------*/

async function usageMacro(t, {
	componentPath,
	layer,
	expectedResultPath,
	sourcesDirectory,
	expectedResultType = 'function',
	stdout = true
}) {
	const getComponent = requireFromIndex('sources/commands/get-component.command');
	const stdoutBuffer = [];

	const expectedResult = require(expectedResultPath);
	t.is(typeof expectedResult, expectedResultType);

	const cwd = sinon.stub(process, 'cwd').callsFake(() => {
		cwd.restore();
		return pathFromIndex('tests/mocks');
	});

	const getComponentPromise = getComponent({
		componentPath,
		layer,
		sourcesDirectory,
		stdout: stdout ? mockWritableStream(stdoutBuffer) : undefined
	});

	t.true(getComponentPromise instanceof Promise);

	const getComponentPromiseResult = await getComponentPromise;

	t.is(getComponentPromiseResult, expectedResult);

	t.is(stdoutBuffer.join(''), !stdout ? '' :
		`LOG: Component "${componentPath}" found at path "${expectedResultPath}"\n`
	);
}

async function usageErrorMacro(t, {
	componentPath,
	layer,
	errorMessage,
	sourcesDirectory,
	stdout = true
}) {
	const getComponent = requireFromIndex('sources/commands/get-component.command');
	const stdoutBuffer = [];

	t.plan(4);

	const cwd = sinon.stub(process, 'cwd').callsFake(() => {
		cwd.restore();
		return pathFromIndex('tests/mocks');
	});

	const getComponentPromise = getComponent({
		componentPath,
		layer,
		sourcesDirectory,
		stdout: stdout ? mockWritableStream(stdoutBuffer) : undefined
	});

	t.true(getComponentPromise instanceof Promise);

	try{
		await getComponentPromise;
		t.fail();
	}
	catch(err){
		t.true(err instanceof Error);
		t.is(err.message, errorMessage);
	}

	t.is(stdoutBuffer.join(''), !stdout ? '' : ``);
}

/*------------------*/

test('usage with a complete component path', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
});
test('usage with a complete component path and layer option', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	layer: 'layer-a',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
});
test('usage with a complete component path with .js extension', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a.js',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
});
test('usage with a complete component path with no js extension', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a.txt',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.txt.js')
});
test('usage with a complete component path and overriding sourcesDirectory', usageMacro, {
	componentPath: 'components-set-b/layer-a/custom-component-a',
	sourcesDirectory: 'custom-src-dir',
	expectedResultPath: pathFromIndex('tests/mocks/custom-src-dir/components-set-b/layer-a/custom-component-a.js')
});
test('usage with a complete component path matching a directory with a index.js in it', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-i',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-i/index.js')
});
test('usage with a complete component path - matching no file', usageErrorMacro, {
	componentPath: 'components-set-a/layer-w/component-x',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-a/layer-w/component-x'}),
		logs.noFilepathMatching({componentPath: 'components-set-a/layer-w/component-x'}),
		logs.ensureCurrentWorkingDirectory()
	)
});
test('usage with a complete component path - matching no file (try with a matching directory without index.js in it)', usageErrorMacro, {
	componentPath: 'components-set-d/layer-a/component-f-dir',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-d/layer-a/component-f-dir'}),
		logs.noFilepathMatching({componentPath: 'components-set-d/layer-a/component-f-dir'}),
		logs.ensureCurrentWorkingDirectory()
	)
});
test('usage with a complete component path - matching no file (try with a matching no js file)', usageErrorMacro, {
	componentPath: 'components-set-a/layer-a/component-no-js',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-a/layer-a/component-no-js'}),
		logs.noFilepathMatching({componentPath: 'components-set-a/layer-a/component-no-js'}),
		logs.ensureCurrentWorkingDirectory()
	)
});
test('usage with a complete component path with extension - matching no file (try with a matching no js file)', usageErrorMacro, {
	componentPath: 'components-set-a/layer-a/component-no-js.txt',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-a/layer-a/component-no-js.txt'}),
		logs.noFilepathMatching({componentPath: 'components-set-a/layer-a/component-no-js.txt'}),
		logs.ensureCurrentWorkingDirectory()
	)
});
test('usage with a complete component path - matching no file (try with a matching extensionless file)', usageErrorMacro, {
	componentPath: 'components-set-a/layer-a/component-no-ext',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-a/layer-a/component-no-ext'}),
		logs.noFilepathMatching({componentPath: 'components-set-a/layer-a/component-no-ext'}),
		logs.ensureCurrentWorkingDirectory()
	)
});
test('usage with a complete component path - matching more than one file', usageErrorMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.manyFilepathsMatching({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.listMatchingFilepaths({
			componentPath: 'components-set-d/layer-double/component-double',
			filepaths: [
				pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double.js'),
				pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double/index.js')
			]
		})
	)
});
test('usage with a complete component path and layer option - too many results', usageErrorMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	layer: 'layer-double',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.manyFilepathsMatching({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.listMatchingFilepaths({
			componentPath: 'components-set-d/layer-double/component-double',
			filepaths: [
				pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double.js'),
				pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double/index.js')
			]
		})
	)
});
test('usage with a complete component path and layer option - no results', usageErrorMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	layer: 'layer-a',
	errorMessage: msg(
		logs.componentNotFound({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.noFilepathMatching({componentPath: 'components-set-d/layer-double/component-double'}),
		logs.ensureCurrentWorkingDirectory()
	)
});

/*------------------*/

test.skip('usage with a layer/component path', usageMacro, {
	componentPath: 'layer-a/comp-from-layer',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/comp-set-layer/layer-a/comp-from-layer.js')
	]
});
test.skip('usage with a layer/component path and overriding sourcesDirectory', usageMacro, {
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

/*------------------*/

test.skip('usage with a set:component path', usageMacro, {
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

/*------------------*/

test.skip('usage with a set:component/nested path', usageMacro, {
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

/*------------------*/

test.skip('usage with a set:component/deep/nested path', usageMacro, {
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

/*------------------*/

test.skip('usage with a component name', usageMacro, {
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

/*------------------*/

test.skip('usage with a nested component path', usageMacro, {
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

/*------------------*/

test.skip('usage with a deep nested component path', usageMacro, {
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

/*------------------*/

test.skip('usage with an absolute component path', usageMacro, {
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

/*------------------*/

test.skip('usage with an absolute component nested path', usageMacro, {
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

/*------------------*/

test.skip('usage with an absolute component glob', usageMacro, {
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

/*------------------*/

test.skip('usage with an absolute component glob nested', usageMacro, {
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

/*------------------*/

test.skip('usage with an absolute component glob nested deep', usageMacro, {
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

/*------------------*/

test.skip('usage with a relative component glob', usageMacro, {
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

/*------------------*/

test.skip('usage with a relative component glob nested', usageMacro, {
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

/*------------------*/

test.skip('usage with a relative component glob nested deep', usageMacro, {
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

/*------------------*/

test.todo('handle JVL here');

/*--------------------------*/

test('Trying to use an unexistent absolute sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.unexistentAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/get-component.command')
);

test('Trying to use an unexistent relative sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.unexistentRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/get-component.command')
);

test('Trying to use an absolute path to a non directory sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/get-component.command')
);

test('Trying to use a relative path to a non directory sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/get-component.command')
);

/*--------------------------*/

test('should work without stdout', usageMacro, {
	componentPath: 'components-set-a/layer-a/component-a',
	expectedResultPath: pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js'),
	stdout: false
});

test.cb.skip('should reject when error in glob', t => {
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
