/* eslint-disable no-restricted-globals */

const urlparams = new URLSearchParams(location.search);

export function getInitURLParam(name: string): string {
  return urlparams.get(name) ?? '';
}

const paramsSet = new Set<Record<string, string>>();

export function addURLParams(params: Record<string, string>) {
  paramsSet.add(params);
  updateURL();
}

export function removeURLParams(params: Record<string, string>) {
  paramsSet.delete(params);
  updateURL();
}

function updateURL() {
  const allParams: Record<string, string> = {};
  for (const params of paramsSet) {
    Object.assign(allParams, params);
  }
  const url = new URL(location.href);
  url.search = new URLSearchParams(Object.entries(allParams).filter(([,v]) => v)).toString();
  history.replaceState(null, '', url.href);
}
