# HRS parser

This application quickly parses and transforms the original HRS site .htm files to markdown content versions. The idea is to get the current pages translatted to structured content. Once it is structured this data can be used by a static site generator immediately or it can easily be transformed into other mediums (ex. database, json, pdf).

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

5.  Generated files and report are placed in the `output` folder. Enjoy!

## Runtime Stats

Sept 17, 2017: Parser reports

      Duration: 83184.775ms
      1064 Folders
      22568 Files Parsed
      22605 Files Written

## Process Flow
1.  Parse chapter Files and extract titles for chapters and sections (`HrsTitleParser`) 
2.  Store titles in object named `megaTitles`
3.  Parse all chapter and statute files (`HrsParser`)

    i.  Parse the source folder structure (`getDataFromPath`) and store data for front matter:
        
        - division number
        - volume number
        - title number
        - chapter number
        - section number
        - file type (ex. section, chapter)
        - weight (for sorting)

    ii. Parse the file contents (`getDataFromFile`)

        a.  Sanitize data
            
            - tags that do not pertain to content
            - remove unicode issues
            - unusual spacing
            - blank html tags

        b.  Grab title from `megaTitles` object
        c.  Store title information as metadata
        d.  Convert content to Markdown
        e.  Convert any text in format `HRS §<section id>` to a link (`convertLinks`)

4.  Write files to new structure and path (`writeFile`)
5.  Generate new Title Files (`createTitlePages`)

    i.  Find division and volume numbers give a title number
    ii. Generate same front matter data as other pages

6.  Report on translations that didn't go smoothly

## TODO

*   Chapter files can be cleaned up dramatically by referencing the sections by links and cleaning up weird formatting done from source file.

*   Parsing titles still contain errors as the source files aren't clean. Refer to `output/report.txt` after every execution for a starting point on what titles to check. A list of the titles the parser extracted is also generated as a file at `output/000000titles.json`. Titles are mainly gathered from parsing the lists inside the chapter pages (ex. HRS_0001-.htm).  A known issue are when there's a range of sections specified (usually to designate repeal). 

    The parser also tries to extract the title from the title contents, future improvement would be to compare the two titles extracted and report on discrepancies. 

*   The HRS_Index.pdf and SupplementIndex.pdf should be incorporated (ex. taxonomy, search, etc).

*   Better scripts to verify that data is accurate.

