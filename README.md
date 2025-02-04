# Infinity the data

## TO-DO
- [x] Create project
- [x] Create db connection
- [x] Be able to migrate schema from db from dev to prod
- [x] Be able to upload data from prod
- [x] Create db schema
- [ ] Get data from db
- [ ] Build tournament page

## Concerns
### 1. DB mutation types
As of now, I am using defined types for the mutation of the database. I don't feel like this is ideal, and I'd like to move it to an approach similar to Prisma's (`Prisma.FooBarInput`).

Some options are:
- `UseInferInserModel`, and `InferSelectModel` from `drizzle-orm` like so:
```ts
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './schema';

// Similar to Prisma.UserCreateInput
type UserInsert = InferInsertModel<typeof users>;

// Similar to Prisma.UserSelect
type UserSelect = InferSelectModel<typeof users>;
```

- Creating custom input types based on your schema. Like so:

```ts
import { sql } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  email: text('email')
});

type UserInput = Omit<UserInsert, 'id'>;
```
