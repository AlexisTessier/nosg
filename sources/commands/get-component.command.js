'use strict';

const path = require('path');
const msg = require('@alexistessier/msg');

const defaultOptions = require('../settings/default-options');

const {
	componentFound: CMP_FND,
	componentNotFound: CMP_NOT_FND,
	noFilepathMatching: NO_FIL_MAT,
	manyFilepathsMatching: MNY_FIL_MAT,
	ensureCurrentWorkingDirectory: ENS_CWD,
	listMatchingFilepaths: LS_MAT_FIL
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
 * @param {string} options.layer A layer name. If used and componentPath is not absolute, only the filepaths which are from this layer are taken into account to find the component. Can't be used with an absolute componentPath option.
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
		layer,
		sourcesDirectory
	}).then(filepaths => {
		if (filepaths.length === 0) {
			throw new Error(msg(
				CMP_NOT_FND({componentPath}),
				NO_FIL_MAT({componentPath}),
				ENS_CWD()
			));
		}

		if (filepaths.length > 1) {
			throw new Error(msg(
				CMP_NOT_FND({componentPath}),
				MNY_FIL_MAT({componentPath}),
				LS_MAT_FIL({componentPath, filepaths})
			));
		}

		const fullComponentPath = filepaths[0];

		log(stdout, CMP_FND({componentPath, fullComponentPath}));

		return require(fullComponentPath);
	});
}

module.exports = getComponentCommand;