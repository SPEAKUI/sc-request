build:
	@npm install
	@mocha

dist:
	@browserify index.js -o index.dist.js
	@uglifyjs index.dist.js -o index.dist.min.js

.PHONY: build