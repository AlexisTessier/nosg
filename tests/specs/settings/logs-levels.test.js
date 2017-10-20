'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('Type and content', t => {
	const logsLevels = requireFromIndex('sources/settings/logs-levels');

	t.is(typeof logsLevels, 'object');

	const logsLevelsKeys = Object.keys(logsLevels);
	t.true(logsLevelsKeys instanceof Array);
	t.is(logsLevelsKeys.length, 4);
	t.true(logsLevelsKeys.includes('LOG'));
	t.true(logsLevelsKeys.includes('NOTICE'));
	t.true(logsLevelsKeys.includes('WARN'));
	t.true(logsLevelsKeys.includes('SUCCESS'));

	t.is(typeof logsLevels.LOG, 'symbol');
	t.is(typeof logsLevels.NOTICE, 'symbol');
	t.is(typeof logsLevels.WARN, 'symbol');
	t.is(typeof logsLevels.SUCCESS, 'symbol');

	t.is(logsLevels[logsLevels.LOG], 'LOG');
	t.is(logsLevels[logsLevels.NOTICE], 'NOTICE');
	t.is(logsLevels[logsLevels.WARN], 'WARN');
	t.is(logsLevels[logsLevels.SUCCESS], 'SUCCESS');
});

