#!/usr/bin/env python3
"""Extract the reviewed Studio UI without copying any content payloads."""

import argparse
from pathlib import Path
import re


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError("Reviewed Studio source no longer matches the expected code.")
    return text.replace(old, new, 1)


def build(source, output):
    original = (source.parent / "index.html").read_text(encoding="utf-8")
    templates = []
    for name in ("behavior", "foundations"):
        matches = re.findall(
            rf'<template id="template-{name}">[\s\S]*?</template>', original
        )
        if len(matches) != 1:
            raise ValueError("Expected one trusted template per Studio panel.")
        template = matches[0].replace("Six stories", "Stories")
        if "<script" in template.lower():
            raise ValueError("Studio templates must not contain scripts.")
        templates.append(template)

    common = (source / "common.js").read_text(encoding="utf-8")
    common = replace_once(
        common,
        "var failedStorageNotice=false;",
        "var failedStorageNotice=false,persistenceDisabled=false;",
    )
    common = replace_once(
        common,
        "function write(key,obj){try{",
        "function write(key,obj){if(persistenceDisabled)return true;try{",
    )
    common = replace_once(
        common,
        "sources:sources};",
        "sources:sources,disablePersistence:function(){persistenceDisabled=true;}};",
    )
    behavior = (source / "behavior.js").read_text(encoding="utf-8")
    behavior, count = re.subn(
        r"    var facts=\[.*?\];",
        "    var facts=Array.isArray(D.factNotes)?D.factNotes:[];",
        behavior,
        count=1,
    )
    if count != 1:
        raise ValueError("Expected the reviewed fixed-note block exactly once.")
    behavior, count = re.subn(
        r"qid:'[^']*',sid:'[^']*'", "qid:'',sid:''", behavior, count=1
    )
    if count != 1:
        raise ValueError("Expected the reviewed initial selection exactly once.")
    behavior = replace_once(behavior, "'Six reusable stories'", "D.stories.length+' reusable stories'")
    behavior = replace_once(
        behavior,
        '<p class="rail-label">6 stories · 按问题调整重点</p>',
        '<p class="rail-label">\'+D.stories.length+\' stories · 按问题调整重点</p>',
    )
    behavior = replace_once(
        behavior,
        "按背景、ownership、强项、MCP、内部客户和下一步组织表达。停顿自然，具体项目留给追问。",
        "按背景、职责、强项、真实项目和下一步组织表达。停顿自然，具体细节留给追问。",
    )
    foundations = (source / "foundations.js").read_text(encoding="utf-8")
    studio = (source / "studio.js").read_text(encoding="utf-8")
    if not studio.startswith("(() => {\n"):
        raise ValueError("Expected the reviewed Studio entry wrapper.")
    studio = studio.replace("(() => {\n", "window.startStudio = function(data) {\n", 1)
    studio = replace_once(
        studio,
        "  const data = JSON.parse(document.querySelector('#studio-data').textContent);\n",
        "",
    )
    studio = replace_once(
        studio,
        "  let active = null;",
        "  let active = null;\n\n"
        "  window.disposeStudio = function() {\n"
        "    window.KIT.disablePersistence();\n"
        "    Object.values(instances).forEach(instance => instance.suspend());\n"
        "  };",
    )
    if not studio.endswith("})();\n"):
        raise ValueError("Expected the reviewed Studio entry wrapper.")
    studio = studio[:-6] + "};\n"

    css = (source / "studio.css").read_text(encoding="utf-8")
    if re.search(r"@import|url\s*\(", css, re.I):
        raise ValueError("Studio CSS must be self-contained.")
    policy = (
        "default-src 'none'; script-src 'self'; script-src-attr 'none'; "
        "style-src 'unsafe-inline'; img-src data:; connect-src 'none'; "
        "font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; "
        "base-uri 'none'; form-action 'none'; worker-src 'none'; manifest-src 'none'"
    )
    document = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="''' + policy + '''">
<meta name="referrer" content="no-referrer">
<meta name="description" content="A local interview practice runtime. Import your content in the parent workspace.">
<link rel="icon" href="data:,"><title>Interview Studio</title><style>''' + css + '''</style></head><body>
<a class="studio-skip" href="#studio-content" hidden>跳到练习内容</a>
<header class="studio-header"><div class="studio-brand"><strong>Interview Studio</strong><span>Local practice workspace</span></div><nav class="studio-tabs" role="tablist" aria-label="选择练习方向" hidden><button id="tab-behavior" role="tab" data-section="behavior" aria-controls="panel-behavior" aria-selected="true"><strong>Behavioral practice</strong><span id="behavior-count">等待载入</span></button><button id="tab-foundations" role="tab" data-section="foundations" aria-controls="panel-foundations" aria-selected="false" tabindex="-1"><strong>Foundations lab</strong><span id="foundations-count">等待载入</span></button></nav><span class="studio-status">进度可导出</span></header>
<p id="load-status" role="status" style="padding:24px">请在上层学习工作区导入 Studio 资料。</p>
<div id="studio-content"><section class="studio-panel" id="panel-behavior" role="tabpanel" aria-labelledby="tab-behavior" hidden><div id="app-behavior"></div></section><section class="studio-panel" id="panel-foundations" role="tabpanel" aria-labelledby="tab-foundations" hidden><div id="app-foundations"></div></section></div>
<noscript>请启用 JavaScript 以使用练习功能。</noscript>
<div id="toast" class="studio-toast" role="status" aria-live="polite" hidden></div>
''' + "\n".join(templates) + '''
<script src="./common.js"></script>
<script src="./behavior.js"></script>
<script src="./foundations.js"></script>
<script src="./studio.js"></script>
<script src="./bootstrap.js"></script>
</body></html>
'''
    assets = {
        "index.html": document,
        "common.js": common,
        "behavior.js": behavior,
        "foundations.js": foundations,
        "studio.js": studio,
    }
    for name, text in assets.items():
        if re.search(r"\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(", text):
            raise ValueError("Studio runtime must not send network requests.")
        if "studio-data" in text:
            raise ValueError("An embedded Studio payload must not enter public assets.")
        if re.search(r"\bEric\b|\bWalmart\b|\bContentstack\b|\$50K|80% 的准确口径", text, re.I):
            raise ValueError("Personal source content must not enter public assets.")
    output.mkdir(parents=True, exist_ok=True)
    for name, text in assets.items():
        (output / name).write_text(text, encoding="utf-8")
    print("Generated 5 generic Studio assets; content payloads were not copied.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Original Studio source directory")
    args = parser.parse_args()
    build(args.source.resolve(), Path(__file__).resolve().parents[1] / "public" / "studio")
