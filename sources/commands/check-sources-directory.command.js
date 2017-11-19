'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = require('../settings/default-options');

const {
	validSourcesDirectory: VAL_SRC_DIR,
	unvalidSourcesDirectory: UNV_SRC_DIR,
	unexistentSourcesDirectory: UNE_SRC_DIR
} = require('../settings/logs');

const log = require('../tools/log');

/**
 * @name check-sources-directory
 *
 * @description Ensure that a sources directory is present and readable.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to check.
 *
 * @returns {string} The absolute path to sources directory.
 */
function checkSourcesDirectoryCommand({
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
} = {}) {
	const options = arguments[0];
	if(typeof options !== 'object' || Array.isArray(options)){
		throw new TypeError(`${options} (${typeof options}) is not a valid option object.`);
	}

	/*-------------------------*/

	const absoluteSourcesDirectory = path.isAbsolute(sourcesDirectory) ? sourcesDirectory : path.join(process.cwd(), sourcesDirectory);

	try{
		if(!fs.lstatSync(absoluteSourcesDirectory).isDirectory()){
			throw new Error(UNV_SRC_DIR({sourcesDirectory: absoluteSourcesDirectory}));
		}
	}
	catch(err){
		if(err.code == 'ENOENT'){
			throw new Error(UNE_SRC_DIR({sourcesDirectory: absoluteSourcesDirectory}));
		}

		throw err;
	}

	log.success(stdout, VAL_SRC_DIR({sourcesDirectory: absoluteSourcesDirectory}));

	return absoluteSourcesDirectory;
}

module.exports = checkSourcesDirectoryCommand;