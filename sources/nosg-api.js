'use strict';

const pkg = require('../package.json');

const API = {
	version: pkg.version,
	runGenerator: require('./commands/run-generator.command')
}

module.exports = API;