'use strict';

let id = 0;

module.exports = function mockAbsoluteFilepath() {
	return `/full/path/file-${(++id)}.js`
}