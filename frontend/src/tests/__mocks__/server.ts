import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  rest.get('*/health', (_req, res, ctx) => {
    return res(ctx.json({ status: 'ok' }));
  }),
);
