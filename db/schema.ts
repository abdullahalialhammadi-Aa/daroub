import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {
  owner: text('owner').notNull(), entity: text('entity').notNull(), id: text('id').notNull(),
  payload: text('payload').notNull(), revision: integer('revision').notNull(),
  deleted: integer('deleted').notNull().default(0), updatedAt: text('updated_at').notNull(),
  lastOperation: text('last_operation').notNull(),
}, t => [primaryKey({columns:[t.owner,t.entity,t.id]}), index('idx_records_owner_updated').on(t.owner,t.updatedAt)]);
export const receipts = sqliteTable('sync_receipts', {
  owner: text('owner').notNull(), operationId: text('operation_id').notNull(),
  result: text('result').notNull(), createdAt: text('created_at').notNull(),
}, t => [primaryKey({columns:[t.owner,t.operationId]})]);
export const catalogHeads=sqliteTable('catalog_heads',{id:integer('id').primaryKey(),revision:integer('revision').notNull()});
export const catalogVersions=sqliteTable('catalog_versions',{
 revision:integer('revision').primaryKey(),payload:text('payload').notNull(),actor:text('actor').notNull(),publishedAt:text('published_at').notNull(),operation:text('operation').notNull(),restoredFrom:integer('restored_from'),
});
export const catalogDrafts=sqliteTable('catalog_drafts',{
 id:text('id').primaryKey(),revision:integer('revision').notNull(),baseRevision:integer('base_revision').notNull(),payload:text('payload').notNull(),reviewed:text('reviewed').notNull(),updatedAt:text('updated_at').notNull(),actor:text('actor').notNull(),
});
export const teamBoards=sqliteTable('team_boards',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),tripId:text('trip_id').notNull(),
 state:text('state').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),
 inviteHash:text('invite_hash'),inviteExpiresAt:text('invite_expires_at'),closed:integer('closed').notNull().default(0),
},table=>[uniqueIndex('idx_team_boards_owner_trip').on(table.owner,table.tripId)]);
export const localUsers=sqliteTable('local_users',{
 id:text('id').primaryKey(),email:text('email').notNull(),displayName:text('display_name').notNull(),
 passwordHash:text('password_hash').notNull(),recoveryHash:text('recovery_hash').notNull(),
 credentialVersion:integer('credential_version').notNull().default(1),createdAt:integer('created_at').notNull(),
},table=>[uniqueIndex('idx_local_users_email').on(table.email)]);
export const localSessions=sqliteTable('local_sessions',{
 tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull().references(()=>localUsers.id,{onDelete:'cascade'}),
 credentialVersion:integer('credential_version').notNull(),expiresAt:integer('expires_at').notNull(),createdAt:integer('created_at').notNull(),
},table=>[index('idx_local_sessions_user').on(table.userId),index('idx_local_sessions_expiry').on(table.expiresAt)]);
export const authLimits=sqliteTable('auth_limits',{
 key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull(),
},table=>[index('idx_auth_limits_expiry').on(table.resetAt)]);
