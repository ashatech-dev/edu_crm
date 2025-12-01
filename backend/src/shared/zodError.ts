export function z_max(num: number): [number, string] {
  return [num, "should be at most " + num + " characters required!"];
}

export function z_max_num(num: number): [number, string] {
  return [num, "should be at most " + num + " numbers required!"];
}

export function z_min(num: number): [number, string] {
  return [num, "should be at least " + num + " characters required!"];
}

export function z_min_num(num: number): [number, string] {
  return [num, "should be at least " + num + " numbers required!"];
}
