CREATE TYPE "public"."content_type" AS ENUM('exercise', 'chapter', 'note', 'past_paper', 'mcq');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('exercise', 'miscellaneous', 'additional', 'intext');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('short', 'long', 'mcq', 'numerical', 'true_false', 'fill_in_blank');--> statement-breakpoint
CREATE TYPE "public"."standard_level" AS ENUM('primary', 'secondary', 'higher_secondary');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "boards" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"state" text,
	"description" text,
	"logo_url" text,
	"meta_title" text,
	"meta_description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" text NOT NULL,
	"content_type" "content_type" NOT NULL,
	"content_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_id_content_type_content_id_pk" PRIMARY KEY("user_id","content_type","content_id")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"chapter_number" integer NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"exercise_number" text NOT NULL,
	"type" "exercise_type" DEFAULT 'exercise' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"content_type" "content_type" NOT NULL,
	"content_id" text NOT NULL,
	"user_id" text,
	"message" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text NOT NULL,
	"correct_option" text NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"chapter_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_html" text,
	"author_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "past_papers" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"standard_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"month" text,
	"paper_url" text,
	"solution_available" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"exercise_id" text NOT NULL,
	"question_number" text NOT NULL,
	"question_text" text NOT NULL,
	"question_html" text,
	"difficulty" "difficulty" DEFAULT 'medium' NOT NULL,
	"marks" integer,
	"type" "question_type" DEFAULT 'short' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solutions" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"solution_text" text NOT NULL,
	"solution_html" text,
	"steps" jsonb,
	"is_verified" boolean DEFAULT false NOT NULL,
	"author_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standards" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"class_number" integer NOT NULL,
	"level" "standard_level" NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"standard_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "views" (
	"content_type" "content_type" NOT NULL,
	"content_id" text NOT NULL,
	"day" date DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "views_content_type_content_id_day_pk" PRIMARY KEY("content_type","content_id","day")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcqs" ADD CONSTRAINT "mcqs_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_papers" ADD CONSTRAINT "past_papers_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_papers" ADD CONSTRAINT "past_papers_standard_id_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."standards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_papers" ADD CONSTRAINT "past_papers_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standards" ADD CONSTRAINT "standards_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_standard_id_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."standards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "boards_slug_uniq" ON "boards" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "boards_sort_idx" ON "boards" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "bookmarks_user_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_subject_slug_uniq" ON "chapters" USING btree ("subject_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_subject_number_uniq" ON "chapters" USING btree ("subject_id","chapter_number");--> statement-breakpoint
CREATE INDEX "chapters_subject_sort_idx" ON "chapters" USING btree ("subject_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_chapter_slug_uniq" ON "exercises" USING btree ("chapter_id","slug");--> statement-breakpoint
CREATE INDEX "exercises_chapter_sort_idx" ON "exercises" USING btree ("chapter_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "mcqs_question_uniq" ON "mcqs" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notes_subject_slug_uniq" ON "notes" USING btree ("subject_id","slug");--> statement-breakpoint
CREATE INDEX "notes_subject_idx" ON "notes" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "past_papers_subject_slug_uniq" ON "past_papers" USING btree ("subject_id","slug");--> statement-breakpoint
CREATE INDEX "past_papers_taxonomy_idx" ON "past_papers" USING btree ("board_id","standard_id","subject_id","year");--> statement-breakpoint
CREATE INDEX "questions_exercise_idx" ON "questions" USING btree ("exercise_id","sort_order");--> statement-breakpoint
CREATE INDEX "questions_text_fts" ON "questions" USING gin (to_tsvector('english', "question_text"));--> statement-breakpoint
CREATE INDEX "solutions_question_idx" ON "solutions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "solutions_text_fts" ON "solutions" USING gin (to_tsvector('english', "solution_text"));--> statement-breakpoint
CREATE UNIQUE INDEX "standards_board_slug_uniq" ON "standards" USING btree ("board_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "standards_board_class_uniq" ON "standards" USING btree ("board_id","class_number");--> statement-breakpoint
CREATE INDEX "standards_board_idx" ON "standards" USING btree ("board_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_standard_slug_uniq" ON "subjects" USING btree ("standard_id","slug");--> statement-breakpoint
CREATE INDEX "subjects_standard_idx" ON "subjects" USING btree ("standard_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uniq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "views_content_idx" ON "views" USING btree ("content_type","content_id");