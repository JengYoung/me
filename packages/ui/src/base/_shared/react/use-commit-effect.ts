'use client';

import { useEffect, useLayoutEffect } from 'react';

// Internal: SSR never starts actors or touches the DOM.
export const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
