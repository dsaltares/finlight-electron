export type NumberType = 'positive' | 'negative' | 'neutral';

export function numberTypeToColor(numberType: NumberType = 'neutral') {
  switch (numberType) {
    case 'positive':
      return 'success.main';
    case 'negative':
      return 'error';
    default:
      return 'inherit';
  }
}
