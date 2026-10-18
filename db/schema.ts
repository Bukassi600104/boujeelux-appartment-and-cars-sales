import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
export const cmsState=sqliteTable("cms_state",{id:integer("id").primaryKey(),content:text("content").notNull(),revision:integer("revision").notNull().default(0),updatedAt:text("updated_at").notNull()});
export const cmsAudit=sqliteTable("cms_audit",{id:integer("id").primaryKey({autoIncrement:true}),actor:text("actor").notNull(),action:text("action").notNull(),createdAt:text("created_at").notNull()});
export const enquiries=sqliteTable("enquiries",{id:text("id").primaryKey(),type:text("type").notNull(),payload:text("payload").notNull(),status:text("status").notNull().default("New"),createdAt:text("created_at").notNull(),rateKey:text("rate_key").notNull()});
export const cmsMedia=sqliteTable("cms_media",{key:text("key").primaryKey(),name:text("name").notNull(),type:text("type").notNull(),size:integer("size").notNull(),createdAt:text("created_at").notNull()});
