'use strict';

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

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
	sourcesDirectory = defaultOptions.sourcesDirectory
}) {
	const matchingFilepaths = [];

	return matchingFilepaths;
}

module.exports = listMatchingFilepathsCommand;