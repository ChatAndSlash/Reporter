"use strict";

require('./globals');

const Log = require('./log');

if ( ! ['dev', 'test'].includes(process.env.MODE)) {
	const Raven = require('raven');
	Raven.config(process.env.SENTRY_URL).install();
}

const Reporter = require('./reporter');
const reporter = new Reporter(
	process.env.MQ_URL
);

if ('dev' === process.env.MODE) {
	process.on('unhandledRejection', (reason, p) => {
		Log.error('* * * * * UNHANDLED REJECTION!!! * * * * *');
		Log.error(reason);
	});

	reporter.connect();
}
// On testing or production server, delay 10s so we don't flood Sentry with reconnect errors
else {
	Log.info('10s delay starting now.');
	setTimeout(reporter.connect.bind(reporter), 10000);
}
