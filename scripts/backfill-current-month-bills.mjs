import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const parsedUrl = new URL(process.env.DATABASE_URL);
parsedUrl.searchParams.delete('sslmode');
const adapter = new PrismaPg({
  connectionString: parsedUrl.toString(),
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

function buildDueDate(year, month, dueDay) {
  return new Date(Date.UTC(year, month - 1, dueDay, 12, 0, 0));
}

async function main() {
  const now = new Date();
  const month = Number(process.argv[2] || now.getUTCMonth() + 1);
  const year = Number(process.argv[3] || now.getUTCFullYear());

  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { active: true, autoGenerateBill: true },
    orderBy: [{ dueDay: 'asc' }, { description: 'asc' }],
  });

  const competencyDate = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  let created = 0;

  for (const fixedExpense of fixedExpenses) {
    const existing = await prisma.bill.findFirst({
      where: {
        fixedExpenseId: fixedExpense.id,
        competencyDate,
      },
    });

    if (existing) continue;

    await prisma.bill.create({
      data: {
        id: crypto.randomUUID(),
        description: fixedExpense.description,
        amount: round2(fixedExpense.amount),
        kind: 'RECURRING_BILL',
        status: 'PENDING',
        dueDate: buildDueDate(year, month, fixedExpense.dueDay),
        competencyDate,
        categoryId: fixedExpense.categoryId,
        accountId: fixedExpense.defaultAccountId,
        fixedExpenseId: fixedExpense.id,
        ownerId: fixedExpense.ownerId,
        splitType: fixedExpense.splitType,
        isHousehold: fixedExpense.isHousehold,
        source: 'RECURRING',
        createdByUserId: fixedExpense.createdByUserId,
        createdByAgent: fixedExpense.createdByAgent || 'backfill-script',
        notes: fixedExpense.notes,
        isRecurringInstance: true,
        updatedAt: new Date(),
      },
    });

    created += 1;
  }

  console.log(JSON.stringify({ month, year, fixedExpenses: fixedExpenses.length, created }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
