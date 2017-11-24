'use strict';

const path = require('path');
const msg = require('@alexistessier/msg');

const defaultOptions = require('../settings/default-options');

const {
	componentNotFound: CMP_NOT_FND,
	ensureCurrentWorkingDirectory: ENS_CWD
} = require('../settings/logs');

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
 * @returns {Promise} A promise resolving the component.
 */
function getComponentCommand({
	componentPath,
	layer,
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	return listMatchingFilepaths({
		componentPath,
		sourcesDirectory
	}).then(filepaths => {
		if (filepaths.length === 0) {
			throw new Error(msg(
				CMP_NOT_FND({componentPath}),
				ENS_CWD()
			));
		}

		const fullComponentPath = filepaths[0];

		log(stdout, `Component "${componentPath}" found at path "${fullComponentPath}"`);

		return require(fullComponentPath);
	});
}

module.exports = getComponentCommand;