"use strict";

// Load correct environment file
require('dotenv').config({ path: 'test' === process.env.NODE_ENV ? '.env-test' : '.env' });

// Lodash
global._ = require('lodash');
