'use client';

import { useSyncExternalStore } from 'react';

const VERSION_EVENT = 'post-version-change';

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener(VERSION_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(VERSION_EVENT, listener);
  };
}

function getVersion() {
  return new URLSearchParams(window.location.search).get('version');
}

function getServerVersion() {
  return null;
}

export function usePostVersion() {
  const version = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  function selectVersion(nextVersion: string | null) {
    const url = new URL(window.location.href);
    if (nextVersion === null) url.searchParams.delete('version');
    else url.searchParams.set('version', nextVersion);
    window.history.pushState(window.history.state, '', url);
    window.dispatchEvent(new Event(VERSION_EVENT));
  }
  return { version, selectVersion };
}
