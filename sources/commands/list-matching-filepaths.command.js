'use strict';

const path = require('path');

const glob = require('glob');

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

const checkSourcesDirectory = require('./check-sources-directory.command');

/**
 * @name list-matching-filepaths
 *
 * @description Take a nosg component path and return the list of matching filepaths.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.componentPath The nosg component path from which find the matching filepaths.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 *
 * @returns {Array} An array of filepaths matching the component path
 */
function listMatchingFilepathsCommand({
	componentPath,
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	sourcesDirectory = checkSourcesDirectory({sourcesDirectory});

	const matchingFilepaths = []; [
		`${path.join(sourcesDirectory, componentPath)}.js`,
		`${path.join(sourcesDirectory, componentPath)}/index.js`
	].forEach(pattern => matchingFilepaths.push(...glob.sync(pattern, {nodir: true})))

	log(stdout, [
		`List of filepaths matching "${componentPath}":`,
		...matchingFilepaths.map(filepath => `\t- "${filepath}"`)
	].join('\n'));

	return matchingFilepaths;
}

module.exports = listMatchingFilepathsCommand;