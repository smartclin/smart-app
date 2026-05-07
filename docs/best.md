```markdown
# Best Practices Guide - Smart Clinic Pediatric App

## Architecture Overview

This app uses a fully type-safe stack: **Drizzle ORM** → **oRPC** → **TanStack Table/Form/Query**

```
Database (SQLite) → Drizzle ORM → oRPC → TanStack Query → TanStack Table/Form → UI
                    ↑                    ↑
              Source of Truth      Type-Safe Bridge
```

---

## 1. Database Layer (Drizzle ORM)

### DO ✅
```typescript
// Define schemas with proper relations
export const patient = sqliteTable("patient", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp_ms" }).notNull(),
  clinicId: text("clinic_id").notNull(),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
}, table => [
  index("patients_clinic_active_idx").on(table.clinicId, table.isActive),
  index("patients_name_idx").on(table.lastName, table.firstName)
]);

// Use relations for complex queries
export const patientRelations = relations(patient, ({ many }) => ({
  appointments: many(appointment),
  immunizations: many(immunization),
  growthRecords: many(growthRecord)
}));
```

### DON'T ❌
```typescript
// Don't skip indexes on frequently queried columns
// Don't forget soft-delete patterns for medical records
// Don't use any instead of proper types
```

---

## 2. oRPC Procedures (Type-Safe API)

### DO ✅
```typescript
// Define input schemas with Zod
export const listPatients = protectedProcedure
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }))
  .output(z.object({
    patients: z.array(PatientSchema),
    total: z.number(),
    totalPages: z.number()
  }))
  .handler(async ({ input, context }) => {
    const { clinicId, db } = context;

    let whereClause = and(
      eq(patient.clinicId, clinicId),
      eq(patient.isDeleted, false)
    );

    if (input.search) {
      whereClause = and(whereClause,
        or(
          like(patient.firstName, `%${input.search}%`),
          like(patient.lastName, `%${input.search}%`)
        )
      );
    }

    const patients = await db.query.patient.findMany({
      where: whereClause,
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      orderBy: desc(patient.createdAt)
    });

    const total = await db.$count(patient, whereClause);

    return { patients, total, totalPages: Math.ceil(total / input.limit) };
  });
```

### DON'T ❌
```typescript
// Don't skip input validation
// Don't throw generic errors without context
// Don't forget to check user permissions (clinicId, role)
```

---

## 3. TanStack Table (Data Display)

### DO ✅
```typescript
// Import types from oRPC
import type { RouterOutputs } from "#/orpc/client";
type Patient = RouterOutputs["patients"]["list"]["patients"][number];

// Define columns with full type safety
export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {getInitials(row.original.firstName, row.original.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      const navigate = useNavigate();

      return (
        <DropdownMenu>
          <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/patients/${patient.id}` })}>
            View Details
          </DropdownMenuItem>
        </DropdownMenu>
      );
    }
  }
];

// Use manual pagination with oRPC
const table = useReactTable({
  data: patients,
  columns,
  pageCount: totalPages,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  state: { pagination, sorting, columnFilters },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
});
```

### DON'T ❌
```typescript
// Don't use any for row data
// Don't do client-side pagination for large datasets
// Don't forget to memoize columns with useMemo
```

---

## 4. TanStack Form (Data Entry)

### DO ✅
```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

// Schema from Drizzle (via drizzle-zod)
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional(),
});

function PatientForm({ patient, onSubmit }: PatientFormProps) {
  const form = useForm({
    defaultValues: patient || {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
    },
    validatorAdapter: zodValidator(),
    validators: { onChange: patientSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form.Provider>
      <form.Field name="firstName">
        {(field) => (
          <div>
            <label>First Name</label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <p key={error} className="text-red-500">{error}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Saving..." : "Save Patient"}
          </button>
        )}
      </form.Subscribe>
    </form.Provider>
  );
}
```

### DON'T ❌
```typescript
// Don't skip validation on the client side
// Don't forget to handle loading states
// Don't manually manage form state with useState
```

---

## 5. TanStack Query (Data Fetching)

### DO ✅
```typescript
// Use query keys that include all dependencies
const { data, isLoading, refetch } = useQuery({
  queryKey: ["patients", page, limit, search],
  queryFn: () => orpc.patients.list.call({ page, limit, search }),
});

// Prefetch data in route loader
export const Route = createFileRoute("/dashboard/patients")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["patients", 1, 10, ""],
      queryFn: () => orpc.patients.list.call({ page: 1, limit: 10 }),
    });
  },
});

// Invalidate queries after mutations
const createPatient = useMutation({
  mutationFn: orpc.patients.create.call,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    toast.success("Patient created successfully");
  },
});
```

### DON'T ❌
```typescript
// Don't use fetch directly - use oRPC
// Don't forget to invalidate related queries after mutations
// Don't ignore loading and error states
```

---

## 6. Folder Structure

```
src/
├── db/
│   ├── schema.ts           # Drizzle schemas
│   ├── relations.ts        # Drizzle relations
│   └── migrations/         # Auto-generated migrations
├── orpc/
│   ├── router/
│   │   ├── patient.ts      # Patient procedures
│   │   ├── appointment.ts  # Appointment procedures
│   │   ├── growth.ts       # Growth tracking procedures
│   │   └── immunization.ts # Immunization procedures
│   ├── client.ts           # oRPC client setup
│   └── context.ts          # Request context
├── routes/
│   └── dashboard/
│       ├── patients.tsx    # Patient list page
│       ├── patients/
│       │   ├── $id.tsx     # Patient detail page
│       │   └── new.tsx     # New patient form
│       └── appointments.tsx
└── components/
    └── table/
        └── patients-table.tsx  # Reusable table component
```

---

## 7. Pediatric-Specific Best Practices

### Age Calculations
```typescript
// ALWAYS use months for children under 2
function formatAge(dateOfBirth: Date): string {
  const months = calculateAgeInMonths(dateOfBirth);
  if (months < 24) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''}`;
}

// Store age in days/months for growth charts
const growthRecord = {
  ageDays: calculateAgeInDays(birthDate, visitDate),
  ageMonths: calculateAgeInMonths(birthDate, visitDate),
};
```

### Growth Tracking
```typescript
// Use WHO growth standards
const weightForAgeZ = calculateZScore(
  weight,```markdown
# Best Practices Guide - Smart Clinic Pediatric App

## Architecture Overview

This app uses a fully type-safe stack: **Drizzle ORM** → **oRPC** → **TanStack Table/Form/Query**

```
Database (SQLite) → Drizzle ORM → oRPC → TanStack Query → TanStack Table/Form → UI
                    ↑                    ↑
              Source of Truth      Type-Safe Bridge
```

---

## 1. Database Layer (Drizzle ORM)

### DO ✅
```typescript
// Define schemas with proper relations
export const patient = sqliteTable("patient", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp_ms" }).notNull(),
  clinicId: text("clinic_id").notNull(),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
}, table => [
  index("patients_clinic_active_idx").on(table.clinicId, table.isActive),
  index("patients_name_idx").on(table.lastName, table.firstName)
]);

// Use relations for complex queries
export const patientRelations = relations(patient, ({ many }) => ({
  appointments: many(appointment),
  immunizations: many(immunization),
  growthRecords: many(growthRecord)
}));
```

### DON'T ❌
```typescript
// Don't skip indexes on frequently queried columns
// Don't forget soft-delete patterns for medical records
// Don't use any instead of proper types
```

---

## 2. oRPC Procedures (Type-Safe API)

### DO ✅
```typescript
// Define input schemas with Zod
export const listPatients = protectedProcedure
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }))
  .output(z.object({
    patients: z.array(PatientSchema),
    total: z.number(),
    totalPages: z.number()
  }))
  .handler(async ({ input, context }) => {
    const { clinicId, db } = context;

    let whereClause = and(
      eq(patient.clinicId, clinicId),
      eq(patient.isDeleted, false)
    );

    if (input.search) {
      whereClause = and(whereClause,
        or(
          like(patient.firstName, `%${input.search}%`),
          like(patient.lastName, `%${input.search}%`)
        )
      );
    }

    const patients = await db.query.patient.findMany({
      where: whereClause,
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      orderBy: desc(patient.createdAt)
    });

    const total = await db.$count(patient, whereClause);

    return { patients, total, totalPages: Math.ceil(total / input.limit) };
  });
```

### DON'T ❌
```typescript
// Don't skip input validation
// Don't throw generic errors without context
// Don't forget to check user permissions (clinicId, role)
```

---

## 3. TanStack Table (Data Display)

### DO ✅
```typescript
// Import types from oRPC
import type { RouterOutputs } from "#/orpc/client";
type Patient = RouterOutputs["patients"]["list"]["patients"][number];

// Define columns with full type safety
export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {getInitials(row.original.firstName, row.original.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      const navigate = useNavigate();

      return (
        <DropdownMenu>
          <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/patients/${patient.id}` })}>
            View Details
          </DropdownMenuItem>
        </DropdownMenu>
      );
    }
  }
];

// Use manual pagination with oRPC
const table = useReactTable({
  data: patients,
  columns,
  pageCount: totalPages,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  state: { pagination, sorting, columnFilters },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
});
```

### DON'T ❌
```typescript
// Don't use any for row data
// Don't do client-side pagination for large datasets
// Don't forget to memoize columns with useMemo
```

---

## 4. TanStack Form (Data Entry)

### DO ✅
```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

// Schema from Drizzle (via drizzle-zod)
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional(),
});

function PatientForm({ patient, onSubmit }: PatientFormProps) {
  const form = useForm({
    defaultValues: patient || {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
    },
    validatorAdapter: zodValidator(),
    validators: { onChange: patientSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form.Provider>
      <form.Field name="firstName">
        {(field) => (
          <div>
            <label>First Name</label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <p key={error} className="text-red-500">{error}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Saving..." : "Save Patient"}
          </button>
        )}
      </form.Subscribe>
    </form.Provider>
  );
}
```

### DON'T ❌
```typescript
// Don't skip validation on the client side
// Don't forget to handle loading states
// Don't manually manage form state with useState
```

---

## 5. TanStack Query (Data Fetching)

### DO ✅
```typescript
// Use query keys that include all dependencies
const { data, isLoading, refetch } = useQuery({
  queryKey: ["patients", page, limit, search],
  queryFn: () => orpc.patients.list.call({ page, limit, search }),
});

// Prefetch data in route loader
export const Route = createFileRoute("/dashboard/patients")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["patients", 1, 10, ""],
      queryFn: () => orpc.patients.list.call({ page: 1, limit: 10 }),
    });
  },
});

// Invalidate queries after mutations
const createPatient = useMutation({
  mutationFn: orpc.patients.create.call,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    toast.success("Patient created successfully");
  },
});
```

### DON'T ❌
```typescript
// Don't use fetch directly - use oRPC
// Don't forget to invalidate related queries after mutations
// Don't ignore loading and error states
```

---

## 6. Folder Structure

```
src/
├── db/
│   ├── schema.ts           # Drizzle schemas
│   ├── relations.ts        # Drizzle relations
│   └── migrations/         # Auto-generated migrations
├── orpc/
│   ├── router/
│   │   ├── patient.ts      # Patient procedures
│   │   ├── appointment.ts  # Appointment procedures
│   │   ├── growth.ts       # Growth tracking procedures
│   │   └── immunization.ts # Immunization procedures
│   ├── client.ts           # oRPC client setup
│   └── context.ts          # Request context
├── routes/
│   └── dashboard/
│       ├── patients.tsx    # Patient list page
│       ├── patients/
│       │   ├── $id.tsx     # Patient detail page
│       │   └── new.tsx     # New patient form
│       └── appointments.tsx
└── components/
    └── table/
        └── patients-table.tsx  # Reusable table component
```

---

## 7. Pediatric-Specific Best Practices

### Age Calculations
```typescript
// ALWAYS use months for children under 2
function formatAge(dateOfBirth: Date): string {
  const months = calculateAgeInMonths(dateOfBirth);
  if (months < 24) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''}`;
}

// Store age in days/months for growth charts
const growthRecord = {
  ageDays: calculateAgeInDays(birthDate, visitDate),
  ageMonths: calculateAgeInMonths(birthDate, visitDate),
};
```

### Growth Tracking
```typescript
// Use WHO growth standards
const weightForAgeZ = calculateZScore(
  weight,
  whoStandard.mValue,
  whoStandard.lValue,
  whoStandard.sValue
);

// Percentile classification
const getWeightStatus = (zScore: number): string => {
  if (zScore < -3) return "Severely Underweight";
  if (zScore < -2) return "Underweight";
  if (zScore <= 1) return "Normal";
  if (zScore <= 2) return "Overweight";
  return "Obese";
};
```

### Immunization Schedule
```typescript
// Always check due vaccines based on age
const dueVaccines = vaccineSchedule.filter(vaccine => {
  const ageInDays = calculateAgeInDays(patient.dateOfBirth, new Date());
  return ageInDays >= vaccine.ageInDaysMin && ageInDays <= vaccine.ageInDaysMax;
});
```

---

## 8. Error Handling

### DO ✅
```typescript
try {
  await createPatient.mutateAsync(formData);
} catch (error) {
  if (error instanceof ORPCError) {
    if (error.code === "UNAUTHORIZED") {
      toast.error("Please log in again");
    } else if (error.code === "FORBIDDEN") {
      toast.error("You don't have permission");
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error("An unexpected error occurred");
    console.error(error);
  }
}
```

---

## 9. Performance Tips

1. **Use manual pagination** for TanStack Table with large datasets
2. **Prefetch data** in route loaders when possible
3. **Memoize expensive calculations** (age, percentiles)
4. **Use React.memo** for table rows and form components
5. **Virtualize long lists** (react-virtuoso for 1000+ items)

---

## 10. Security Checklist

- [ ] All oRPC procedures use authentication middleware
- [ ] Clinic ID is checked in every query (multi-tenant isolation)
- [ ] Soft delete is used for medical records (never hard delete)
- [ ] Input validation with Zod on ALL procedures
- [ ] Row-level security via context.clinicId
- [ ] HTTPS in production
- [ ] Rate limiting on auth endpoints

---

## Quick Reference

| Task | Library | Pattern |
|------|---------|---------|
| Define database schema | Drizzle | `sqliteTable()` |
| Query database | Drizzle | `db.query.patient.findMany()` |
| Create API endpoint | oRPC | `protectedProcedure.handler()` |
| Fetch data in React | TanStack Query | `useQuery(orpc.xxx.queryOptions())` |
| Display data table | TanStack Table | `useReactTable()` + `ColumnDef<T>[]` |
| Forms with validation | TanStack Form | `useForm()` + `zodValidator()` |
| Global state | TanStack Store | Only for UI state (sidebar, modals) |

---

## Type Safety Flow

```typescript
// 1. Define in Drizzle
const patient = sqliteTable("patient", {
  firstName: text("first_name").notNull(),
});

// 2. oRPC infers types automatically
export const listPatients = publicProcedure.query(() => {
  return db.select().from(patient);
});

// 3. Use in TanStack Table
import type { RouterOutputs } from "#/orpc/client";
type Patient = RouterOutputs["patients"]["list"][number];
const columns: ColumnDef<Patient>[] = [...];

// 4. TypeScript catches ALL mismatches
// If you rename 'firstName' to 'givenName' in Drizzle:
// - oRPC shows error
// - Table column shows error
// - Form field shows error
```

This stack ensures you never have runtime type mismatches between your database and UI!
```
  whoStandard.mValue,
  whoStandard.lValue,
  whoStandard.sValue
);

// Percentile classification
const getWeightStatus = (zScore: number): string => {
  if (zScore < -3) return "Severely Underweight";
  if (zScore < -2) return "Underweight";
  if (zScore <= 1) return "Normal";
  if (zScore <= 2) return "Overweight";
  return "Obese";
};
```

### Immunization Schedule
```typescript
// Always check due vaccines based on age
const dueVaccines = vaccineSchedule.filter(vaccine => {
  const ageInDays = calculateAgeInDays(patient.dateOfBirth, new Date());
  return ageInDays >= vaccine.ageInDaysMin && ageInDays <= vaccine.ageInDaysMax;
});
```

---

## 8. Error Handling

### DO ✅
```typescript
try {
  await createPatient.mutateAsync(formData);
} catch (error) {
  if (error instanceof ORPCError) {
    if (error.code === "UNAUTHORIZED") {
      toast.error("Please log in again");
    } else if (error.code === "FORBIDDEN") {
      toast.error("You don't have permission");
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error("An unexpected error occurred");
    console.error(error);
  }
}
```

---

## 9. Performance Tips

1. **Use manual pagination** for TanStack Table with large datasets
2. **Prefetch data** in route loaders when possible
3. **Memoize expensive calculations** (age, percentiles)
4. **Use React.memo** for table rows and form components
5. **Virtualize long lists** (react-virtuoso for 1000+ items)

---

## 10. Security Checklist

- [ ] All oRPC procedures use authentication middleware
- [ ] Clinic ID is checked in every query (multi-tenant isolation)
- [ ] Soft delete is used for medical records (never hard delete)
- [ ] Input validation with Zod on ALL procedures
- [ ] Row-level security via context.clinicId
- [ ] HTTPS in production
- [ ] Rate limiting on auth endpoints

---

## Quick Reference

| Task | Library | Pattern |
|------|---------|---------|
| Define database schema | Drizzle | `sqliteTable()` |
| Query database | Drizzle | `db.query.patient.findMany()` |
| Create API endpoint | oRPC | `protectedProcedure.handler()` |
| Fetch data in React | TanStack Query | `useQuery(orpc.xxx.queryOptions())` |
| Display data table | TanStack Table | `useReactTable()` + `ColumnDef<T>[]` |
| Forms with validation | TanStack Form | `useForm()` + `zodValidator()` |
| Global state | TanStack Store | Only for UI state (sidebar, modals) |

---

## Type Safety Flow

```typescript
// 1. Define in Drizzle
const patient = sqliteTable("patient", {
  firstName: text("first_name").notNull(),
});

// 2. oRPC infers types automatically
export const listPatients = publicProcedure.query(() => {
  return db.select().from(patient);
});

// 3. Use in TanStack Table
import type { RouterOutputs } from "#/orpc/client";
type Patient = RouterOutputs["patients"]["list"][number];
const columns: ColumnDef<Patient>[] = [...];

// 4. TypeScript catches ALL mismatches
// If you rename 'firstName' to 'givenName' in Drizzle:
// - oRPC shows error
// - Table column shows error
// - Form field shows error
```

This stack ensures you never have runtime type mismatches between your database and UI!
```
