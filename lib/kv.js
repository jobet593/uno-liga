import { kv } from '@vercel/kv';

const STATE_KEY = 'uno-tournament-state';

export async function getState() {
  const state = await kv.get(STATE_KEY);
  return state || null;
}

export async function setState(state) {
  if (state === null) {
    await kv.del(STATE_KEY);
  } else {
    await kv.set(STATE_KEY, state);
  }
}

export const POINTS_BY_POSITION = { 1: 10, 2: 7, 3: 5, 4: 3 };
