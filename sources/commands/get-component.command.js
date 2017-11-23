'use strict';

const path = require('path');

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

const listMatchingFilepaths = require('./list-matching-filepaths.command');

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
function getComponentCommand({
	componentPath,
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	return listMatchingFilepaths({
		componentPath,
		sourcesDirectory
	}).then(filepaths => {
		const fullComponentPath = filepaths[0];

		log(stdout, `Component "${componentPath}" found at path "${fullComponentPath}"`);

		return require(fullComponentPath);
	});
}

module.exports = getComponentCommand;