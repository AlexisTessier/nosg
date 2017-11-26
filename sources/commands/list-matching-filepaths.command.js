'use strict';

const path = require('path');

const glob = require('glob');

const defaultOptions = require('../settings/default-options');

const {
	listMatchingFilepaths: LS_MAT_FIL
} = require('../settings/logs');

const log = require('../tools/log');

const checkSourcesDirectory = require('./check-sources-directory.command');

const pathSep = '/';
const setSep = ':';
const joker = '*';

/**
 * @name list-matching-filepaths
 *
 * @description Take a nosg component path and list the matching filepaths.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.componentPath The nosg component path from which find the matching filepaths.
 * @param {string} options.layer A layer name. If used and componentPath is not absolute, only the filepaths which are from this layer will be listed. Can't be used with an absolute componentPath option.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 *
 * @returns {Promise} A promise resolving an array of filepaths matching the component path.
 */
function listMatchingFilepathsCommand({
	componentPath,
	layer,
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	sourcesDirectory = checkSourcesDirectory({sourcesDirectory});

	const splittedComponentPath = componentPath
		.replace(setSep, [pathSep, joker, pathSep].join(''))
		.split(pathSep);

	for(let i = 3 - splittedComponentPath.length;i>0;i--){
		splittedComponentPath.unshift(joker);
	}

	const patternComponentPath = splittedComponentPath.join(pathSep);
	const useAbsoluteComponentPath = path.isAbsolute(patternComponentPath);

	const fullPatternPath = useAbsoluteComponentPath
		? patternComponentPath
		: path.join(sourcesDirectory, patternComponentPath);

	const patterns = [
		`${fullPatternPath}.js`,
		`${fullPatternPath}/index.js`
	];

	const lastFragment = splittedComponentPath[splittedComponentPath.length - 1];
	const lastFragmentExtname = path.extname(lastFragment);
	if (lastFragmentExtname === '.js') {
		patterns.unshift(fullPatternPath);
	}

	return Promise.all(patterns.map(pattern => new Promise((resolve, reject) => {
		glob(pattern, {nodir: true, silent: true}, (err, filepaths) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(filepaths);
		});
	}))).then(filepaths => {
		const uniqFilter = [];
		filepaths = filepaths.reduce((flat, list) => [...flat, ...list]).filter(filepath => {
			const uniq = !uniqFilter.includes(filepath);
			uniqFilter.push(filepath);
			return uniq;
		}).filter(filepath => {
			if (layer && !useAbsoluteComponentPath) {
				const relativeToSourceComponentPath = path.relative(sourcesDirectory, filepath);
				const fileLayer = relativeToSourceComponentPath.split(pathSep)[1];

				return layer === fileLayer;
			}

			return true;
		}).sort();

		log(stdout, LS_MAT_FIL({
			componentPath,
			filepaths
		}));

		return filepaths;
	});
}

module.exports = listMatchingFilepathsCommand;