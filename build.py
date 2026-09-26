#!/usr/bin/env python3
"""SurviX single-file bundler.
Inlines styles.css + the 4 JS modules into one portable HTML file
(survix.single.html) that runs from any static server OR file:// double-click.
Usage: python build.py
"""
import re, pathlib

root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

def inline_css(m):
    css = (root / m.group(1)).read_text(encoding="utf-8")
    return "<style>\n" + css + "\n</style>"

def inline_js(m):
    js = (root / m.group(1)).read_text(encoding="utf-8")
    return "<script>\n" + js + "\n</script>"

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)

out = root / "survix.single.html"
out.write_text(html, encoding="utf-8")
print(f"built {out.name} ({out.stat().st_size/1024:.1f} KB)")
