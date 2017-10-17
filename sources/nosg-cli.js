'use strict';

const path = require('path');

const cleanquirer = require('cleanquirer');

const pkg = require('../package.json');

const cli = cleanquirer({
	name: pkg.name,
	version: pkg.version,
	commands: [
		path.join(__dirname, 'commands/*.js')
	]
});

module.exports = cli;