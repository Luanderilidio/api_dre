
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { generateShortId } from '../../utils/generate-id'

export const subscriptions = pgTable('subscriptions', {
     id: text('id')
         .primaryKey()
         .$defaultFn(() => generateShortId()),
     name: text('name').notNull(),
     email: text('email').notNull().unique(),
     created_at: timestamp('created_at').notNull().defaultNow(),
     updated_at: timestamp('updated_at'),
     deleted_at: timestamp('deleted_at'),
})