import { Command } from 'commander';
import { CategoryColorHexValues } from '@/lib/categoryColors';
import { db } from '@/server/db';
import { getLogger } from '@/server/logger';

const logger = getLogger('seedDemoData');

function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

interface RandIntArgs {
  min: number;
  max: number;
}

function randInt(rng: () => number, { min, max }: RandIntArgs): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function getCategoryId(map: Map<string, number>, name: string): number {
  const id = map.get(name);
  if (id === undefined) {
    throw new Error(`Category "${name}" not found in map`);
  }
  return id;
}

const DESCRIPTIONS: Record<string, string[]> = {
  Salary: [
    'Monthly salary',
    'Salary payment',
    'Payroll deposit',
    'Monthly compensation',
  ],
  Freelance: [
    'Web development project',
    'Design consultation',
    'Freelance writing',
    'Contract work payment',
    'Client project milestone',
    'Consulting fee',
  ],
  Groceries: [
    'REWE supermarket',
    'EDEKA grocery',
    'Lidl purchase',
    'ALDI shopping',
    'Netto market',
    'Bio Company',
    'Penny market',
    'Weekly groceries',
  ],
  Rent: ['Monthly rent', 'Apartment rent', 'Rent payment'],
  Utilities: [
    'Electricity bill',
    'Gas bill',
    'Water bill',
    'Internet subscription',
    'Phone bill',
    'Heating cost adjustment',
  ],
  Transport: [
    'BVG monthly pass',
    'DB train ticket',
    'Uber ride',
    'Bolt taxi',
    'Fuel station',
    'Car sharing',
    'Lime scooter',
    'Parking fee',
  ],
  'Dining Out': [
    'Restaurant dinner',
    'Cafe visit',
    'Takeout order',
    'Lieferando delivery',
    'Lunch with colleagues',
    'Brunch spot',
    'Pizza place',
    'Sushi restaurant',
  ],
  Entertainment: [
    'Cinema tickets',
    'Concert tickets',
    'Book purchase',
    'Gaming store',
    'Museum visit',
    'Theater show',
    'Bowling night',
  ],
  Health: [
    'Pharmacy purchase',
    'Doctor copay',
    'Gym membership',
    'Dental checkup',
    'Physiotherapy session',
    'Vitamin supplements',
  ],
  Shopping: [
    'Amazon order',
    'Zalando purchase',
    'Electronics store',
    'IKEA furniture',
    'H&M clothing',
    'MediaMarkt',
    'Decathlon sports',
    'Thalia bookstore',
  ],
  Subscriptions: [
    'Netflix subscription',
    'Spotify Premium',
    'iCloud storage',
    'YouTube Premium',
    'Adobe Creative Cloud',
    'ChatGPT Plus',
  ],
  Transfer: [
    'Transfer to savings',
    'Savings deposit',
    'Monthly savings',
    'Investment transfer',
  ],
};

const IMPORT_PATTERNS: Record<string, string[]> = {
  Salary: ['SALARY', 'PAYROLL', 'COMPENSATION'],
  Freelance: ['FREELANCE', 'CONTRACT', 'CONSULTING'],
  Groceries: ['REWE', 'EDEKA', 'LIDL', 'ALDI', 'NETTO', 'PENNY'],
  Rent: ['RENT', 'MIETE', 'APARTMENT'],
  Utilities: ['ELECTRICITY', 'GAS BILL', 'WATER BILL', 'INTERNET', 'PHONE'],
  Transport: ['BVG', 'DEUTSCHE BAHN', 'UBER', 'BOLT', 'FUEL'],
  'Dining Out': ['RESTAURANT', 'CAFE', 'LIEFERANDO', 'TAKEOUT'],
  Entertainment: ['CINEMA', 'CONCERT', 'THEATER', 'MUSEUM'],
  Health: ['PHARMACY', 'DOCTOR', 'GYM', 'DENTAL', 'PHYSIO'],
  Shopping: ['AMAZON', 'ZALANDO', 'IKEA', 'MEDIAMARKT', 'DECATHLON'],
  Subscriptions: ['NETFLIX', 'SPOTIFY', 'ICLOUD', 'YOUTUBE', 'ADOBE'],
};

const CATEGORY_COLORS = [
  CategoryColorHexValues[13], // Green - Salary
  CategoryColorHexValues[14], // Emerald - Freelance
  CategoryColorHexValues[3], // Orange - Groceries
  CategoryColorHexValues[0], // Red - Rent
  CategoryColorHexValues[19], // Sky - Utilities
  CategoryColorHexValues[16], // Teal - Transport
  CategoryColorHexValues[5], // Amber - Dining Out
  CategoryColorHexValues[23], // Violet - Entertainment
  CategoryColorHexValues[8], // Chocolate - Health
  CategoryColorHexValues[26], // Fuchsia - Shopping
  CategoryColorHexValues[21], // Blue - Subscriptions
];

const CATEGORY_NAMES = [
  'Salary',
  'Freelance',
  'Groceries',
  'Rent',
  'Utilities',
  'Transport',
  'Dining Out',
  'Entertainment',
  'Health',
  'Shopping',
  'Subscriptions',
];

interface TransactionRow {
  accountId: number;
  date: string;
  amount: number;
  description: string;
  type: 'Income' | 'Expense' | 'Transfer';
  categoryId: number;
}

function getSeasonalMultiplier(month: number): number {
  const multipliers = [
    1.6, 1.5, 1.3, 1.0, 0.8, 0.7, 0.7, 0.7, 0.8, 1.0, 1.3, 1.5,
  ];
  return multipliers[month];
}

interface GenerateTransactionsArgs {
  rng: () => number;
  categoryMap: Map<string, number>;
  checkingId: number;
  usdId: number;
}

function generateTransactions({
  rng,
  categoryMap,
  checkingId,
  usdId,
}: GenerateTransactionsArgs): TransactionRow[] {
  const transactions: TransactionRow[] = [];
  const startYear = 2024;
  const startMonth = 7; // August (0-indexed)
  const endYear = 2026;
  const endMonth = 0; // January (0-indexed)

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const pad = (n: number) => n.toString().padStart(2, '0');

    // Salary — 1/mo on a day between 25-28
    const salaryDay = randInt(rng, { min: 25, max: 28 });
    transactions.push({
      accountId: checkingId,
      date: `${year}-${pad(month + 1)}-${pad(salaryDay)}`,
      amount: randInt(rng, { min: 420000, max: 450000 }),
      description: pick(rng, DESCRIPTIONS.Salary),
      type: 'Income',
      categoryId: getCategoryId(categoryMap, 'Salary'),
    });

    // Freelance — ~60% chance
    if (rng() < 0.6) {
      const freelanceDay = randInt(rng, { min: 1, max: 28 });
      transactions.push({
        accountId: usdId,
        date: `${year}-${pad(month + 1)}-${pad(freelanceDay)}`,
        amount: randInt(rng, { min: 80000, max: 200000 }),
        description: pick(rng, DESCRIPTIONS.Freelance),
        type: 'Income',
        categoryId: getCategoryId(categoryMap, 'Freelance'),
      });
    }

    // Rent — 1/mo on the 1st
    transactions.push({
      accountId: checkingId,
      date: `${year}-${pad(month + 1)}-01`,
      amount: -120000,
      description: pick(rng, DESCRIPTIONS.Rent),
      type: 'Expense',
      categoryId: getCategoryId(categoryMap, 'Rent'),
    });

    // Utilities — 1/mo, seasonal
    const baseUtility = randInt(rng, { min: 8000, max: 15000 });
    const seasonal = Math.round(baseUtility * getSeasonalMultiplier(month));
    const utilDay = randInt(rng, { min: 5, max: 15 });
    transactions.push({
      accountId: checkingId,
      date: `${year}-${pad(month + 1)}-${pad(utilDay)}`,
      amount: -seasonal,
      description: pick(rng, DESCRIPTIONS.Utilities),
      type: 'Expense',
      categoryId: getCategoryId(categoryMap, 'Utilities'),
    });

    // Groceries — 4-8/mo
    const groceryCount = randInt(rng, { min: 4, max: 8 });
    for (let i = 0; i < groceryCount; i++) {
      const day = randInt(rng, { min: 1, max: 28 });
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(day)}`,
        amount: -randInt(rng, { min: 2000, max: 12000 }),
        description: pick(rng, DESCRIPTIONS.Groceries),
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Groceries'),
      });
    }

    // Transport — 2-5/mo
    const transportCount = randInt(rng, { min: 2, max: 5 });
    for (let i = 0; i < transportCount; i++) {
      const day = randInt(rng, { min: 1, max: 28 });
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(day)}`,
        amount: -randInt(rng, { min: 500, max: 5000 }),
        description: pick(rng, DESCRIPTIONS.Transport),
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Transport'),
      });
    }

    // Dining Out — 2-6/mo
    const diningCount = randInt(rng, { min: 2, max: 6 });
    for (let i = 0; i < diningCount; i++) {
      const day = randInt(rng, { min: 1, max: 28 });
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(day)}`,
        amount: -randInt(rng, { min: 1500, max: 6000 }),
        description: pick(rng, DESCRIPTIONS['Dining Out']),
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Dining Out'),
      });
    }

    // Entertainment — 1-3/mo
    const entertainmentCount = randInt(rng, { min: 1, max: 3 });
    for (let i = 0; i < entertainmentCount; i++) {
      const day = randInt(rng, { min: 1, max: 28 });
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(day)}`,
        amount: -randInt(rng, { min: 1000, max: 8000 }),
        description: pick(rng, DESCRIPTIONS.Entertainment),
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Entertainment'),
      });
    }

    // Health — 0-2/mo (30% chance each)
    for (let i = 0; i < 2; i++) {
      if (rng() < 0.3) {
        const day = randInt(rng, { min: 1, max: 28 });
        transactions.push({
          accountId: checkingId,
          date: `${year}-${pad(month + 1)}-${pad(day)}`,
          amount: -randInt(rng, { min: 2000, max: 15000 }),
          description: pick(rng, DESCRIPTIONS.Health),
          type: 'Expense',
          categoryId: getCategoryId(categoryMap, 'Health'),
        });
      }
    }

    // Shopping — 1-4/mo, some on USD account
    const shoppingCount = randInt(rng, { min: 1, max: 4 });
    for (let i = 0; i < shoppingCount; i++) {
      const day = randInt(rng, { min: 1, max: 28 });
      const useUsd = rng() < 0.25;
      transactions.push({
        accountId: useUsd ? usdId : checkingId,
        date: `${year}-${pad(month + 1)}-${pad(day)}`,
        amount: -randInt(rng, { min: 2000, max: 20000 }),
        description: pick(rng, DESCRIPTIONS.Shopping),
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Shopping'),
      });
    }

    // Subscriptions — 3 fixed per month
    const subAmounts = [999, 1199, 1499];
    const subDescs = DESCRIPTIONS.Subscriptions.slice(0, 3);
    for (let i = 0; i < 3; i++) {
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(randInt(rng, { min: 1, max: 5 }))}`,
        amount: -subAmounts[i],
        description: subDescs[i],
        type: 'Expense',
        categoryId: getCategoryId(categoryMap, 'Subscriptions'),
      });
    }

    // Transfer to savings — ~70% chance
    if (rng() < 0.7) {
      const transferDay = randInt(rng, { min: 26, max: 28 });
      transactions.push({
        accountId: checkingId,
        date: `${year}-${pad(month + 1)}-${pad(transferDay)}`,
        amount: -randInt(rng, { min: 50000, max: 100000 }),
        description: pick(rng, DESCRIPTIONS.Transfer),
        type: 'Transfer',
        categoryId: getCategoryId(categoryMap, 'Salary'),
      });
    }

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return transactions;
}

async function run() {
  const program = new Command()
    .name('seedDemoData')
    .description('Seed the database with realistic demo data for screenshots')
    .requiredOption('--user-email <email>', 'User email in target DB')
    .allowUnknownOption(false);

  program.parse(process.argv);
  const options = program.opts<{ userEmail: string }>();
  const userEmail = options.userEmail.trim();

  if (!userEmail) {
    throw new Error('`--user-email` must be provided.');
  }

  const rng = createRng(42);

  logger.info({ userEmail }, 'Starting demo data seed');

  try {
    await db.transaction().execute(async (trx) => {
      const user = await trx
        .selectFrom('user')
        .select(['id', 'email'])
        .where('email', '=', userEmail)
        .executeTakeFirst();

      if (!user) {
        throw new Error(`No user found for email "${userEmail}"`);
      }

      const userId = user.id;
      logger.info({ userId }, 'Resolved target user');

      // Delete existing data
      const existingAccountRows = await trx
        .selectFrom('bank_account')
        .select('id')
        .where('userId', '=', userId)
        .execute();
      const existingAccountIds = existingAccountRows.map((row) => row.id);

      const existingBudgetRows = await trx
        .selectFrom('budget')
        .select('id')
        .where('userId', '=', userId)
        .execute();
      const existingBudgetIds = existingBudgetRows.map((row) => row.id);

      const existingTransactionIds =
        existingAccountIds.length > 0
          ? (
              await trx
                .selectFrom('account_transaction')
                .select('id')
                .where('accountId', 'in', existingAccountIds)
                .execute()
            ).map((row) => row.id)
          : [];

      if (existingTransactionIds.length > 0) {
        await trx
          .deleteFrom('attachment')
          .where('transactionId', 'in', existingTransactionIds)
          .execute();
      }

      if (existingAccountIds.length > 0) {
        await trx
          .deleteFrom('account_transaction')
          .where('accountId', 'in', existingAccountIds)
          .execute();
      }

      if (existingBudgetIds.length > 0) {
        await trx
          .deleteFrom('budget_entry')
          .where('budgetId', 'in', existingBudgetIds)
          .execute();
      }

      await trx.deleteFrom('budget').where('userId', '=', userId).execute();
      await trx
        .deleteFrom('bank_account')
        .where('userId', '=', userId)
        .execute();
      await trx.deleteFrom('category').where('userId', '=', userId).execute();
      await trx
        .deleteFrom('csv_import_preset')
        .where('userId', '=', userId)
        .execute();

      // Insert CSV import preset
      await trx
        .insertInto('csv_import_preset')
        .values({
          userId,
          name: 'Bank Export',
          fields: JSON.stringify(['Date', 'Description', 'Amount', 'Ignore']),
          dateFormat: 'yyyy-MM-dd',
          delimiter: ',',
          decimal: '.',
          rowsToSkipStart: 1,
          rowsToSkipEnd: 0,
        })
        .execute();

      // Insert categories
      const categoryMap = new Map<string, number>();
      for (let i = 0; i < CATEGORY_NAMES.length; i++) {
        const name = CATEGORY_NAMES[i];
        const inserted = await trx
          .insertInto('category')
          .values({
            userId,
            name,
            color: CATEGORY_COLORS[i],
            importPatterns: JSON.stringify(IMPORT_PATTERNS[name] ?? []),
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        categoryMap.set(name, inserted.id);
      }

      // Insert accounts
      const checking = await trx
        .insertInto('bank_account')
        .values({
          userId,
          name: 'Main Checking',
          initialBalance: 250000,
          balance: 0,
          currency: 'EUR',
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      const savings = await trx
        .insertInto('bank_account')
        .values({
          userId,
          name: 'Savings',
          initialBalance: 1500000,
          balance: 0,
          currency: 'EUR',
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      const usd = await trx
        .insertInto('bank_account')
        .values({
          userId,
          name: 'USD Account',
          initialBalance: 300000,
          balance: 0,
          currency: 'USD',
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      // Generate and insert transactions
      const transactionRows = generateTransactions({
        rng,
        categoryMap,
        checkingId: checking.id,
        usdId: usd.id,
      });

      if (transactionRows.length > 0) {
        await trx
          .insertInto('account_transaction')
          .values(transactionRows)
          .execute();
      }

      // Insert budget
      const budget = await trx
        .insertInto('budget')
        .values({ userId, granularity: 'Monthly' })
        .returning('id')
        .executeTakeFirstOrThrow();

      const budgetTargets: Array<{
        category: string;
        type: 'Income' | 'Expense';
        target: number;
      }> = [
        { category: 'Salary', type: 'Income', target: 430000 },
        { category: 'Freelance', type: 'Income', target: 100000 },
        { category: 'Groceries', type: 'Expense', target: 40000 },
        { category: 'Rent', type: 'Expense', target: 120000 },
        { category: 'Utilities', type: 'Expense', target: 15000 },
        { category: 'Transport', type: 'Expense', target: 10000 },
        { category: 'Dining Out', type: 'Expense', target: 20000 },
        { category: 'Entertainment', type: 'Expense', target: 15000 },
        { category: 'Health', type: 'Expense', target: 10000 },
        { category: 'Shopping', type: 'Expense', target: 15000 },
        { category: 'Subscriptions', type: 'Expense', target: 3500 },
      ];

      const budgetEntryRows = budgetTargets.map((entry) => ({
        budgetId: budget.id,
        categoryId: getCategoryId(categoryMap, entry.category),
        type: entry.type,
        target: entry.target,
      }));

      await trx.insertInto('budget_entry').values(budgetEntryRows).execute();

      // Recalculate account balances
      for (const account of [checking, savings, usd]) {
        const accountRow = await trx
          .selectFrom('bank_account')
          .select('initialBalance')
          .where('id', '=', account.id)
          .executeTakeFirstOrThrow();
        const txns = await trx
          .selectFrom('account_transaction')
          .select('amount')
          .where('accountId', '=', account.id)
          .where('deletedAt', 'is', null)
          .execute();
        await trx
          .updateTable('bank_account')
          .set({
            balance: txns.reduce(
              (sum, t) => sum + t.amount,
              accountRow.initialBalance,
            ),
          })
          .where('id', '=', account.id)
          .execute();
      }

      logger.info(
        {
          seeded: {
            categories: categoryMap.size,
            accounts: 3,
            transactions: transactionRows.length,
            budgetEntries: budgetEntryRows.length,
            csvPresets: 1,
          },
        },
        'Demo data seed completed',
      );
    });
  } finally {
    await db.destroy();
  }
}

run()
  .catch((error) => {
    logger.error({ error }, `seed failed: ${error}`);
    process.exit(1);
  })
  .then(() => {
    logger.info('seed completed');
    process.exit(0);
  });
