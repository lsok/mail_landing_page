export async function onRequestPost(context) {
  try {
    // 1. 解析前端发来的 JSON 数据
    const { name, email, message } = await context.request.json();

    // 2. 从 Cloudflare 环境变量读取 API Key（安全，不会暴露给前端）
    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    // 3. 调用 Resend REST API 发送邮件
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 注意：未在 Resend 验证自己域名时，发件人必须填 onboarding@resend.dev
        // 且收件人只能填你注册 Resend 账号时的那个邮箱
        from: 'Website Form <help@lsok.net>',
        to: ['servicelsok@gmail.com'],
        subject: `网站咨询`,
        html: `
          <p><strong>姓名：</strong>${name}</p>
          <p><strong>邮箱：</strong>${email}</p>
          <p><strong>内容：</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}