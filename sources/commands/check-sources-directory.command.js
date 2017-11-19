'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = require('../settings/default-options');

const {
	validSourcesDirectory: VAL_SRC_DIR,
	unvalidSourcesDirectory: UNV_SRC_DIR,
	unexistentSourcesDirectory: UNE_SRC_DIR,
	ensureCurrentWorkingDirectory: ENS_CWD
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
 * @return {string} The absolute path to sources directory.
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

	const useAbsoluteSourcesDirectory = path.isAbsolute(sourcesDirectory);
	const absoluteSourcesDirectory = useAbsoluteSourcesDirectory ? sourcesDirectory : path.join(process.cwd(), sourcesDirectory);

	try{
		checkSourcesDirectory(absoluteSourcesDirectory);
	}
	catch(err){
		if (!useAbsoluteSourcesDirectory) {
			throw new Error([err.message, ENS_CWD()].join(' '))
		}
		throw err;
	}

	log.success(stdout, VAL_SRC_DIR({sourcesDirectory: absoluteSourcesDirectory}));

	return absoluteSourcesDirectory;
}

/**
 * @private
 * 
 * @description Check if a sources directory exist and is actually a directory.
 *
 * @param {string} sourcesDirectory The path to the sources pirectory to check.
 * 
 * @throws {Error} If the sources directory doesn't exist or if it's not a directory, an error is thrown.
 *
 * @return {undefined}
 */
function checkSourcesDirectory(sourcesDirectory) {
	try{
		if(!fs.lstatSync(sourcesDirectory).isDirectory()){
			throw new Error(UNV_SRC_DIR({sourcesDirectory}));
		}
	}
	catch(err){
		if(err.code == 'ENOENT'){
			throw new Error(UNE_SRC_DIR({sourcesDirectory}));
		}

		throw err;
	}
}

module.exports = checkSourcesDirectoryCommand;