# HRS parser

This application quickly parses and transforms the original HRS site .htm files to markdown content versions.

At this time Sept 7, 2017 getting:

    Duration: 70471.659ms
    1071 Folders
    22994 Files Parsed
    22994 Files Written

## Requirements
* Node 6.*
* UTF-8 encoded files of original HRS .htm files

## Installation
1.  Download the original HRS files
    ```
    wget -r --no-parent --reject "index.html*" http://www.capitol.hawaii.gov/hrscurrent/
    ```
    This command may not natively work (Mac & Windows). I suggest googling `Download entire http directory` and find one that works for you.

2.  The original .htm files were encoded in ISO 8859-1, we should convert these to utf-8 so we do not have any unicode errors. *Note: if you see weird characters, it hasn't been encoded right*

    This command works on mac & linux computers 
    ```
    find . -type f -exec bash -c 't="convert"; mkdir -p "$t/`dirname {}`"; iconv -f iso-8859-1 -t utf-8 "{}" > "$t/{}"' \;
    ```

3.  In the downloaded files, there should be a subfolder called `hrscurrent`. Make a note of the path to this folder.

4.  Run the command
    ```
    npm start <path to folder in step 3>
    ```
    
    Example:
    ```
    npm start ../www.capitol.hawaii.gov/hrscurrent
    ```

5.  In the `parser/dist` folder you should now have a copy of the source directory but all .htm files are now converted to .md files. Enjoy!

## Developer Notes

* Only .htm files are parsed
* File Flow:
    1. Scrap any metadata from the directory names (ex. Volume, StatuteID, Doc Type)
    2. Isolate <body> tag
    3. Remove misc whitespacing, awkward formatting, empty tags, and the <div> tags itself
    4. Parse files to obtain Title and add as metadata (This may not be 100% full proof as the source files do not have a good indicator for this)
    5. Convert content to Markdown
    6. Write yaml (.md) files with metadata and markdown.

## TODO

* Parsing titles still contain many errors as the source files aren't clean. Console logs spit out initial list of titles that are suspect to not being correct.