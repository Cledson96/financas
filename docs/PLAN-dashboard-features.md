# PLAN-dashboard-features

**Status**: PROPOSED
**Author**: Project Planner Agent
**Date**: 2026-02-07

## 1. Overview

The goal is to update the financial dashboard to reflect recent database changes (`HouseholdConfig`, `MonthlyBalance`, `SHARED_PROPORTIONAL` split types) and add requested UI features (Month Selector, Detailed Settlement, Open Invoices Urgency, Fairness Graph).

## 2. Project Type

**WEB** (Next.js + Prisma + Tailwind)

## 3. Success Criteria

- [ ] **Month Selector**: Users can navigate to past months (e.g., "Jan 2026") and see historical data.
- [ ] **Settlement Breakdown**: Dashboard shows "50/50" vs "Proportional (60/40)" split details.
- [ ] **Quitar Button**: Modal to register a `TRANSFER` transaction adds a manual payment record.
- [ ] **Invoice Urgency**: Shows "Next Invoice Due in X days" instead of just total sum.
- [ ] **Fairness Graph**: Bar chart comparing "Ideal Share (e.g., 60%)" vs "Actual Paid %".
- [ ] **Logic Accuracy**: "Quem deve quem" calculation matches the logic defined in `database.md` (including Individual paid by other).

## 4. Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Shadcn UI (assumed or existing components).
- **Backend**: Next.js Server Actions / Server Components.
- **Database**: Prisma ORM, Postgres (implied).

## 5. File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx            # Update: Add searchParams for month/year
│           ├── DashboardClient.tsx # Update: Add MonthSelector state/prop
│           ├── components/
│           │   ├── MonthSelector.tsx       # [NEW] Dropdown component
│           │   ├── SettlementCard.tsx      # [UPDATE] Breakdown + Quitar Modal
│           │   ├── InvoiceCard.tsx         # [UPDATE] Next due date logic
│           │   └── FairnessGraph.tsx       # [NEW] Bar chart component
└── services/
    └── dashboard.ts                # [UPDATE] Settlement logic + Month Filtering
```

## 6. Task Breakdown

### Phase 1: Service Layer Updates (Backend Logic)

- **Task 1.1**: Update `getDashboardData` signature.
  - **Input**: `month?: number`, `year?: number`.
  - **Logic**: Use these params to calculate `monthStart` and `monthEnd`.
  - **Logic**: Fetch `MonthlyBalance` if month is closed (optional, decided to use live calculation for consistency first, or check `status` in `MonthlyBalance`).
- **Task 1.2**: Refactor Settlement Calculation (Crucial).
  - **Logic**: Implement the 6-step logic from `database.md`:
    1. Sum SHARED (50/50).
    2. Sum INDIVIDUAL (paid by other).
    3. Sum SHARED_PROPORTIONAL (using `splitShare`).
    4. Subtract TRANSFERS.
  - **Output**: Return distinct totals for "50/50 debt" and "Proportional debt".
- **Task 1.3**: Fetch Next Invoice.
  - **Logic**: Query `Invoice` where `status = OPEN`, order by `dueDate` asc, take 1.

### Phase 2: UI Components

- **Task 2.1**: create `MonthSelector` component.
  - **UI**: Dropdown with recent months.
  - **Action**: URL update `?month=X&year=Y` (Server Component refresh).
- **Task 2.2**: Update `SettlementCard.tsx`.
  - **UI**: Show breakdown lines (tooltip or accordion).
  - **UI**: Add "Quitar" button -> Opens Dialog.
  - **Feature**: Dialog form to create `Transaction` (Transfer).
- **Task 2.3**: Update `InvoiceCard.tsx`.
  - **UI**: Highlight "Vence em X dias" (date-fns `differenceInDays`).
- **Task 2.4**: Create `FairnessGraph.tsx`.
  - **Data**: Total Paid by User A / (Total Shared Expenses).
  - **Target**: Fetch `HouseholdConfig.partner1Share` (or default 0.6).
  - **Visual**: Two bars (Target vs Actual).

### Phase 3: Integration & Logic Verification

- **Task 3.1**: Wiring it all in `page.tsx`.
- **Task 3.2**: Manual Verification (Check math e.g. create a 60/40 transaction and see if debt updates correctly).

## 7. Phase X: Verification

- [ ] **Lint**: `npm run lint`
- [ ] **Build**: `npm run build`
- [ ] **Manual Test**:
  - Select previous month -> Data refreshes.
  - Create proportional expense -> Settlement updates correctly.
  - Click "Quitar" -> Creates transfer -> Debt reduces.
