.PHONY: all dist clean

all: dist

dist: node_modules
	pnpm build

node_modules: package.json pnpm-lock.yaml
	pnpm install

clean:
	rm -rf dist node_modules
