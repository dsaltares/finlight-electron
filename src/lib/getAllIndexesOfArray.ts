export default function getAllIndexesOfArray(
  where: string[],
  value: string,
): number[] {
  const indexes = [];
  for(let i = 0; i < where.length; i++) {
    if (where[i] === value) {
      indexes.push(i);
    }
  }
  return indexes;
}
