# HRS Web
This site generates the HRS website using the static site generator [Hugo](https://gohugo.io/).

## Requirements
* [Hugo 0.27.1 for correct OS](https://github.com/gohugoio/hugo/releases)
* Node 6.*

## Install
1.  Install the node dependencies

    `npm install`

2.  Included in the repo is the linux version of the Hugo binary. You have two choices:

    **Option 1**: Replace the Hugo binary in `binaries/hugo` with the correct binary of the OS you are running this on, [download here](https://github.com/gohugoio/hugo/releases). Then run a build with the following command: 

    `./binaries/hugo`

    **Option 2**: Run through a linux docker container, sample command:

    ``

## Build
```
hugo
```

## Run (development)
```
hugo server
```
Hugo comes with it's own server that live reloads.  Default url: `http://localhost:1313`

## Lessons Learned

* Don't have hugo generate an html only sidebar menu for every page.  Each generated file would be ~2MB each which easily grows when you have 20k+ files. Hugo builds would be in the 30 min range (if it didn't run out of resources first).