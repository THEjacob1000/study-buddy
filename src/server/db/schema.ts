import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// User table for storing user information
export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		name: text("name"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [index("user_email_idx").on(table.email)],
);

// Document table for storing uploaded files/texts
export const documents = pgTable("documents", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	fileType: varchar("file_type", { length: 50 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions generated from documents
export const questions = pgTable("questions", {
	id: uuid("id").defaultRandom().primaryKey(),
	documentId: uuid("document_id")
		.notNull()
		.references(() => documents.id, { onDelete: "cascade" }),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User progress on questions
export const questionProgress = pgTable("question_progress", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	questionId: uuid("question_id")
		.notNull()
		.references(() => questions.id, { onDelete: "cascade" }),
	timesCorrect: integer("times_correct").default(0).notNull(),
	lastAttempted: timestamp("last_attempted"),
	completed: boolean("completed").default(false).notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
	documents: many(documents),
	progress: many(questionProgress),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id],
	}),
	questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	document: one(documents, {
		fields: [questions.documentId],
		references: [documents.id],
	}),
	progress: many(questionProgress),
}));

export const questionProgressRelations = relations(
	questionProgress,
	({ one }) => ({
		user: one(users, {
			fields: [questionProgress.userId],
			references: [users.id],
		}),
		question: one(questions, {
			fields: [questionProgress.questionId],
			references: [questions.id],
		}),
	}),
);
