'use strict';

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

/**
 * @name check-sources-directory
 *
 * @description Ensure that a sources directory is present.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to check.
 *
 * @returns {undefined}
 */
function checkSourcesDirectoryCommand({
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
}

module.exports = checkSourcesDirectoryCommand;