'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');
const mockWritableStream = require('../../mocks/mock-writable-stream');
const mockReadableStream = require('../../mocks/mock-readable-stream');

test('Type', t => {
	const log = requireFromIndex('sources/tools/log');

	t.is(typeof log, 'function');
	t.is(typeof log.notice, 'function');
	t.is(typeof log.warn, 'function');
	t.is(typeof log.success, 'function');
});

test('log usage default logLevel', t => {
	const log = requireFromIndex('sources/tools/log');

	const buffer = [];

	log(mockWritableStream(buffer), 'message');

	t.deepEqual(buffer.join(''), 'LOG: message\n');
});

test('log usage logLevel LOG', t => {
	const log = requireFromIndex('sources/tools/log');
	const { LOG } = requireFromIndex('sources/settings/logs-levels');

	const buffer = [];

	log(mockWritableStream(buffer), 'message', LOG);

	t.deepEqual(buffer.join(''), 'LOG: message\n');
});

test('log usage logLevel NOTICE', t => {
	const log = requireFromIndex('sources/tools/log');
	const { NOTICE } = requireFromIndex('sources/settings/logs-levels');

	const buffer = [];

	log(mockWritableStream(buffer), 'message', NOTICE);

	t.deepEqual(buffer.join(''), 'NOTICE: message\n');
});

test('log usage logLevel WARN', t => {
	const log = requireFromIndex('sources/tools/log');
	const { WARN } = requireFromIndex('sources/settings/logs-levels');

	const buffer = [];

	log(mockWritableStream(buffer), 'message', WARN);

	t.deepEqual(buffer.join(''), 'WARN: message\n');
});

test('log usage logLevel SUCCESS', t => {
	const log = requireFromIndex('sources/tools/log');
	const { SUCCESS } = requireFromIndex('sources/settings/logs-levels');

	const buffer = [];

	log(mockWritableStream(buffer), 'message', SUCCESS);

	t.deepEqual(buffer.join(''), 'SUCCESS: message\n');
});

test('log.notice usage', t => {
	const log = requireFromIndex('sources/tools/log');

	const buffer = [];

	log.notice(mockWritableStream(buffer), 'notice message');

	t.deepEqual(buffer.join(''), 'NOTICE: notice message\n');
});

test('log.warn usage', t => {
	const log = requireFromIndex('sources/tools/log');

	const buffer = [];

	log.warn(mockWritableStream(buffer), 'warn message');

	t.deepEqual(buffer.join(''), 'WARN: warn message\n');
});

test('log.success usage', t => {
	const log = requireFromIndex('sources/tools/log');

	const buffer = [];

	log.success(mockWritableStream(buffer), 'success message');

	t.deepEqual(buffer.join(''), 'SUCCESS: success message\n');
});

/*-----------*/

test('log unvalid stdout parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockReadableStream());
	});

	t.is(err.message, 'stdout must be a writable stream');
});

test('log.notice unvalid stdout parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.notice(mockReadableStream());
	});

	t.is(err.message, 'stdout must be a writable stream');
});

test('log.warn unvalid stdout parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.warn(mockReadableStream());
	});

	t.is(err.message, 'stdout must be a writable stream');
});

test('log.success unvalid stdout parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.success(mockReadableStream());
	});

	t.is(err.message, 'stdout must be a writable stream');
});

test('log unvalid message parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockWritableStream(), false);
	});

	t.is(err.message, 'message must be a string');
});

test('log.notice unvalid message parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.notice(mockWritableStream(), 8);
	});

	t.is(err.message, 'message must be a string');
});

test('log.warn unvalid message parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.warn(mockWritableStream(), {});
	});

	t.is(err.message, 'message must be a string');
});

test('log.success unvalid message parameter', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log.success(mockWritableStream(), ()=>{return;});
	});

	t.is(err.message, 'message must be a string');
});

test('log unvalid logLevel parameter - "LOG"', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockWritableStream(), 'log message', 'LOG');
	});

	t.is(err.message, 'logLevel must be one of those following level: LOG, NOTICE, WARN, SUCCESS');
});

test('log unvalid logLevel parameter - "WARN"', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockWritableStream(), 'log message', 'WARN');
	});

	t.is(err.message, 'logLevel must be one of those following level: LOG, NOTICE, WARN, SUCCESS');
});

test('log unvalid logLevel parameter - "NOTICE"', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockWritableStream(), 'log message', 'NOTICE');
	});

	t.is(err.message, 'logLevel must be one of those following level: LOG, NOTICE, WARN, SUCCESS');
});

test('log unvalid logLevel parameter - "SUCCESS"', t => {
	const log = requireFromIndex('sources/tools/log');

	const err = t.throws(() => {
		log(mockWritableStream(), 'log message', 'SUCCESS');
	});

	t.is(err.message, 'logLevel must be one of those following level: LOG, NOTICE, WARN, SUCCESS');
});