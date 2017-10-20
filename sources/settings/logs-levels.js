'use strict';

const LOG = Symbol();
const NOTICE = Symbol();
const WARN = Symbol();
const SUCCESS = Symbol();

module.exports = {
	LOG, [LOG]: 'LOG',
	NOTICE, [NOTICE]: 'NOTICE',
	WARN, [WARN]: 'WARN',
	SUCCESS, [SUCCESS]: 'SUCCESS'
}