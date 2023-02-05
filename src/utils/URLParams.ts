/* eslint-disable no-restricted-globals */

export const URLParams = new Proxy(
  Object.fromEntries([...new URLSearchParams(location.search).entries()].filter(([,v]) => v)),
  {
    get(target, prop: string) {
      return target[prop] ?? '';
    },

    set(target, prop: string, value: string) {
      if (value) {
        target[prop] = value;
      } else {
        delete target[prop];
      }
      updateURL(target);
      return true;
    },

    deleteProperty(target, prop: string) {
      delete target[prop];
      updateURL(target);
      return true;
    },
  }
);

function updateURL(params: Record<string, string>) {
  const url = new URL(location.href);
  url.search = new URLSearchParams(Object.entries(params)).toString();
  history.replaceState(null, '', url.href);
}
