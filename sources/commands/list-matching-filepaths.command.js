'use strict';

const path = require('path');

const glob = require('glob');

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

const checkSourcesDirectory = require('./check-sources-directory.command');

const pathSep = '/';
const setSep = ':';
const joker = '*';

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

	const splittedComponentPath = componentPath
		.replace(setSep, [pathSep, joker, pathSep].join(''))
		.split(pathSep);

	if (splittedComponentPath.length === 2) {
		splittedComponentPath.unshift(joker);
	}

	const patternComponentPath = splittedComponentPath.join(pathSep);
	
	const patterns = [
		`${path.join(sourcesDirectory, patternComponentPath)}.js`,
		`${path.join(sourcesDirectory, patternComponentPath)}/index.js`
	];

	const matchingFilepaths = [];
	patterns.forEach(pattern => matchingFilepaths.push(...glob.sync(pattern, {nodir: true})))

	log(stdout, [
		`List of filepaths matching "${componentPath}":`,
		...matchingFilepaths.map(filepath => `\t- "${filepath}"`)
	].join('\n'));

	return matchingFilepaths;
}

module.exports = listMatchingFilepathsCommand;