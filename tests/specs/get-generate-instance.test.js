'use strict';

const test = require('ava');
const sinon = require('sinon');

const requireFromIndex = require('../utils/require-from-index');

const mockWriteFile = require('../mocks/mock-write-file');
const mockAbsoluteFilePath  = require('../mocks/mock-absolute-filepath');

/* ------------------ */
// The goal here is not to test again the files-generator module
// but just to ensure that main usages for nosg are working correctly,
// in order to be sure that the generate instance actually comes from files-generator module.
/* ------------------ */

test('Type and API', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const getGenerateInstanceFromIndex = requireFromIndex('get-generate-instance');

	t.is(getGenerateInstance, getGenerateInstanceFromIndex);
	t.is(typeof getGenerateInstance, 'function');
});

test('Use get generate instance', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.is(typeof generate, 'function');

	const generateTwo = getGenerateInstance();

	t.is(generateTwo, generate);
});

test('generate instance function returns undefined', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	const generateResult = generate();

	t.is(generateResult, undefined);
});

test('generate.on is a function', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.is(typeof generate.on, 'function');
});

test('generate.off is a function', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.is(typeof generate.off, 'function');
});

test('generate.listenableEvents', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.deepEqual(generate.listenableEvents, ['write', 'finish', 'error']);
});

test.cb('finish event', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.plan(1);

	generate();

	generate.on('finish', ()=>{
		t.pass();
		t.end();
	});
});

test.cb('finish event on', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	generate();

	const pass = sinon.spy();

	generate.on('finish', pass);

	generate.on('finish', ()=>{
		t.true(pass.calledOnce);
		t.end();
	});
});

test.cb('finish event off', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	const pass = sinon.spy();

	generate.on('finish', pass);
	generate.off('finish', pass);

	generate.on('finish', ()=>{
		t.true(pass.notCalled);
		t.pass();
		t.end();
	});
});

test.cb('generate.off()', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	generate();

	const pass1 = sinon.spy();
	const pass2 = sinon.spy();
	const pass3 = sinon.spy();
	const pass4 = sinon.spy();
	const pass5 = sinon.spy();

	generate.on('finish', pass2);
	generate.on('write', pass3)
	generate.on('error', pass1);
	generate.on('finish', pass1);
	generate.on('write', pass2)
	generate.on('error', pass2);
	generate.on('finish', pass5);
	generate.on('write', pass5)
	generate.on('error', pass5);
	generate.on('finish', pass3);
	generate.on('write', pass1)
	generate.on('error', pass4);
	generate.on('finish', pass4);
	generate.on('write', pass4)
	generate.on('error', pass3);

	generate.off('finish', pass5);
	generate.off('finish', pass2);

	generate.on('finish', ()=>{
		t.true(pass1.calledOnce);
		t.true(pass3.calledOnce);
		t.true(pass4.calledOnce);
		t.true(pass2.notCalled);
		t.true(pass5.notCalled);

		t.end();
	});
});

/*---------------*/

test('generate.use type', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	t.is(typeof generate.use, 'function');
});

test.cb('generate.use with simple string as content', t => {
	const getGenerateInstance = requireFromIndex('sources/get-generate-instance');
	const generate = getGenerateInstance();

	const absoluteFilePath = mockAbsoluteFilePath();
	const writeFile = mockWriteFile(absoluteFilePath);

	generate({
		[absoluteFilePath]: generate.use('file content test')
	}, {
		writeFile
	});

	generate.on('finish', () => {
		if (writeFile.filtered) {
			t.true(writeFile.filtered.calledOnce);
			t.deepEqual(writeFile.filtered.getCall(0).args, [
				absoluteFilePath,
				'file content test',
				{ cwd: process.cwd(), encoding: 'utf-8', writeFile },
				writeFile.cb
			]);

			t.end();
		}
	});	
});