.DEFAULT_GOAL := all

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