import * as queryString from 'query-string';

function addQs(path: string, search: string): string {
  let parsed = queryString.parse(search);
  parsed.page = undefined;
  let qs = queryString.stringify(parsed);
  return `${path}${qs !== "" ? "?" : ""}${qs}`;
}

export function urlParam(name: string, search: string): string {
  let parsed = queryString.parse(search);
  return parsed[name];
}

export function urlParamNumber(name: string, search: string): number {
  let parsed = queryString.parse(search);
  return Number(parsed[name]);
}

function urlParts(path: string): string[] {
  return path.split('/').filter(p => p).map(decodeURIComponent);
}

export function changeUrlElem(i: number, v: string, path: string, search: string): string {
  let uriParts = urlParts(path);
  uriParts[i] = v;
  let ret = addQs('/' + uriParts.join('/'), search);
  return ret;
}

export function changeParamInUrl(name: string, value: string, path: string, search: string): string {
  let parsed = queryString.parse(search);
  parsed[name] = value;
  let qs = queryString.stringify(parsed);
  return `${decodeURIComponent(path)}${qs !== "" ? "?" : ""}${qs}`;
}

export function changeParamsInUrl(params: object, path: string, search: string): string {
  let parsed = queryString.parse(search);
  for (let p in params) {
    parsed[p] = (params as any)[p];
  }
  let qs = queryString.stringify(parsed);
  return `${decodeURIComponent(path)}${qs !== "" ? "?" : ""}${qs}`;
}

export function urlPart(i: number, path: string): string {
  return urlParts(path)[i];
}
