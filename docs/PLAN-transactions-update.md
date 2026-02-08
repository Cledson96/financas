# Plan: Transactions Page Update

## 1. Objective

Enhance the transactions page (`src/app/(dashboard)/transactions`) to better reflect the new `database.md` schema, specifically improving the visibility of expense division (Individual vs Shared) and Invoice context. Add intelligent filtering and bulk actions for better management.

## 2. User Requirements

- **Division Column**: Show icons for Individual (User), 50/50 (Scale), 60/40 (Pie Chart).
- **Invoice Column**: Show Invoice Month/Badge for credit card transactions.
- **Intelligent Filters**: Filter by Payer, Division Type (Who owes), and Status.
- **Bulk Actions**: Select multiple rows to change Category or Division.

## 3. Architecture & Data

The backend `GET /api/transactions` already includes necessary relations:

- `User_Transaction_payerIdToUser` (Payer)
- `User_Transaction_ownerIdToUser` (Owner)
- `Invoice` (Invoice Details)
- `splitType` and `splitShare` fields are available in `Transaction` model.

## 4. Proposed Changes

### 4.1. Frontend Components (`src/components/finance`)

#### `TransactionTable.tsx`

- **New Columns**:
  - **Selection**: Add Checkbox to the first column.
  - **Divisão (Division)**:
    - Logic:
      - `INDIVIDUAL`: Icon <User> (Tooltip: "Individual: [Name]")
      - `SHARED`: Icon <Scale> (Tooltip: "50/50")
      - `SHARED_PROPORTIONAL`: Icon <PieChart> (Tooltip: "60/40" - calculated from `splitShare`)
  - **Fatura (Invoice)**:
    - Logic:
      - If `invoiceId` exists: Show Badge with Invoice Month (e.g., "FEV/26").
      - Style: Purple badge for future/open invoices.
- **Bulk Actions**:
  - Implement a floating action bar that appears when rows are selected.
  - Actions: "Editar Categoria", "Editar Divisão", "Excluir".
- **Styling**:
  - Use Lucide icons: `User`, `Scale`, `PieChart`, `Calendar`.

#### `page.tsx` (`src/app/(dashboard)/transactions`)

- **Filters**:
  - Add `payerFilter` (Select: Cledson, Kevellyn).
  - Add `divisionFilter` (Select: Individual, Shared, Proportional).
  - Add `statusFilter` (Select: Pending, Paid).
  - Update `filteredTransactions` logic to include these new filters.
- **State**:
  - Manage `selectedIds` state for bulk actions.

### 4.2. API Interaction

- No major backend changes needed for `GET` as data is present.
- **Bulk Update**:
  - Create `PATCH /api/transactions/bulk` (or handle in loop, but bulk API is better) to update multiple transactions.
  - **New Endpoint**: `src/app/api/transactions/bulk/route.ts` (POST/PATCH).

## 5. Implementation Steps

1.  **Create Bulk API**: Implement `PATCH /api/transactions/bulk` to allow updates to category/division for multiple IDs.
2.  **Update Table UI**:
    - Add "Divisão" column with icons.
    - Add "Fatura" column with badges.
    - Add Checkboxes.
3.  **Add Filters**:
    - Implement the filter UI in `page.tsx` or `TransactionTable.tsx`.
4.  **Implement Bulk Logic**:
    - Connect selection state to Bulk Action bar.
    - Connect Bulk Action buttons to API.

## 6. Verification

- **Visual Check**: Verify icons match the `splitType` correctly.
- **Filter Check**: Filter by "Kevellyn" (Payer) -> Should only show her payments.
- **Bulk Action Check**: Select 2 items -> Change Category -> Verify update.
