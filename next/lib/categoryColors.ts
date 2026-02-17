export type CategoryColor = {
  name: string;
  hex: string;
};

export const CategoryColors: CategoryColor[] = [
  // Reds
  { name: 'Red', hex: '#DC2626' },
  { name: 'Crimson', hex: '#BE123C' },
  { name: 'Rose', hex: '#E11D48' },

  // Oranges
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Coral', hex: '#F97316' },
  { name: 'Amber', hex: '#D97706' },

  // Browns
  { name: 'Brown', hex: '#92400E' },
  { name: 'Chestnut', hex: '#7C2D12' },
  { name: 'Chocolate', hex: '#78350F' },

  // Yellows
  { name: 'Yellow', hex: '#CA8A04' },
  { name: 'Gold', hex: '#EAB308' },

  // Greens
  { name: 'Lime', hex: '#65A30D' },
  { name: 'Olive', hex: '#4D7C0F' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Mint', hex: '#10B981' },

  // Teals / Cyans
  { name: 'Teal', hex: '#0F766E' },
  { name: 'Turquoise', hex: '#0D9488' },
  { name: 'Cyan', hex: '#0891B2' },

  // Blues
  { name: 'Sky', hex: '#0284C7' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Indigo', hex: '#4F46E5' },

  // Purples / Pinks
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Lavender', hex: '#8B5CF6' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Fuchsia', hex: '#C026D3' },
  { name: 'Pink', hex: '#DB2777' },
  { name: 'Mauve', hex: '#9D4EDD' },
];

export const DefaultCategoryColor = CategoryColors[0].hex;

export const CategoryColorsByHex = Object.fromEntries(
  CategoryColors.map((color) => [color.hex, color]),
) as Record<string, CategoryColor>;

export const CategoryColorHexValues = CategoryColors.map((color) => color.hex);
