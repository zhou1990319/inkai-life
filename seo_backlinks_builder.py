"""
InkAI SEO外链建设方案生成器
调用Kimi AI生成SEO外链建设策略和内容
"""

import sys
sys.path.insert(0, "c:/Users/Administrator/WorkBuddy/Claw")
from kimi_client import Kimi

kimi = Kimi()

# SEO外链建设策略 Prompt
prompt = """
你是一位资深的海外SEO和数字营销专家。请为InkAI（墨纹AI纹身生成器网站）制定完整的SEO外链建设方案。

**网站信息**:
- 网址: https://inkai.life
- 产品: AI纹身生成器，将文字描述转化为中国水墨风格的纹身图案
- 核心功能: 文字转纹身图片、图生图风格转换、4K高清下载
- 目标市场: 欧美纹身爱好者、AI设计工具用户
- 会员体系: 免费版/月卡($7.99)/年卡($59.99)/终身($199)

**任务**: 请生成以下内容:

## 1. 外链建设策略（详细说明）
请提供具体可行的外链建设方法，包括：
- 高权重目录提交列表（至少20个）
- 客座博客投稿目标网站（至少10个纹身/艺术相关网站）
- Web 2.0 平台列表（博客、社交媒体等）
- 行业论坛和社区列表
- 竞争对手外链分析建议

## 2. 每类外链的详细操作指南
针对每种外链类型，说明：
- 具体操作步骤
- 注意事项
- 预期效果

## 3. 英文外链资源内容（可直接发布）
请生成以下可以直接使用的英文内容:

A. 客座博客文章（800-1000字）
主题: "How AI Tattoo Generators Are Revolutionizing Body Art Design"
包含关键词: AI tattoo generator, tattoo design, body art, tattoo ideas

B. 社交媒体简介/描述（3个平台各200字）
- Reddit (r/tattoos, r/Art)
- Pinterest
- Instagram

C. 目录提交描述（各100字）
适用于: DMOZ, Yelp艺术类, Behance, Dribbble等

D. 论坛签名/回复模板（3个变体）
适用于: Reddit评论, Quora回答, 纹身论坛

## 4. 外链建设时间表
按周计划前8周的外链建设工作

请输出完整、详细、可执行的内容。所有英文内容要求地道、专业、符合SEO规范。
"""

print("🦐 正在调用Kimi生成SEO外链建设方案...")
print("=" * 60)

try:
    result = kimi.chat(prompt, temperature=0.7, max_tokens=8000)
    print(result)

    # 保存结果
    output_file = "c:/Users/Administrator/Desktop/3332222/seo_backlinks_strategy.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# InkAI SEO外链建设完整方案\n\n")
        f.write(f"生成时间: 2026-05-13\n\n")
        f.write(result)

    print("\n" + "=" * 60)
    print(f"✅ 方案已保存到: {output_file}")

except Exception as e:
    print(f"❌ 错误: {e}")
