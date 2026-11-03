import { expect, test } from 'vitest';
import { parsePageNumber } from './index';

test.each([
  { query: undefined, expected: 1 },
  { query: '', expected: 1 },
  { query: '2', expected: 2 },
  { query: '123', expected: 123 },
  { query: ['3', '8'], expected: 3 },
  { query: [], expected: 1 },
  { query: '0', expected: 1 },
  { query: '-1', expected: 1 },
  { query: '1.5', expected: 1 },
  { query: 'invalid', expected: 1 },
  { query: '2e3', expected: 1 },
  { query: '9007199254740992', expected: 1 },
])('page=$query는 $expected 페이지로 해석한다', ({ query, expected }) => {
  expect(parsePageNumber(query)).toBe(expected);
});
