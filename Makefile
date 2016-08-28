# -*- Mode: Makefile -*-
#
# Makefile for PrefBar
#

VERSION=7.1.0rc1
BUILD=20160803

.PHONY: all patch chrome xpi clean check-tree update-ja webhelp
all: patch xpi

patch:
	sed -r "s/(<em:version>)[^<]*/\1$(VERSION)/" \
    -i install.rdf
	sed -r "s/(v\. ).*(, &builddate; )[0-9]*/\1$(VERSION)\2$(BUILD)/" \
    -i content/help/index.xhtml
	sed -r "s/(var prefbarVersion = )[^;]*/\1$(BUILD)/" \
    -i content/goprefbar/main.js

chrome:
	@mkdir -p chrome/icons/default
	@rm -f chrome/prefbar.jar
	zip -r0 chrome/prefbar.jar content skin locale -x '*~'
#	Linux/Mac window icon for button editor. Just copy over...
	cp skin/pblogo.png chrome/icons/default/prefbar-dialog.png
#	Windows icon for button editor in proprietary ico format.
#	Also store a 16x16px version to make it not look ugly on taskbar...
	-convert -gamma 1.0 skin/pblogo.png -scale 16x16 skin/pblogo.png chrome/icons/default/prefbar-dialog.ico

xpi: chrome
	@rm -f prefbar-trunk.xpi
	zip -r9 prefbar-trunk.xpi chrome \
                          defaults/preferences/prefs.js \
                          chrome.manifest \
                          install.rdf

clean:
	rm -f prefbar-trunk.xpi
	rm -rf chrome

webhelp:
	mkdir -p webhelp/ja webhelp/de
	cp content/help/*.css skin/pblogo18.png webhelp
	cp content/help/*.css skin/pblogo18.png webhelp/ja
	cp content/help/*.css skin/pblogo18.png webhelp/de
	perl deentitize.pl -o webhelp    -l locale/en-US content/help/*.xhtml
	perl deentitize.pl -o webhelp/ja -l locale/ja    content/help/*.xhtml
	perl deentitize.pl -o webhelp/de -l locale/de-AT content/help/*.xhtml
#	HTML5
	sed '/<\?xml.*/d' -i webhelp/*.html webhelp/*/*.html
	sed 's#<!DOCTYPE.*#<!DOCTYPE html>#' -i webhelp/*.html webhelp/*/*.html

check-tree:
	@if [ -d .git ]; then \
	  if [ -n "$$(git status --porcelain)" ]; then \
	    echo "There are uncommitted changes!"; exit 1; \
	  fi \
	fi

# Fetches japanese locale, which is developed external on a SVN server.
update-ja: check-tree
	@rm -rf locale/ja
	svn export https://minefield-jlp.googlecode.com/svn/trunk/chrome/locale/prefbar/ locale/ja/
	@rm -f locale/ja/help/help.dtd
	@rm -f locale/ja/help/prefbarhelp.png
