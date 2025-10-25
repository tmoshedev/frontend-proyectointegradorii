export const sortByNumberDesc = <T>(items: T[], selector: (item: T) => number): T[] => {
  return [...items].sort((a, b) => selector(b) - selector(a));
};
