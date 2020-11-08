#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/11/8 11:20
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : md2html.py
# @Software: PyCharm
# pip install markdown Pygments
import os
import sys
import markdown


def md2html(mdstr):
    exts = ['markdown.extensions.fenced_code', 'markdown.extensions.codehilite',
            'markdown.extensions.tables', 'markdown.extensions.toc']
    html = '''
    <html lang="zh-cmn-Hans">
    <head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
    <link type="text/css" rel="stylesheet" href="code.css"/>
    <style>
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }

        @media (max-width: 767px) {
            .markdown-body {
                padding: 15px;
            }
        }
    </style>
    <title>AccOJ MongoDB</title>
    </head>
    <body>
    <article class="markdown-body">
    %s
    </article>
    </body>
    </html>
    '''
    ret = markdown.markdown(mdstr, extensions=exts)
    return html % ret


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('usage: python md2html.py infile.md outfile.html')
        sys.exit()
    infile = open(sys.argv[1], 'r', encoding='utf-8')
    md = infile.read()
    infile.close()

    if os.path.exists(sys.argv[2]):
        os.remove(sys.argv[2])
    outfile = open(sys.argv[2], 'a', encoding='utf-8')
    outfile.write(md2html(md))
    outfile.close()
    print(f'convert {sys.argv[1]} to {sys.argv[2]} success!')
