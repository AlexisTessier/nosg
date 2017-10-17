'use strict';

const assert = require('assert');

const isStream = require('is-stream');

const logsLevels = require('../settings/logs-levels');

function log(stdout, message, logLevel = logsLevels.LOG) {
	assert(isStream.writable(stdout), `stdout must be a writable stream`);
	assert(typeof message === 'string', `message must be a string`);
	assert(typeof logLevel === 'string' && logLevel in logsLevels,
		`logLevel must be one of those following level: ${Object.keys(logsLevels).filter(l => typeof l === 'string').join(', ')}`
	);

	stdout.write(
		`${logsLevels[logLevel]}: ${message}\n`
	);
}



module.exports = log;