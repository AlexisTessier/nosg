'use strict';

const cleanquirer = require('cleanquirer');

const pkg = require('../package.json');

const cli = cleanquirer({
	name: pkg.name,
	version: pkg.version
});

module.exports = cli;