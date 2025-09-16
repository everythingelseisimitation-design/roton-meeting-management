import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  uuid,
  pgEnum,
  boolean,
  date,
  time,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const departmentEnum = pgEnum('department', ['marketing', 'digital', 'ar_international']);
export const roleEnum = pgEnum('role', ['admin', 'head_of_marketing', 'marketing_team', 'digital', 'ar_international']);
export const meetingTypeEnum = pgEnum('meeting_type', ['marketing', 'focus_songs_update', 'focus_songs_strategy', 'weekly_recap']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'paused', 'not_done', 'cancelled']);
export const songStatusEnum = pgEnum('song_status', ['active', 'promoted', 'planning', 'paused']);
export const trackCategoryEnum = pgEnum('track_category', ['active_focus', 'back_catalog']);
export const channelEnum = pgEnum('channel', ['youtube', 'spotify', 'social_media', 'press', 'radio', 'general']);
export const actionStatusEnum = pgEnum('action_status', ['planned', 'in_progress', 'completed', 'postponed']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  department: departmentEnum("department"),
  role: roleEnum("role").default('marketing_team'),
  jobTitle: varchar("job_title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  department: departmentEnum("department").notNull(),
  jobTitle: varchar("job_title").notNull(),
  responsibilities: text("responsibilities"),
  email: varchar("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  type: meetingTypeEnum("type").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: time("time").notNull(),
  duration: varchar("duration").default('60'),
  participants: text("participants").array(),
  agenda: text("agenda").array(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  status: varchar("status").default('scheduled'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Focus songs table
export const focusSongs = pgTable("focus_songs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artist: varchar("artist").notNull(),
  status: songStatusEnum("status").default('active'),
  category: trackCategoryEnum("category").default('active_focus'),
  releaseDate: date("release_date"),
  youtubeProgress: text("youtube_progress"),
  socialMediaProgress: text("social_media_progress"),
  spotifyProgress: text("spotify_progress"),
  radioProgress: text("radio_progress"),
  pressProgress: text("press_progress"),
  youtubeResponsible: varchar("youtube_responsible"),
  socialMediaResponsible: varchar("social_media_responsible"),
  spotifyResponsible: varchar("spotify_responsible"),
  radioResponsible: varchar("radio_responsible"),
  pressResponsible: varchar("press_responsible"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: uuid("assigned_to").references(() => teamMembers.id),
  assignedToName: varchar("assigned_to_name"),
  status: taskStatusEnum("status").default('todo'),
  priority: varchar("priority").default('medium'),
  deadline: date("deadline"),
  meetingId: uuid("meeting_id").references(() => meetings.id),
  focusSongId: uuid("focus_song_id").references(() => focusSongs.id),
  channel: channelEnum("channel"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meeting minutes table
export const meetingMinutes = pgTable("meeting_minutes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: uuid("meeting_id").references(() => meetings.id).notNull(),
  participants: text("participants").array(),
  duration: varchar("duration"),
  agenda: text("agenda").array(),
  decisions: text("decisions").array(),
  assignedTasks: text("assigned_tasks").array(),
  focusSongsDiscussed: text("focus_songs_discussed").array(),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily metrics tracking for focus songs
export const dailyMetrics = pgTable("daily_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  focusSongId: uuid("focus_song_id").references(() => focusSongs.id).notNull(),
  date: date("date").notNull(),
  channel: channelEnum("channel").notNull(),
  // YouTube metrics
  youtubeViews: varchar("youtube_views"),
  youtubeAdViews: varchar("youtube_ad_views"),
  youtubeAvgTime: varchar("youtube_avg_time"),
  // Spotify metrics
  spotifyStreams: varchar("spotify_streams"),
  spotifyPlaylistEntries: varchar("spotify_playlist_entries"),
  // Social Media metrics
  instagramViews: varchar("instagram_views"),
  tiktokViews: varchar("tiktok_views"),
  tiktokVideosPerSound: varchar("tiktok_videos_per_sound"),
  // Enhanced Social Media Tracking
  // TikTok Post Tracking
  tiktokPostLink: varchar("tiktok_post_link"),
  tiktokPostViews: varchar("tiktok_post_views"),
  tiktokPostShares: varchar("tiktok_post_shares"),
  tiktokPostLikes: varchar("tiktok_post_likes"),
  tiktokPostSaves: varchar("tiktok_post_saves"),
  // Instagram Post Tracking
  instagramPostLink: varchar("instagram_post_link"),
  instagramPostViews: varchar("instagram_post_views"),
  instagramPostLikes: varchar("instagram_post_likes"),
  // User Generated Content Tracking
  instagramVideosUsingSound: varchar("instagram_videos_using_sound"),
  tiktokVideosUsingSound: varchar("tiktok_videos_using_sound"),
  // Press metrics
  pressReleasePickups: varchar("press_release_pickups"),
  // Radio metrics
  radioStationsPlaying: varchar("radio_stations_playing"),
  radioTotalPlays: varchar("radio_total_plays"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Action planning and assignments
export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'focus_song', 'task', 'meeting', 'calendar'
  relatedId: uuid("related_id"), // ID of related focus song, task, meeting
  channel: channelEnum("channel"),
  assignedTo: varchar("assigned_to"),
  assignedToName: varchar("assigned_to_name"),
  status: actionStatusEnum("status").default('planned'),
  priority: varchar("priority").default('medium'),
  dueDate: date("due_date"),
  completedDate: date("completed_date"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar actions - "Things We Said We Gonna Do"
export const calendarActions = pgTable("calendar_actions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  sourceType: varchar("source_type").notNull(), // 'task', 'meeting', 'focus_song', 'manual'
  sourceId: uuid("source_id"), // ID of source item
  assignedTo: varchar("assigned_to"),
  assignedToName: varchar("assigned_to_name"),
  isCompleted: boolean("is_completed").default(false),
  completedDate: date("completed_date"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Historical tracking for auditing
export const historyLog = pgTable("history_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // 'focus_song', 'task', 'meeting', etc.
  entityId: uuid("entity_id").notNull(),
  action: varchar("action").notNull(), // 'created', 'updated', 'deleted', 'status_changed'
  fieldName: varchar("field_name"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meetings: many(meetings),
  tasks: many(tasks),
  meetingMinutes: many(meetingMinutes),
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  tasks: many(tasks),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  createdBy: one(users, { fields: [meetings.createdBy], references: [users.id] }),
  tasks: many(tasks),
  meetingMinutes: many(meetingMinutes),
}));

export const focusSongsRelations = relations(focusSongs, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(teamMembers, { fields: [tasks.assignedTo], references: [teamMembers.id] }),
  createdBy: one(users, { fields: [tasks.createdBy], references: [users.id] }),
  meeting: one(meetings, { fields: [tasks.meetingId], references: [meetings.id] }),
  focusSong: one(focusSongs, { fields: [tasks.focusSongId], references: [focusSongs.id] }),
}));

export const meetingMinutesRelations = relations(meetingMinutes, ({ one }) => ({
  meeting: one(meetings, { fields: [meetingMinutes.meetingId], references: [meetings.id] }),
  createdBy: one(users, { fields: [meetingMinutes.createdBy], references: [users.id] }),
}));

export const dailyMetricsRelations = relations(dailyMetrics, ({ one }) => ({
  focusSong: one(focusSongs, { fields: [dailyMetrics.focusSongId], references: [focusSongs.id] }),
  createdBy: one(users, { fields: [dailyMetrics.createdBy], references: [users.id] }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  createdBy: one(users, { fields: [actionItems.createdBy], references: [users.id] }),
}));

export const calendarActionsRelations = relations(calendarActions, ({ one }) => ({
  createdBy: one(users, { fields: [calendarActions.createdBy], references: [users.id] }),
}));

export const historyLogRelations = relations(historyLog, ({ one }) => ({
  user: one(users, { fields: [historyLog.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFocusSongSchema = createInsertSchema(focusSongs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingMinutesSchema = createInsertSchema(meetingMinutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyMetricsSchema = createInsertSchema(dailyMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarActionSchema = createInsertSchema(calendarActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHistoryLogSchema = createInsertSchema(historyLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type FocusSong = typeof focusSongs.$inferSelect;
export type InsertFocusSong = z.infer<typeof insertFocusSongSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type MeetingMinutes = typeof meetingMinutes.$inferSelect;
export type InsertMeetingMinutes = z.infer<typeof insertMeetingMinutesSchema>;
export type DailyMetrics = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetrics = z.infer<typeof insertDailyMetricsSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type CalendarAction = typeof calendarActions.$inferSelect;
export type InsertCalendarAction = z.infer<typeof insertCalendarActionSchema>;
export type HistoryLog = typeof historyLog.$inferSelect;
export type InsertHistoryLog = z.infer<typeof insertHistoryLogSchema>;
