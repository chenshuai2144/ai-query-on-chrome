import html2text
import os

converter = html2text.HTML2Text()
# 指定HTML文件所在的目录
directory = "./yuque/"

# 遍历目录下的所有文件
for filename in os.listdir(directory):
    if filename.endswith(".html"):  # 确保文件是HTML文件
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as file:
            # 读取文件内容
            content = file.read()
            # 使用BeautifulSoup解析HTML
            # 打印HTML内容
            markdown_text = converter.handle(content)
            os.makedirs("yuque_docs", exist_ok=True)
            if not os.path.exists("yuque_docs" + "/" + filename + ".md"):
                with open(
                    "yuque_docs" + "/" + filename.replace(".html", "") + ".md",
                    "w",
                    encoding="utf-8",
                ) as file:
                    file.write(markdown_text)
