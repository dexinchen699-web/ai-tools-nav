INSERT INTO public.tutorials (
  slug, title, meta_description, category, tool_slug,
  difficulty, duration_minutes, summary, content_md,
  steps, tags, is_featured, is_published
) VALUES

-- 1. ChatGPT 提示词入门 (AI对话 / beginner / featured)
(
  'chatgpt-prompt-guide',
  'ChatGPT 提示词完全入门指南',
  '从零开始学习如何编写高质量的 ChatGPT 提示词，掌握角色设定、上下文补充和输出格式控制等核心技巧。',
  'AI对话', 'chatgpt', 'beginner', 15,
  '本教程带你系统学习 ChatGPT 提示词的基本结构与常用技巧。通过大量实例演示，你将掌握如何让 AI 给出更精准、更有用的回答。适合完全没有提示词经验的新手。',
  E'## 什么是提示词\n提示词（Prompt）是你发给 AI 的指令，质量直接决定回答的好坏。\n\n## 核心要素\n- **角色设定**：告诉 AI 扮演什么角色\n- **任务描述**：清晰说明你要什么\n- **输出格式**：指定回答的结构\n\n## 实战示例\n```\n你是一位资深产品经理，请用 STAR 法则帮我分析以下用户反馈……\n```\n\n## 常见误区\n避免模糊指令，越具体越好。',
  '[{"title":"了解提示词基本结构","content":"提示词由角色、任务、背景和格式四部分组成，缺一不可。"},{"title":"编写你的第一个提示词","content":"打开 ChatGPT，输入：你是一位英语老师，请用简单英语解释量子力学。"},{"title":"优化与迭代","content":"根据回答质量不断调整措辞，加入更多上下文或约束条件。"},{"title":"保存常用模板","content":"将效果好的提示词保存到笔记中，形成个人提示词库。"}]',
  ARRAY['提示词','ChatGPT','入门','AI对话'],
  true, true
),

-- 2. Claude 长文档分析 (AI对话 / intermediate / featured)
(
  'claude-document-analysis',
  '用 Claude 高效分析长篇文档与报告',
  '学习如何利用 Claude 超长上下文窗口，快速提取合同、研究报告和财务文件中的关键信息，提升文档处理效率。',
  'AI对话', 'claude', 'intermediate', 20,
  'Claude 拥有业界领先的长上下文处理能力，非常适合分析合同、学术论文和年度报告。本教程介绍结构化提问策略，帮助你从海量文字中精准提取所需信息。掌握这些技巧后，文档分析效率可提升 5 倍以上。',
  E'## 为什么选择 Claude\nClaude 支持最高 200K token 的上下文，可一次性处理数百页文档。\n\n## 上传文档\n直接将 PDF 或文本粘贴到对话框，Claude 会自动解析内容。\n\n## 结构化提问策略\n1. 先要求生成摘要\n2. 再针对具体章节深挖\n3. 最后要求对比与总结\n\n## 示例指令\n```\n请列出这份合同中所有涉及违约责任的条款，并用表格呈现。\n```',
  '[{"title":"准备文档","content":"将 PDF 转为文本，或直接上传至 Claude.ai 的文件上传功能。"},{"title":"生成结构化摘要","content":"输入：请用三级标题结构总结这份文档的核心内容。"},{"title":"定向信息提取","content":"针对关键章节提问，例如：第三章提到的风险因素有哪些？"},{"title":"交叉验证","content":"要求 Claude 引用原文段落，确保信息准确无误。"},{"title":"导出结果","content":"将分析结果复制到 Notion 或 Word，形成可分享的报告。"}]',
  ARRAY['Claude','文档分析','长上下文','效率'],
  true, true
),

-- 3. Midjourney 基础出图 (AI绘图 / beginner / featured)
(
  'midjourney-beginner-guide',
  'Midjourney 新手出图：从注册到第一张作品',
  '手把手教你完成 Midjourney 注册、Discord 配置和第一次出图，掌握基础参数设置，快速生成高质量 AI 艺术图像。',
  'AI绘图', 'midjourney', 'beginner', 25,
  '本教程覆盖 Midjourney 从零到出图的完整流程，包括 Discord 服务器配置、基础 Prompt 编写和常用参数说明。即使没有任何绘画基础，也能在 30 分钟内生成令人满意的 AI 图像。',
  E'## 注册与配置\n1. 注册 Discord 账号\n2. 加入 Midjourney 官方服务器\n3. 订阅付费计划\n\n## 第一次出图\n在 Bot 频道输入 `/imagine` 命令，后接描述词即可。\n\n## 基础参数\n- `--ar 16:9`：设置宽高比\n- `--v 6`：使用最新模型版本\n- `--q 2`：提升图像质量\n\n## Prompt 技巧\n描述词 = 主体 + 风格 + 光线 + 构图，越详细越好。',
  '[{"title":"注册 Discord 并加入服务器","content":"访问 discord.com 注册账号，然后通过 midjourney.com 加入官方 Discord 服务器。"},{"title":"订阅 Midjourney 计划","content":"在 Discord 中输入 /subscribe，选择适合自己的订阅套餐。"},{"title":"发送第一个 /imagine 命令","content":"在 newbies 频道输入 /imagine prompt: a cute cat in a garden, watercolor style --ar 1:1"},{"title":"调整与变体","content":"点击 U1-U4 放大图像，点击 V1-V4 生成变体，找到最满意的版本。"}]',
  ARRAY['Midjourney','AI绘图','入门','Discord'],
  true, true
),

-- 4. Stable Diffusion 本地部署 (AI绘图 / advanced)
(
  'stable-diffusion-local-setup',
  'Stable Diffusion WebUI 本地部署完整教程',
  '详细讲解在 Windows/Mac 上本地部署 Stable Diffusion WebUI 的全流程，包括显卡配置、模型下载和常用插件安装。',
  'AI绘图', 'stable-diffusion', 'advanced', 60,
  'Stable Diffusion 本地部署让你完全掌控 AI 绘图流程，无需订阅费用且数据完全私密。本教程详细介绍 AUTOMATIC1111 WebUI 的安装步骤、模型管理和 ControlNet 等核心插件的配置方法。',
  E'## 系统要求\n- NVIDIA 显卡（推荐 8GB+ 显存）\n- Python 3.10+\n- Git\n\n## 安装 WebUI\n```bash\ngit clone https://github.com/AUTOMATIC1111/stable-diffusion-webui\ncd stable-diffusion-webui\n./webui.sh  # Mac/Linux\nwebui-user.bat  # Windows\n```\n\n## 下载模型\n从 Civitai 或 HuggingFace 下载 `.safetensors` 模型，放入 `models/Stable-diffusion/` 目录。\n\n## 安装 ControlNet\n在 Extensions 标签页搜索并安装 sd-webui-controlnet 插件。',
  '[{"title":"检查系统环境","content":"确认 Python 版本、Git 安装状态和显卡驱动是否为最新版本。"},{"title":"克隆并启动 WebUI","content":"执行 git clone 命令后运行启动脚本，首次启动会自动下载基础模型。"},{"title":"下载并配置模型","content":"访问 Civitai.com 下载喜欢的风格模型，放入指定目录后刷新 WebUI。"},{"title":"安装核心插件","content":"安装 ControlNet、ADetailer 和 Ultimate SD Upscale 三个必备插件。"},{"title":"生成第一张图","content":"在 txt2img 标签页输入提示词，设置步数为 20、CFG Scale 为 7，点击生成。"}]',
  ARRAY['Stable Diffusion','本地部署','WebUI','AI绘图'],
  false, true
),

-- 5. GitHub Copilot 代码补全 (AI编程 / beginner)
(
  'github-copilot-quickstart',
  'GitHub Copilot 快速上手：让 AI 帮你写代码',
  '学习在 VS Code 中配置 GitHub Copilot，掌握代码补全、函数生成和注释驱动开发等核心用法，大幅提升编码效率。',
  'AI编程', 'github-copilot', 'beginner', 20,
  'GitHub Copilot 是目前最流行的 AI 编程助手，深度集成于 VS Code 等主流编辑器。本教程从安装配置开始，介绍如何通过注释描述需求让 Copilot 自动生成代码，以及如何有效接受、拒绝和修改建议。',
  E'## 安装配置\n1. 在 VS Code 扩展市场搜索 GitHub Copilot\n2. 安装后登录 GitHub 账号授权\n3. 确认状态栏显示 Copilot 图标\n\n## 基本用法\n- **Tab 接受建议**：出现灰色补全文字时按 Tab 确认\n- **Alt+] 切换建议**：浏览多个候选方案\n- **注释驱动**：写注释描述功能，Copilot 自动生成实现\n\n## 实战技巧\n```python\n# 读取 CSV 文件并计算每列的平均值，返回字典\ndef calculate_averages(filepath: str) -> dict:\n```\n输入以上注释和函数签名，Copilot 会自动补全函数体。',
  '[{"title":"安装 VS Code 插件","content":"打开 VS Code，在扩展面板搜索 GitHub Copilot，点击安装并完成 GitHub 账号授权。"},{"title":"体验基础代码补全","content":"新建 Python 文件，输入 def sort_list(，观察 Copilot 的自动补全建议。"},{"title":"注释驱动开发","content":"写一行注释描述你想要的函数功能，然后按 Enter，Copilot 会生成完整实现。"},{"title":"使用 Copilot Chat","content":"按 Ctrl+I 打开内联聊天，选中代码后输入 /explain 或 /fix 获取解释和修复建议。"}]',
  ARRAY['GitHub Copilot','AI编程','VS Code','代码补全'],
  false, true
),

-- 6. Cursor AI 编辑器进阶 (AI编程 / intermediate)
(
  'cursor-advanced-workflow',
  'Cursor 进阶工作流：用 AI 重构和调试复杂项目',
  '深入讲解 Cursor 编辑器的 Composer、Codebase 索引和多文件编辑功能，帮助开发者高效完成大型项目的重构与调试任务。',
  'AI编程', 'cursor', 'intermediate', 35,
  'Cursor 不只是代码补全工具，其 Composer 功能可以跨多个文件同时修改代码，Codebase 索引让 AI 理解整个项目结构。本教程介绍如何利用这些高级功能完成复杂的重构任务和 Bug 修复工作流。',
  E'## Codebase 索引\n在设置中开启 Codebase Indexing，Cursor 会分析整个项目，回答关于代码库的问题。\n\n## Composer 多文件编辑\n按 `Cmd+I` 打开 Composer，描述跨文件的修改需求：\n```\n将项目中所有使用 axios 的地方替换为 fetch API，保持相同的错误处理逻辑\n```\n\n## @符号引用\n- `@file`：引用特定文件\n- `@codebase`：搜索整个代码库\n- `@docs`：引用官方文档\n\n## 调试工作流\n将报错信息直接粘贴到 Chat，Cursor 会定位问题并给出修复方案。',
  '[{"title":"配置 Codebase 索引","content":"进入 Cursor 设置，开启 Codebase Indexing，等待项目索引完成（大型项目需几分钟）。"},{"title":"使用 @codebase 提问","content":"在 Chat 中输入 @codebase 这个项目的认证逻辑在哪里实现的？快速定位代码位置。"},{"title":"Composer 跨文件重构","content":"按 Cmd+I 打开 Composer，描述重构需求，审查 diff 后选择性接受修改。"},{"title":"粘贴报错快速修复","content":"复制终端报错信息，粘贴到 Chat 并加上 how to fix，获取针对性修复方案。"},{"title":"生成单元测试","content":"选中函数，按 Cmd+K 输入 generate unit tests，自动生成对应的测试用例。"}]',
  ARRAY['Cursor','AI编程','重构','调试'],
  false, true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tutorials (
  slug, title, meta_description, category, tool_slug,
  difficulty, duration_minutes, summary, content_md,
  steps, tags, is_featured, is_published
) VALUES

-- 7. Notion AI 会议纪要 (AI效率 / beginner)
(
  'notion-ai-meeting-notes',
  '用 Notion AI 自动生成会议纪要与行动清单',
  '学习如何在 Notion 中使用 AI 功能，将会议录音文字稿快速转化为结构化纪要、决策记录和待办事项，节省大量整理时间。',
  'AI效率', 'notion-ai', 'beginner', 10,
  'Notion AI 内置的总结和提取功能可以将杂乱的会议记录瞬间整理成专业文档。本教程介绍从粘贴原始文字稿到生成完整会议纪要的全流程，以及如何自定义模板满足不同团队的需求。',
  E'## 准备会议文字稿\n将录音转写结果（可用剪映或飞书妙记）粘贴到 Notion 页面。\n\n## 调用 Notion AI\n选中全文，点击 AI 按钮，选择「总结」或输入自定义指令：\n```\n请提取：1.主要决策 2.行动项（含负责人和截止日期）3.待讨论问题\n```\n\n## 创建模板\n将生成效果好的格式保存为 Notion 模板，下次一键复用。\n\n## 与日历集成\n将行动项的截止日期同步到 Notion 日历视图，方便跟踪进度。',
  '[{"title":"粘贴会议文字稿","content":"将会议录音转写文本粘贴到新建的 Notion 页面，保持原始格式即可。"},{"title":"使用 AI 生成摘要","content":"选中全部文本，按空格键唤出 AI 菜单，选择「总结」生成核心要点。"},{"title":"提取行动项","content":"再次调用 AI，输入指令：从以上内容提取所有行动项，格式为：负责人 - 任务 - 截止日期。"},{"title":"保存为模板","content":"点击页面右上角「···」，选择「保存为模板」，方便团队复用。"}]',
  ARRAY['Notion AI','会议纪要','效率','团队协作'],
  false, true
),

-- 8. Perplexity 深度研究 (AI效率 / intermediate)
(
  'perplexity-deep-research',
  'Perplexity AI 深度研究模式：快速完成竞品分析',
  '掌握 Perplexity Deep Research 功能的使用技巧，学习如何构建研究问题链，在 10 分钟内生成带引用来源的专业竞品分析报告。',
  'AI效率', 'perplexity', 'intermediate', 18,
  'Perplexity 的 Deep Research 模式会自动进行多轮搜索和推理，生成带有可验证来源的深度报告。本教程介绍如何设计研究问题、解读报告结构，以及如何将结果导出为可分享的文档。',
  E'## Deep Research 模式\n在搜索框左侧切换到「Deep Research」模式，适合需要综合多方信息的复杂问题。\n\n## 设计研究问题\n好的研究问题应包含：\n- 明确的研究对象\n- 具体的分析维度\n- 时间范围限定\n\n示例：`分析 2024 年国内 AI 写作工具市场，对比 Kimi、文心一言和通义千问的功能差异、定价策略和用户口碑`\n\n## 解读报告\n报告包含来源引用，点击可验证原始信息，确保数据可靠性。\n\n## 导出与分享\n点击右上角分享按钮，生成可公开访问的报告链接。',
  '[{"title":"切换 Deep Research 模式","content":"在 Perplexity 搜索框左侧点击模式切换，选择 Deep Research，注意该功能需要 Pro 订阅。"},{"title":"构建研究问题","content":"输入包含研究对象、分析维度和时间范围的完整问题，避免过于宽泛的提问。"},{"title":"等待多轮搜索完成","content":"Deep Research 会自动进行 5-10 轮搜索，过程中可以看到实时的搜索步骤。"},{"title":"验证来源信息","content":"点击报告中的引用编号，核实关键数据的原始来源，确保信息准确。"},{"title":"导出报告","content":"使用分享功能生成链接，或复制 Markdown 格式内容到其他工具进一步编辑。"}]',
  ARRAY['Perplexity','深度研究','竞品分析','AI搜索'],
  false, true
),

-- 9. Gemini 多模态分析 (AI对话 / intermediate)
(
  'gemini-multimodal-analysis',
  'Gemini 多模态能力实战：图文混合分析技巧',
  '探索 Google Gemini 的多模态处理能力，学习如何同时上传图片、表格和文本进行综合分析，解锁 AI 对话的全新维度。',
  'AI对话', 'gemini', 'intermediate', 22,
  'Gemini 支持在同一对话中混合处理文字、图片、PDF 和表格数据，非常适合需要综合多种信息源的分析任务。本教程通过财务报表分析、产品图片对比等实际案例，展示多模态 AI 的强大潜力。',
  E'## 多模态输入支持\nGemini 1.5 Pro 支持同时处理：\n- 图片（JPG/PNG/WebP）\n- PDF 文档\n- 音频文件\n- 视频片段\n\n## 图文混合分析示例\n上传产品截图后提问：\n```\n分析这张竞品 App 截图的 UI 设计，指出优缺点，并与我们的设计规范对比。\n```\n\n## 表格数据解读\n上传 Excel 截图，要求 Gemini 提取数据趋势并给出业务建议。\n\n## 注意事项\n敏感图片（含个人信息）上传前请做脱敏处理。',
  '[{"title":"准备多模态素材","content":"收集需要分析的图片、PDF 或截图，对含有敏感信息的文件进行脱敏处理。"},{"title":"上传文件到 Gemini","content":"在 gemini.google.com 点击附件图标，支持同时上传多个不同类型的文件。"},{"title":"编写综合分析指令","content":"在提问中明确引用上传的文件，例如：根据上传的三张图表，分析销售趋势并预测下季度数据。"},{"title":"追问深化分析","content":"基于初步回答继续追问，要求 Gemini 提供更具体的数据支撑或改进建议。"}]',
  ARRAY['Gemini','多模态','图文分析','Google AI'],
  false, true
),

-- 10. Runway 视频生成 (AI绘图 / advanced)
(
  'runway-video-generation',
  'Runway Gen-3 视频生成：从静态图到动态短片',
  '系统学习 Runway Gen-3 Alpha 的图生视频和文生视频功能，掌握运镜控制、风格一致性保持和视频拼接等进阶技巧。',
  'AI绘图', 'runway', 'advanced', 45,
  'Runway Gen-3 是目前最强大的 AI 视频生成工具之一，支持高质量的图生视频和文生视频。本教程介绍如何通过精确的运镜描述控制镜头运动，以及如何保持多个片段之间的风格一致性，最终剪辑成完整短片。',
  E'## Gen-3 Alpha 核心功能\n- **图生视频（Image to Video）**：上传参考图，生成 5-10 秒动态视频\n- **文生视频（Text to Video）**：纯文字描述生成视频\n- **运镜控制**：支持推拉摇移等专业运镜指令\n\n## 运镜描述词\n```\nSlow push in, camera moves forward toward the subject,\ncinematic lighting, shallow depth of field\n```\n\n## 保持风格一致性\n使用相同的参考图和风格描述词，确保多个片段视觉统一。\n\n## 后期拼接\n将生成的片段导入 CapCut 或 Premiere，添加转场和音乐完成成片。',
  '[{"title":"准备参考图像","content":"使用 Midjourney 或 Stable Diffusion 生成高质量参考图，确保构图和光线符合预期。"},{"title":"图生视频基础操作","content":"在 Runway 上传参考图，在 Motion Brush 中涂抹需要运动的区域，设置运动方向和强度。"},{"title":"编写运镜提示词","content":"在文本框中加入专业运镜描述：slow zoom in, camera tilts up, dolly shot 等，控制镜头运动。"},{"title":"批量生成与筛选","content":"同一提示词生成 3-5 个版本，选择运动最自然、画面最稳定的版本。"},{"title":"拼接成完整短片","content":"将筛选好的片段按故事顺序导入剪辑软件，添加转场效果和背景音乐。"}]',
  ARRAY['Runway','AI视频','Gen-3','视频生成'],
  false, true
),

-- 11. ChatGPT 代码解释器数据分析 (AI效率 / intermediate)
(
  'chatgpt-data-analysis',
  'ChatGPT 代码解释器：零基础做数据分析',
  '无需编程基础，学习用 ChatGPT 的代码解释器上传 Excel 数据，自动生成可视化图表、统计分析和数据洞察报告。',
  'AI效率', 'chatgpt', 'intermediate', 30,
  'ChatGPT 的代码解释器（Advanced Data Analysis）可以直接运行 Python 代码处理你上传的数据文件。本教程通过销售数据分析案例，展示如何让 AI 自动完成数据清洗、统计分析和图表生成，无需任何编程知识。',
  E'## 开启代码解释器\n在 ChatGPT 设置中确认已开启 Advanced Data Analysis 功能（GPT-4 用户默认可用）。\n\n## 上传数据文件\n支持 CSV、Excel、JSON 等格式，文件大小限制 512MB。\n\n## 常用分析指令\n```\n请分析这份销售数据：\n1. 计算各产品类别的月度销售额趋势\n2. 找出销售额最高的前 10 个 SKU\n3. 用柱状图展示各地区销售对比\n```\n\n## 下载结果\n生成的图表和处理后的数据文件可直接下载保存。',
  '[{"title":"准备数据文件","content":"将 Excel 或 CSV 数据文件整理好，确保第一行为列标题，删除合并单元格等特殊格式。"},{"title":"上传并描述分析需求","content":"点击附件图标上传文件，然后用自然语言描述你想了解的数据问题。"},{"title":"迭代优化图表","content":"对生成的图表提出修改要求，例如：请将颜色改为蓝色系，并添加数据标签。"},{"title":"生成分析报告","content":"要求 ChatGPT 将所有分析结论整理成一份结构化报告，包含关键发现和业务建议。"},{"title":"下载文件","content":"点击对话中的文件链接下载图表图片和处理后的数据文件，保存到本地。"}]',
  ARRAY['ChatGPT','数据分析','代码解释器','可视化'],
  false, true
),

-- 12. Claude 写作润色 (AI对话 / beginner)
(
  'claude-writing-polish',
  'Claude 写作润色指南：让你的文章专业又地道',
  '学习如何用 Claude 对中英文文章进行专业润色，掌握风格调整、逻辑优化和语气改写等技巧，让 AI 成为你的私人编辑。',
  'AI对话', 'claude', 'beginner', 12,
  'Claude 在语言理解和写作润色方面表现出色，能够在保留原意的同时大幅提升文章质量。本教程介绍针对不同场景（商务邮件、学术论文、营销文案）的润色提示词模板，帮助你快速获得专业级的写作效果。',
  E'## 润色 vs 重写\n润色是在保留原意基础上改善表达，重写则是重新组织内容。明确告诉 Claude 你的需求。\n\n## 场景化润色模板\n\n**商务邮件**：\n```\n请润色以下邮件，保持专业友好的语气，语言简洁有力，不超过原文长度的 110%。\n```\n\n**学术论文**：\n```\n请按照学术写作规范润色以下段落，使用被动语态，避免口语化表达。\n```\n\n**营销文案**：\n```\n请将以下产品描述改写得更有吸引力，突出用户价值，加入行动号召语句。\n```\n\n## 对比查看修改\n要求 Claude 用删除线标注删改内容，方便对比原文。',
  '[{"title":"明确润色目标","content":"在提交文章前，先告诉 Claude 目标读者、使用场景和期望的语气风格。"},{"title":"使用场景化模板","content":"根据文章类型选择对应的润色模板，商务/学术/营销场景各有不同的侧重点。"},{"title":"要求标注修改","content":"加入指令：请用【原文】→【修改后】的格式展示主要改动，方便我理解修改逻辑。"},{"title":"多轮迭代优化","content":"对润色结果中不满意的部分继续提出具体修改要求，逐步逼近理想效果。"}]',
  ARRAY['Claude','写作润色','文案','AI写作'],
  false, true
)
ON CONFLICT (slug) DO NOTHING;
