# 📚 Documentação do Banco de Dados - Financeiro Familiar

Esta documentação descreve a estrutura, relacionamentos e a lógica de negócios implementada no banco de dados do sistema. O objetivo é garantir a integridade dos dados financeiros de um casal (Cledson & Kevellyn), permitindo controle individual e compartilhado.

---

## 🧠 Conceitos Fundamentais

### 1. Separação de Responsabilidades

O sistema diferencia claramente:

- **Quem Pagou (`payerId`)**: De qual conta/bolso saiu o dinheiro.
- **De Quem é a Despesa (`ownerId` / `splitMethod`)**: Quem consumiu ou deve arcar com o custo.
- **Onde está o Dinheiro (`Account`)**: O saldo físico (Nubank, Carteira, Investimento).

### 2. Ciclo de Vida do Cartão de Crédito

Transações de crédito não afetam o saldo imediatamente. Elas pertencem a uma **Fatura (`Invoice`)**. O saldo só muda quando a Fatura é paga (transação do tipo `PAYMENT`).

### 3. Fechamento de Mês (`MonthlyBalance`)

Para evitar dívidas infinitas, o sistema trabalha com "Fechamentos". Ao virar o mês, calcula-se quem deve para quem, gera-se um registro estático (`MonthlyBalance`) e o mês seguinte começa "zerado" no Dashboard.

---

## 🛠 Enums (Tipos Padronizados)

O uso de Enums garante consistência e evita "magic strings" no código.

### `TransactionType`

Define a natureza da movimentação.

- **`EXPENSE`**: Saída de dinheiro (Gastos).
- **`INCOME`**: Entrada de dinheiro (Salários, Bônus).
- **`TRANSFER`**: Movimentação interna (De Nubank para Inter) ou **Acerto de Contas (PIX entre o casal)**.
- **`PAYMENT`**: Pagamento de fatura de cartão de crédito.

### `SplitMethod`

Define como a despesa deve ser dividida no Dashboard.

- **`INDIVIDUAL`**: 100% do custo é de uma pessoa (definida em `ownerId`).
- **`SHARED`**: 50% para cada um (Despesas de Casa, Mercado, Lazer Conjunto).
- **`SHARED_PROPORTIONAL`**: **(Novo!)** Divisão customizada (ex: 60/40), definida pelo campo `splitShare` na transação ou pela configuração global da casa.

---

## 🗂 Tabelas Principais (Models)

### 1. `Transaction` (O Coração do Sistema)

Registra qualquer movimentação financeira.

| Campo               | Tipo          | Descrição                                                                                                                                            |
| :------------------ | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | UUID          | Identificador único.                                                                                                                                 |
| `description`       | String        | Nome legível (ex: "Almoço Domingo"). Editável.                                                                                                       |
| `originalDesc`      | String?       | **Rastro de Auditoria**. O texto exato que veio do banco.                                                                                            |
| `amount`            | Decimal       | Valor da transação.                                                                                                                                  |
| `purchaseDate`      | DateTime      | **Data da Compra**. Quando o cartão foi passado.                                                                                                     |
| `paymentDate`       | DateTime?     | **Data do Desembolso**.                                                                                                                              |
| `type`              | Enum          | `EXPENSE`, `INCOME`, `TRANSFER`, `PAYMENT`.                                                                                                          |
| `splitType`         | Enum          | `INDIVIDUAL`, `SHARED`, `SHARED_PROPORTIONAL`.                                                                                                       |
| `splitShare`        | Decimal?      | **(Novo!)** A porcentagem que cabe ao **OUTRO** pagar. Ex: `0.40` significa que o parceiro deve 40%. Se for nulo e o tipo for `SHARED`, assume 0.50. |
| `payerId`           | FK (User)     | **Quem pagou**. O dono da conta de onde saiu o dinheiro.                                                                                             |
| `ownerId`           | FK (User)?    | **Dono da Despesa**.                                                                                                                                 |
| `accountId`         | FK (Account)  | Conta vinculada.                                                                                                                                     |
| `invoiceId`         | FK (Invoice)? | Vínculo com fatura de crédito.                                                                                                                       |
| `installmentId`     | String?       | Agrupador de Parcelas.                                                                                                                               |
| `installment`       | Int           | Número da parcela atual.                                                                                                                             |
| `totalInstallments` | Int           | Total de parcelas.                                                                                                                                   |
| `settled`           | Boolean       | Se já foi acertada (Legado).                                                                                                                         |
| `isArchived`        | Boolean       | Se já foi contabilizada num fechamento mensal.                                                                                                       |

---

### 2. `HouseholdConfig` (Configuração Global da Casa) - **NOVO**

Guarda as regras "padrão" do casal para facilitar o lançamento de novas despesas.

| Campo           | Tipo      | Descrição                                                                                |
| :-------------- | :-------- | :--------------------------------------------------------------------------------------- |
| `partner1Id`    | FK (User) | Usuário principal da regra (ex: Cledson).                                                |
| `partner2Id`    | FK (User) | Usuário secundário (ex: Kevellyn).                                                       |
| `partner1Share` | Decimal   | A porcentagem que o Partner 1 paga nas contas `SHARED_PROPORTIONAL` (Ex: 0.60 para 60%). |
| `updatedAt`     | DateTime  | Data da última alteração na regra.                                                       |

> **Nota:** Ao criar uma transação `SHARED_PROPORTIONAL`, o sistema lê essa tabela para preencher o `splitShare` automaticamente, mas o usuário pode editar o valor naquele lançamento específico.

---

### 3. `Invoice` (Faturas de Cartão)

Agrupa transações de crédito por mês de competência.

| Campo            | Tipo     | Descrição                                         |
| :--------------- | :------- | :------------------------------------------------ |
| `month` / `year` | Int      | Mês/Ano de referência da cobrança (ex: Fev/2026). |
| `dueDate`        | DateTime | Data de Vencimento da fatura.                     |
| `closingDate`    | DateTime | Data de Fechamento (Melhor dia de compra).        |
| `status`         | Enum     | `OPEN`, `CLOSED`, `PAID`.                         |
| `amount`         | Decimal  | Valor total fechado da fatura.                    |
| `accountId`      | FK       | Cartão a que pertence.                            |

> **Lógica de Dashboard:** Transações de `Invoice` aparecem no gráfico de "Gastos" no mês da `purchaseDate`, mas só aparecem no "Contas a Pagar" ou "Acerto de Contas" no mês da `dueDate`.

---

### 3. `MonthlyBalance` (Fechamento Mensal)

Tabela para "zerar" o mês e guardar o histórico de dívidas.

| Campo            | Tipo      | Descrição                                                |
| :--------------- | :-------- | :------------------------------------------------------- |
| `month` / `year` | Int       | Mês do fechamento (ex: Jan/2026).                        |
| `finalBalance`   | Decimal   | Valor que ficou pendente.                                |
| `debtorId`       | FK (User) | Quem ficou devendo (ex: Kevellyn).                       |
| `creditorId`     | FK (User) | Quem tem a receber (ex: Cledson).                        |
| `status`         | String    | "OPEN" (Ainda deve), "PAID" (Já pagou esse mês passado). |

---

### 4. `FixedExpense` (Despesas Recorrentes)

Gabarito para gerar transações automáticas todo mês.

| Campo         | Tipo    | Descrição                        |
| :------------ | :------ | :------------------------------- |
| `description` | String  | Nome da despesa (ex: "Netflix"). |
| `amount`      | Decimal | Valor previsto.                  |
| `dueDay`      | Int     | Dia de vencimento sugerido.      |
| `active`      | Boolean | Se deve gerar cobrança ou não.   |
| `splitType`   | Enum    | Regra de divisão automática.     |

---

## 💡 Fluxos Comuns (How-To)

### A. Como saber "Quem deve pra quem" no mês atual?

O Dashboard roda a seguinte lógica em tempo real:

1. Soma gastos `SHARED` (50%) pagos pelo Cledson.
2. Soma gastos `SHARED` (50%) pagos pela Kevellyn.
3. Soma gastos `INDIVIDUAL` (Dela) pagos pelo Cledson.
4. Soma gastos `INDIVIDUAL` (Dele) pagos pela Kevellyn.
5. **(NOVO) Soma gastos `SHARED_PROPORTIONAL`:**
   - Se Cledson pagou: Kevellyn deve `amount * splitShare` (ex: 40%).
   - Se Kevellyn pagou: Cledson deve `amount * splitShare` (ex: 60%).
6. Subtrai transações do tipo `TRANSFER` (Acertos parciais já feitos no mês).
7. **Resultado:** Saldo Atual do Card Azul.

### B. Como registrar um Acerto (PIX)?

Quando a Kevellyn faz um PIX de R$ 500,00 para o Cledson:

1. Criar `Transaction`:
   - `type`: **TRANSFER**
   - `amount`: 500.00
   - `payerId`: Kevellyn (Conta dela)
   - `receiverAccountId`: Conta do Cledson
   - `description`: "Acerto Parcial de Fevereiro"

### C. Como funciona o Parcelamento?

Ao criar uma compra de R$ 1.000,00 em 10x:

1. O Backend gera um `installmentId` único (ex: `uuid-compra-tv`).
2. Cria 10 registros na tabela `Transaction`.
   - `installment`: 1, 2, 3... 10.
   - `amount`: 100.00 cada.
   - `purchaseDate`: Mesma data para todas.
   - `invoiceId`: Cada uma ligada à `Invoice` do mês correspondente (Jan, Fev, Mar...).
3. No Dashboard, apenas a parcela do mês vigente aparece na fatura.
