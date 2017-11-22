'use strict';

const path = require('path');

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

const checkSourcesDirectory = require('./check-sources-directory.command');

/**
 * @name get-component
 *
 * @description Take a nosg component path and find the matching component.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.componentPath The nosg component path to use.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 *
 * @returns {Promise} An promise resolving the component.
 */
function listMatchingFilepathsCommand({
	componentPath,
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	sourcesDirectory = checkSourcesDirectory({sourcesDirectory});
}

module.exports = listMatchingFilepathsCommand;