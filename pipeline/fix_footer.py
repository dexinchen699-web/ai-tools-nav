import pathlib

f = pathlib.Path(r"C:\Users\pct\ai-tools-nav\src\components\Footer.tsx")

# 读取原始字节
raw = f.read_bytes()

# 打印损坏位置附近的字节，方便诊断
print("Bytes around index 1716:", raw[1710:1725])
print("Total bytes:", len(raw))

# 用 latin-1 解码（latin-1 对所有字节都有映射，不会报错）
content = raw.decode("latin-1")

# 替换可能残留的旧邮箱
content = content.replace("submit@ai-tools-nav.vercel.app", "634932139@qq.com")

# 以 UTF-8 重新写入
f.write_text(content, encoding="utf-8")
print("Done. File rewritten as UTF-8.")

# 验证可以正常读回
verify = f.read_text(encoding="utf-8")
print("Verification OK, length:", len(verify))
