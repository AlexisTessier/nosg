'use strict';

const pkg = require('../package.json');

const API = {
	version: pkg.version,
	generate: require('./commands/generate.command')
}

module.exports = API;