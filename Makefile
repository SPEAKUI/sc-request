build:
	@npm install
	@./node_modules/.bin/browserify index.js -o screquest.js -s screquest
	@npm test

.PHONY: build