'use strict';

const test = require('ava');

const sinon = require('sinon');

const pathFromIndex = require('../../utils/path-from-index');
const requireFromIndex = require('../../utils/require-from-index');

const mockWritableStream = requireFromIndex('tests/mocks/mock-writable-stream');

const checkSourcesDirectoryErrorsHandlingMacros = require('./check-sources-directory-errors-handling.macro');

test('Type', t => {
	const listMatchingFilepaths = requireFromIndex('sources/commands/list-matching-filepaths.command');

	t.is(typeof listMatchingFilepaths, 'function');
	t.is(listMatchingFilepaths.name, 'listMatchingFilepathsCommand');
});

/*--------------------------*/

async function usageMacro(t, {
	componentPath,
	expectedResult,
	layer,
	componentsSet,
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
		layer,
		componentsSet,
		sourcesDirectory,
		stdout: stdout ? mockWritableStream(stdoutBuffer) : undefined
	});

	t.true(listMatchingFilepathsPromise instanceof Promise);

	const listMatchingFilepathsResult = await listMatchingFilepathsPromise;

	t.true(listMatchingFilepathsResult instanceof Array);
	t.deepEqual(listMatchingFilepathsResult, expectedResult.sort());

	t.is(stdoutBuffer.join(''), !stdout ? '' : [
		`LOG: List of filepaths matching "${componentPath}":`,
		...expectedResult.sort().map(res => `\t- "${res}"`),
		''
	].join('\n'));
}

/*------------------*/

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
test('usage with a complete component path and layer option - results', usageMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	layer: 'layer-double',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double.js'),
		pathFromIndex('tests/mocks/sources/components-set-d/layer-double/component-double/index.js')
	]
});
test('usage with a complete component path and layer option - no results', usageMacro, {
	componentPath: 'components-set-d/layer-double/component-double',
	layer: 'layer-a',
	expectedResult: []
});

/*------------------*/

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
test('usage with a layer/component path matching a directory with a index.js in it', usageMacro, {
	componentPath: 'cslayer/compindex',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/olga/cslayer/compindex/index.js')
	]
});
test.todo('usage with a layer/component path - matching no file');
test.todo('usage with a layer/component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a layer/component path - matching no file (try with a matching no js file)');
test.todo('usage with a layer/component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a layer/component path - matching no file (try with a matching extensionless file)');
test.todo('usage with a layer/component path - matching more than one file');

/*------------------*/

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
test('usage with a set:component path - matching more than one file', usageMacro, {
	componentPath: 'components-set-a:component-a',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/components-set-a/layer-b/component-a.js')
	]
});
test('usage with a set:component path and layer option - results', usageMacro, {
	componentPath: 'components-set-a:component-a',
	layer: 'layer-a',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js')
	]
});
test('usage with a set:component path and layer option - no results', usageMacro, {
	componentPath: 'components-set-a:component-a',
	layer: 'layer-x',
	expectedResult: []
});

/*------------------*/

test('usage with a set/*/component path', usageMacro, {
	componentPath: 'comp-set-layer/*/comp-from-layer',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/comp-set-layer/layer-a/comp-from-layer.js')
	]
});
test.todo('usage with a set/*/component path and overriding sourcesDirectory');
test.todo('usage with a set/*/component path matching a directory with a index.js in it');
test.todo('usage with a set/*/component path - matching no file');
test.todo('usage with a set/*/component path - matching no file (try with a matching directory without index.js in it)');
test.todo('usage with a set/*/component path - matching no file (try with a matching no js file)');
test.todo('usage with a set/*/component path with extension - matching no file (try with a matching no js file)');
test.todo('usage with a set/*/component path - matching no file (try with a matching extensionless file)');
test('usage with a set/*/component path - matching more than one file', usageMacro, {
	componentPath: 'components-set-a/*/component-a',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/components-set-a/layer-b/component-a.js')
	]
});
test('usage with a set/*/component path and layer option - results', usageMacro, {
	componentPath: 'components-set-a/*/component-a',
	layer: 'layer-b',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-a/layer-b/component-a.js')
	]
});
test('usage with a set/*/component path and layer option - no result', usageMacro, {
	componentPath: 'components-set-a/*/component-a',
	layer: 'layer-xx',
	expectedResult: []
});

/*------------------*/

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

/*------------------*/

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

/*------------------*/

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

/*------------------*/

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

/*------------------*/

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

/*------------------*/

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

test('usage with an absolute component path - matching more than one file', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa.js'),
		pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa/index.js')
	]
});

test('usage with an absolute component path should ignore the layer option', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa'),
	layer: 'absolute-path-dont-care',
	expectedResult: [
		pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa.js'),
		pathFromIndex('tests/mocks/sources/components-set-oo/layo/compa/index.js')
	]
});

/*------------------*/

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

/*------------------*/

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
test('usage with an absolute component glob path and layer option with some traps - layer option should be ignored because path is absolute', usageMacro, {
	componentPath: pathFromIndex('tests/mocks/sources/traps/**/component-a'),
	layer: 'layer-b',
	sourcesDirectory: pathFromIndex('tests/mocks/sources/traps'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/traps/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/test/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-c/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-c/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-c/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-c/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-c/trap/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/trap/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-a/trap/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/test/component-a.js')
	]
});

/*------------------*/

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

/*------------------*/

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

/*------------------*/

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
test('usage with an relative component glob path and layer option with some traps - results', usageMacro, {
	componentPath: '**/component-a',
	layer: 'layer-b',
	sourcesDirectory: pathFromIndex('tests/mocks/sources/traps'),
	expectedResult: [
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-a/layer-b/test/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/index.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/component-a/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/layer-b/component-a.js'),
		pathFromIndex('tests/mocks/sources/traps/set-b/layer-b/test/component-a.js')
	]
});

/*------------------*/

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

/*------------------*/

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

test('Trying to use an unexistent absolute sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.unexistentAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/list-matching-filepaths.command')
);

test('Trying to use an unexistent relative sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.unexistentRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/list-matching-filepaths.command')
);

test('Trying to use an absolute path to a non directory sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryAbsoluteSourcesDirectoryMacro,
	requireFromIndex('sources/commands/list-matching-filepaths.command')
);

test('Trying to use a relative path to a non directory sourcesDirectory must throw error',
	checkSourcesDirectoryErrorsHandlingMacros.notDirectoryRelativeSourcesDirectoryMacro,
	requireFromIndex('sources/commands/list-matching-filepaths.command')
);

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