.DEFAULT_GOAL := all

DIST_DIR := dist

format:
	eslint --ext ts --fix src

pull:
	git pull

m := Updates
# to use a commit message do: make push m="MESSAGE"
push:
	git add .
	git commit -m "$(m)"
	git push -u origin main

run start: format
	npm run dev

build: format
	npm run build

deploy:
	$(MAKE) build
	-git -C $(DIST_DIR) init
	-git -C $(DIST_DIR) checkout -b main
	-git -C $(DIST_DIR) add -A
	-git -C $(DIST_DIR) commit -m "deploy"
	-git -C $(DIST_DIR) push -f https://github.com/ShanThatos/vrdemo.git main:gh-pages