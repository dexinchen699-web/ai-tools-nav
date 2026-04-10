import pathlib

OLD = "submit@ai-tools-nav.vercel.app"
NEW = "634932139@qq.com"

files = [
    r"C:\Users\pct\ai-tools-nav\src\components\Footer.tsx",
    r"C:\Users\pct\ai-tools-nav\src\components\Header.tsx",
]

for path in files:
    f = pathlib.Path(path)
    content = f.read_bytes().decode("utf-8", errors="replace")
    if OLD in content:
        content = content.replace(OLD, NEW)
        f.write_text(content, encoding="utf-8")
        print(f"Fixed: {f.name}")
    else:
        print(f"Not found in: {f.name}")
