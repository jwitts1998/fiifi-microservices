import { Context, Next } from 'koa';

export async function cors(ctx: Context, next: Next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  ctx.set('Access-Control-Max-Age', '86400');

  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }

  await next();
}
