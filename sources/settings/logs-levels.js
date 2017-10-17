'use strict';

const LOG = Symbol();
const NOTICE = Symbol();
const WARN = Symbol();

module.exports = {
	LOG,
	NOTICE,
	WARN,
	[LOG]: 'LOG',
	[NOTICE]: 'NOTICE',
	[WARN]: 'WARN'
}