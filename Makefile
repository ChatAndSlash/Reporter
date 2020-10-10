.PHONY: help install server test coverage clean-coverage

include .env

help:
	@echo
	@echo "Please use 'make <target>' where <target> is one of"
	@echo "  server    to start the server"
	@echo "  debug     to start the server in debug mode"
	@echo "  test      to run tests"
	@echo "  coverage  to generate and review test coverage reports"
	@echo "  install   to install modules and run migrations"
	@echo

# Install the required NPM modules and run migrations
install:
	@npm update
	@npm install

# Run the server!
server:
ifeq (${MODE},dev)
	@NODE_ENV=development npx nodemon index.js | ./node_modules/.bin/bunyan
else
	@echo "Use PM2 to run in production."
endif

# Run all tests, and force exit when done (DB doesn't clean up after itself otherwise)
test:
ifeq (${file},all)
	@NODE_ENV=test jest --forceExit
else
	@NODE_ENV=test jest $(file) --verbose
endif

# Create test coverage report
coverage: clean-coverage
	@NODE_ENV=test jest --forceExit --coverage
	@open coverage/lcov-report/index.html

clean-coverage:
	@rm -rf coverage