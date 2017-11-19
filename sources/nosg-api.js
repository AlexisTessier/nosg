'use strict';

const pkg = require('../package.json');

const API = {
	version: pkg.version,
	checkSourcesDirectory: require('./commands/check-sources-directory.command'),
	listMatchingFilepaths: require('./commands/list-matching-filepaths.command'),
	runGenerator: require('./commands/run-generator.command')
}

module.exports = API;