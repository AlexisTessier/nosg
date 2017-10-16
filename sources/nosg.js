'use strict';

const api = require('./nosg-api');
const cli = require('./nosg-cli');

const pkg = require('../package.json');

const nosg = {
	version: pkg.version,
	api,
	cli
}

module.exports = nosg;