.PHONY: all dist clean

all: dist

dist: node_modules
	npm run build

node_modules: package.json package-lock.json
	npm install

clean:
	rm -rf dist node_modules
