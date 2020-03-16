NAME := link-tree
XPI := $(NAME).xpi
SOURCE := css icons js index.html manifest.json

.PHONY: build clean

build:
	zip -r $(XPI) $(SOURCE)

clean:
	-@rm $(XPI)

