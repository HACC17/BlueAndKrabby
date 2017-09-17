# HRS Web
This site generates the HRS website using the static site generator [Hugo](https://gohugo.io/).

## Requirements
* [Hugo 0.27.1 for correct OS](https://github.com/gohugoio/hugo/releases)
* Node 6.*

## Install
1.  Install the node dependencies

    ```
    npm install
    ```

2.  Build Assets from Gulp

    ```
    ./node_modules/.bin/gulp build
    ```

3.  Build Hugo Pages (Refer to `Build Hugo` Section below)   

## Build Hugo

Included in the repo is the linux version of the Hugo binary. You have two choices:

**Option 1**: Replace the Hugo binary in `binaries/hugo` with the correct binary of the OS you are running this on, [download here](https://github.com/gohugoio/hugo/releases). Then run a build with the following command: 

```
./binaries/hugo
```

**Option 2**: Run through a linux docker container (ex. alpine), sample command:

```
docker run --rm -it --workdir /app --volume <path to repo web directory>:/app alpine:latest ./binaries/hugo
```

## Build Stats

As of September 17, 2017

```
Built site for language en:
0 draft content
0 future content
0 expired content
42134 regular pages created
2186 other pages created
0 non-page files copied
0 paginator pages created
8 tags created
0 categories created
total in 310813 ms
```

## Deployment

Currently the site uses [Travis CI](https://travis-ci.org/) to run continuous integration and deployment. 

Files are told to deploy automatically to a separate github repo that is web enabled by Github Pages. Because our deployed files are static files, deployment to a variety of services can easily be done (ex. s3 bucket, CDN directly, netlify).

Since deployed files are flat text, a hosting provider that compresses served files is highly recommended. This is especially the case for the sidebar navigation, uncompressed this file runs ~4.5MB while compression takes it down to ~200kb

## Run (development)

This should only be used to speed up a developer's sandbox by live reloading when changes are made.

1.  Hugo comes with it's own server that live reloads. Same conditions apply as noted in the `Build Hugo` section above. Default url: `http://localhost:1313`

    **Option 1**
    ```
    ./binaries/hugo server
    ```

    **Option 2**
    ```
    docker run --rm -it --workdir /app -p 1313:1313 --volume <path to repo web directory>:/app alpine:latest ./binaries/hugo server --bind=0.0.0.0
    ```

2.  Start Gulp in Watch Mode
    ```
    ./node_modules/.bin/gulp
    ```

    Gulp will automatically deploy to the static folder which will automatically trigger a hugo build if hugo is in server mode as well.

## Development Tools

* Sass
* VanillaJS (no need for framework)
* Gulp

## TODO

* Separate Content and Code into it's own Repositories. Major benefits for both the development and authoring.

* Better deployment and optimization tools to minify and compress instead of relying on the hosting service.

* Implement Testing framework on JS code.

* Integrate a real search application instead of using Google Search.


## Lessons Learned

* Why Hugo? Hugo is known to be one of the fastest modern static site generators available. This site was able to generate the 20k+ pages in the same amount of time a jekyll site (Healthcare.gov) generates 2k files.

* Help the build. Although the page content is minimal, the amount of pages is definitely not minimal. Avoid creating layouts that are reliant on many dependencies. For example, baking the menu into the layout made the generated html file to be ~2MB in size. Not the worst you can do but understand that Hugo is generating 20k+ of these files in one build... no bueno.