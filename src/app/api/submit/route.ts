import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'dexinchen699@gmail.com'

interface SubmitBody {
  toolName: string
  website: string
  category: string
  pricing: string
  tagline: string
  description?: string
  submitterEmail?: string
}

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: '邮件服务未配置' }, { status: 500 })
  }

  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const { toolName, website, category, pricing, tagline, description, submitterEmail } = body

  if (!toolName || !website || !category || !pricing || !tagline) {
    return NextResponse.json({ error: '请填写所有必填字段' }, { status: 400 })
  }

  // Basic URL validation
  try {
    new URL(website)
  } catch {
    return NextResponse.json({ error: '网站地址格式不正确' }, { status: 400 })
  }

  const CATEGORY_LABELS: Record<string, string> = {
    'ai-writing': 'AI 写作',
    'ai-image': 'AI 图像生成',
    'ai-video': 'AI 视频',
    'ai-audio': 'AI 音频',
    'ai-code': 'AI 编程',
    'ai-chat': 'AI 对话',
    'ai-search': 'AI 搜索',
    'ai-productivity': 'AI 效率',
    'ai-design': 'AI 设计',
    'ai-data': 'AI 数据分析',
    'other': '其他',
  }

  const PRICING_LABELS: Record<string, string> = {
    free: '免费',
    freemium: '免费 + 付费',
    paid: '付费',
    enterprise: '企业版',
  }

  const htmlBody = `
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">📬 新工具提交</h1>
    <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 13px;">AI 工具导航收到一条新的工具提交</p>
  </div>
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280; width: 100px;">工具名称</td>
        <td style="padding: 10px 0; font-weight: 600; color: #111827;">${toolName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280;">官方网站</td>
        <td style="padding: 10px 0;"><a href="${website}" style="color: #4f46e5;">${website}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280;">分类</td>
        <td style="padding: 10px 0;">${CATEGORY_LABELS[category] ?? category}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280;">定价</td>
        <td style="padding: 10px 0;">${PRICING_LABELS[pricing] ?? pricing}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280;">一句话介绍</td>
        <td style="padding: 10px 0;">${tagline}</td>
      </tr>
      ${description ? `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">详细描述</td>
        <td style="padding: 10px 0; line-height: 1.6;">${description}</td>
      </tr>` : ''}
      ${submitterEmail ? `
      <tr>
        <td style="padding: 10px 0; color: #6b7280;">提交者邮箱</td>
        <td style="padding: 10px 0;">${submitterEmail}</td>
      </tr>` : ''}
    </table>
    <div style="margin-top: 20px; padding: 12px; background: #eff6ff; border-radius: 8px; font-size: 12px; color: #3b82f6;">
      提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    </div>
  </div>
</body>
</html>
`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AI工具导航 <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL],
        reply_to: submitterEmail || undefined,
        subject: `[工具提交] ${toolName}`,
        html: htmlBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error status:', res.status, 'body:', err)
      // Surface the actual error in dev for easier debugging
      const detail = process.env.NODE_ENV === 'development' ? ` (${err})` : ''
      return NextResponse.json({ error: `邮件发送失败，请稍后重试${detail}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 })
  }
}
