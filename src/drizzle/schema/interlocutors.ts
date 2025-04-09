
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateShortId } from '../../utils/generate-id'

export const interlocutors = pgTable('interlocutors', {
     id: text('id')
    .primaryKey()
    .$defaultFn(() => generateShortId()),
     name: text('name').notNull(),
     contact: text('contact').notNull(),
     email: text('email').unique().notNull(),
     status: boolean('status').default(true).notNull(), 
     created_at: timestamp('created_at').notNull().defaultNow(),
     updated_at: timestamp('updated_at'),
     deleted_at: timestamp('deleted_at'),
})
