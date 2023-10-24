import pandas as pd
import html2text
import os


converter = html2text.HTML2Text()
df = pd.read_csv("query_result_ext.csv")

for index, row in df.iterrows():
    # 遍历每一列
    print(df.columns)

    value = row["content"]

    markdown_text = converter.handle(value)
    os.makedirs("docs", exist_ok=True)
    with open("docs" + "/" + row["unique_id"] + ".md", "w", encoding="utf-8") as file:
        file.write(markdown_text)
