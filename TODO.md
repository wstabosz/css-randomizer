# Features

* Fix bookmarklet injection code - I wrote a bookmarklet which will inject the demo panel to any
web page, but then I broke it during a refactor, and it's not MVP.

* Fix it so the the UI stays around while loading a new art piece. 

# Fixes 

* Run code though a manual reverse-spaghettification algorithm

* purecss-character does not get colorized correctly because I don't understand css variables

* Bundle JS (probably not that important since this is just for fun)

# Notes

* This now works without localhost web server (i.e. works from file:// context). After I refactored it to dynamically load the HTML/CSS for the artwork, the browser security rules that prevented access to document.stylesheets no longer applied.

* I'm suspect that I'm not correctly cleaning up the old HTML/CSS when I load a new piece of artwork, so there may be some memory leaks. GC is not my forte.

# Done

add UI to select other art pieces
    - refresh HTML
    - refresh stylesheets
    - clean up old stuff, ex: style caches

Add Checkboxes to list of demos links - checked == include this one in the "Play demos"
