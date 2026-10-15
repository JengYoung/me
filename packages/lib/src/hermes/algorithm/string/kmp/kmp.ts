export const buildPrefixTable = (pattern: string) => {
  const table = Array(pattern.length).fill(0);
  let matched = 0;

  for (let index = 1; index < pattern.length; index += 1) {
    while (matched > 0 && pattern[index] !== pattern[matched]) {
      matched = table[matched - 1];
    }

    if (pattern[index] === pattern[matched]) {
      matched += 1;
      table[index] = matched;
    }
  }

  return table;
};

export const kmpSearch = (text: string, pattern: string) => {
  if (!pattern.length) {
    return Array.from({ length: text.length + 1 }, (_, index) => index);
  }

  const table = buildPrefixTable(pattern);
  const result: number[] = [];
  let matched = 0;

  for (let index = 0; index < text.length; index += 1) {
    while (matched > 0 && text[index] !== pattern[matched]) {
      matched = table[matched - 1];
    }

    if (text[index] !== pattern[matched]) {
      continue;
    }

    matched += 1;

    if (matched === pattern.length) {
      result.push(index - pattern.length + 1);
      matched = table[matched - 1];
    }
  }

  return result;
};
