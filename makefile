.DEFAULT_GOAL := all

DIST_DIR := ./dist/

format:
	eslint --ext ts --fix src

m := Updates
push:
	git add .
	git commit -m "$(m)"
	git push

run start: format
	npm run dev

build: format
	npm run build

deploy: build
	git -C $(DIST_DIR) init
	git -C $(DIST_DIR) add -A
	git -C $(DIST_DIR) commit -m "deploy"
	git -C $(DIST_DIR) push -f https://github.com/ShanThatos/vrdemo.git main:gh-pages