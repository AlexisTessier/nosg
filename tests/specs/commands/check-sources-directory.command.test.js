'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type', t => {
	const checkSourcesDirectory = requireFromIndex('sources/commands/check-sources-directory.command');

	t.is(typeof checkSourcesDirectory, 'function');
});

test.todo('usage with unvalid parameters');
test.todo('usage with unvalid option sourcesDirectory');
test.todo('usage with unvalid option stdout');

test.todo('usage with an absolute valid sources directory');
test.todo('usage with a relative valid sources directory');
test.todo('usage with a valid sources directory - default value');

test.todo('usage with an unexistent absolute sources directory');
test.todo('usage with an unexistent relative sources directory');
test.todo('usage with an unexistent sources directory - default value');

test.todo('usage with a not directory absolute sources directory');
test.todo('usage with a not directory relative sources directory');
test.todo('usage with a not directory sources directory - default value');