import {
  users,
  teamMembers,
  meetings,
  focusSongs,
  tasks,
  meetingMinutes,
  dailyMetrics,
  actionItems,
  calendarActions,
  historyLog,
  type User,
  type UpsertUser,
  type TeamMember,
  type InsertTeamMember,
  type Meeting,
  type InsertMeeting,
  type FocusSong,
  type InsertFocusSong,
  type Task,
  type InsertTask,
  type MeetingMinutes,
  type InsertMeetingMinutes,
  type DailyMetrics,
  type InsertDailyMetrics,
  type ActionItem,
  type InsertActionItem,
  type CalendarAction,
  type InsertCalendarAction,
  type HistoryLog,
  type InsertHistoryLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMembersByDepartment(department: string): Promise<TeamMember[]>;
  createTeamMember(teamMember: InsertTeamMember, actorUserId?: string): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>, actorUserId?: string): Promise<TeamMember>;
  deleteTeamMember(id: string, actorUserId?: string): Promise<void>;
  
  // Meeting operations
  getAllMeetings(): Promise<Meeting[]>;
  getMeetingById(id: string): Promise<Meeting | undefined>;
  getMeetingsByDateRange(startDate: string, endDate: string): Promise<Meeting[]>;
  getMeetingsByType(type: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting, actorUserId?: string): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<InsertMeeting>, actorUserId?: string): Promise<Meeting>;
  deleteMeeting(id: string, actorUserId?: string): Promise<void>;
  
  // Focus song operations
  getAllFocusSongs(): Promise<FocusSong[]>;
  getFocusSongById(id: string): Promise<FocusSong | undefined>;
  getActiveFocusSongs(): Promise<FocusSong[]>;
  getBackCatalogSongs(): Promise<FocusSong[]>;
  createFocusSong(song: InsertFocusSong, actorUserId?: string): Promise<FocusSong>;
  updateFocusSong(id: string, updates: Partial<InsertFocusSong>, actorUserId?: string): Promise<FocusSong>;
  deleteFocusSong(id: string, actorUserId?: string): Promise<void>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByAssignee(userId: string): Promise<Task[]>;
  getTasksByMeeting(meetingId: string): Promise<Task[]>;
  getTasksByFocusSong(focusSongId: string): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  createTask(task: InsertTask, actorUserId?: string): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>, actorUserId?: string): Promise<Task>;
  deleteTask(id: string, actorUserId?: string): Promise<void>;
  
  // Meeting minutes operations
  getMeetingMinutesByMeeting(meetingId: string): Promise<MeetingMinutes | undefined>;
  createMeetingMinutes(minutes: InsertMeetingMinutes, actorUserId?: string): Promise<MeetingMinutes>;
  updateMeetingMinutes(id: string, updates: Partial<InsertMeetingMinutes>, actorUserId?: string): Promise<MeetingMinutes>;
  
  // Daily metrics operations
  getDailyMetricsByFocusSong(focusSongId: string): Promise<DailyMetrics[]>;
  getDailyMetricsByDate(focusSongId: string, date: string): Promise<DailyMetrics[]>;
  createDailyMetrics(metrics: InsertDailyMetrics, actorUserId?: string): Promise<DailyMetrics>;
  updateDailyMetrics(id: string, updates: Partial<InsertDailyMetrics>, actorUserId?: string): Promise<DailyMetrics>;
  deleteDailyMetrics(id: string, actorUserId?: string): Promise<void>;
  
  // Action items operations
  getAllActionItems(): Promise<ActionItem[]>;
  getActionItemById(id: string): Promise<ActionItem | undefined>;
  getActionItemsByType(type: string): Promise<ActionItem[]>;
  getActionItemsByStatus(status: string): Promise<ActionItem[]>;
  getActionItemsByAssignee(assignedTo: string): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem, actorUserId?: string): Promise<ActionItem>;
  updateActionItem(id: string, updates: Partial<InsertActionItem>, actorUserId?: string): Promise<ActionItem>;
  deleteActionItem(id: string, actorUserId?: string): Promise<void>;
  
  // Calendar actions operations
  getAllCalendarActions(): Promise<CalendarAction[]>;
  getCalendarActionsByDate(date: string): Promise<CalendarAction[]>;
  getCalendarActionsByDateRange(startDate: string, endDate: string): Promise<CalendarAction[]>;
  getPendingCalendarActions(): Promise<CalendarAction[]>;
  createCalendarAction(calendarAction: InsertCalendarAction, actorUserId?: string): Promise<CalendarAction>;
  updateCalendarAction(id: string, updates: Partial<InsertCalendarAction>, actorUserId?: string): Promise<CalendarAction>;
  deleteCalendarAction(id: string, actorUserId?: string): Promise<void>;
  
  // History log operations
  getHistoryByEntity(entityType: string, entityId: string): Promise<HistoryLog[]>;
  createHistoryLog(historyLog: InsertHistoryLog): Promise<HistoryLog>;
  
  // Enhanced focus song operations
  getFocusSongsByCategory(category: string): Promise<FocusSong[]>;
}

export class DatabaseStorage implements IStorage {
  
  // Helper method to log entity changes
  private async logEntityChange(
    entityType: string,
    entityId: string,
    action: string,
    userId: string,
    oldValue?: any,
    newValue?: any,
    fieldName?: string
  ): Promise<void> {
    try {
      await this.createHistoryLog({
        entityType,
        entityId,
        action,
        userId,
        fieldName: fieldName || null,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      });
    } catch (error) {
      console.error('Failed to log entity change:', error);
      // Don't throw here to avoid breaking main operations
    }
  }
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).orderBy(teamMembers.name);
  }

  async getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.department, department as any))
      .orderBy(teamMembers.name);
  }

  async createTeamMember(teamMember: InsertTeamMember, actorUserId?: string): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(teamMember).returning();
    
    // Log creation
    if (actorUserId) {
      await this.logEntityChange(
        'team_member',
        newMember.id,
        'created',
        actorUserId,
        null,
        newMember
      );
    }
    
    return newMember;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>, actorUserId?: string): Promise<TeamMember> {
    // Get the current state before update
    const [oldMember] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    
    const [updated] = await db
      .update(teamMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldMember && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldMember[field as keyof TeamMember] !== newValue) {
          await this.logEntityChange(
            'team_member',
            id,
            'updated',
            actorUserId,
            oldMember[field as keyof TeamMember],
            newValue,
            field
          );
        }
      }
    }
    
    return updated;
  }

  async deleteTeamMember(id: string, actorUserId?: string): Promise<void> {
    // Get the member before deletion for logging
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    
    // Log deletion
    if (member && actorUserId) {
      await this.logEntityChange(
        'team_member',
        id,
        'deleted',
        actorUserId,
        member,
        null
      );
    }
  }

  // Meeting operations
  async getAllMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings).orderBy(desc(meetings.date));
  }

  async getMeetingById(id: string): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async getMeetingsByDateRange(startDate: string, endDate: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(and(
        gte(meetings.date, startDate),
        lte(meetings.date, endDate)
      ))
      .orderBy(meetings.date);
  }

  async getMeetingsByType(type: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(eq(meetings.type, type as any))
      .orderBy(desc(meetings.date));
  }

  async createMeeting(meeting: InsertMeeting, actorUserId?: string): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    
    // Log creation
    await this.logEntityChange(
      'meeting',
      newMeeting.id,
      'created',
      actorUserId || meeting.createdBy,
      null,
      newMeeting
    );
    
    return newMeeting;
  }

  async updateMeeting(id: string, updates: Partial<InsertMeeting>, actorUserId?: string): Promise<Meeting> {
    // Get the current state before update
    const [oldMeeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    
    const [updated] = await db
      .update(meetings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldMeeting && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldMeeting[field as keyof Meeting] !== newValue) {
          await this.logEntityChange(
            'meeting',
            id,
            'updated',
            actorUserId,
            oldMeeting[field as keyof Meeting],
            newValue,
            field
          );
        }
      }
    }
    
    return updated;
  }

  async deleteMeeting(id: string, actorUserId?: string): Promise<void> {
    // Get the meeting before deletion for logging
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    
    await db.delete(meetings).where(eq(meetings.id, id));
    
    // Log deletion
    if (meeting && actorUserId) {
      await this.logEntityChange(
        'meeting',
        id,
        'deleted',
        actorUserId,
        meeting,
        null
      );
    }
  }

  // Focus song operations
  async getAllFocusSongs(): Promise<FocusSong[]> {
    return await db.select().from(focusSongs).orderBy(desc(focusSongs.createdAt));
  }

  async getFocusSongById(id: string): Promise<FocusSong | undefined> {
    const [song] = await db.select().from(focusSongs).where(eq(focusSongs.id, id));
    return song;
  }

  async getActiveFocusSongs(): Promise<FocusSong[]> {
    return await db.select().from(focusSongs)
      .where(and(
        eq(focusSongs.category, 'active_focus'),
        or(
          eq(focusSongs.status, 'active'),
          eq(focusSongs.status, 'promoted'),
          eq(focusSongs.status, 'planning')
        )
      ))
      .orderBy(desc(focusSongs.createdAt));
  }

  async getBackCatalogSongs(): Promise<FocusSong[]> {
    return await db.select().from(focusSongs)
      .where(eq(focusSongs.category, 'back_catalog'))
      .orderBy(desc(focusSongs.createdAt));
  }

  async createFocusSong(song: InsertFocusSong, actorUserId?: string): Promise<FocusSong> {
    const [newSong] = await db.insert(focusSongs).values(song).returning();
    
    // Log creation
    if (actorUserId) {
      await this.logEntityChange(
        'focus_song',
        newSong.id,
        'created',
        actorUserId,
        null,
        newSong
      );
    }
    
    return newSong;
  }

  async updateFocusSong(id: string, updates: Partial<InsertFocusSong>, actorUserId?: string): Promise<FocusSong> {
    // Get the current state before update
    const [oldSong] = await db.select().from(focusSongs).where(eq(focusSongs.id, id));
    
    const [updated] = await db
      .update(focusSongs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(focusSongs.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldSong && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldSong[field as keyof FocusSong] !== newValue) {
          await this.logEntityChange(
            'focus_song',
            id,
            'updated',
            actorUserId,
            oldSong[field as keyof FocusSong],
            newValue,
            field
          );
        }
      }
    }
    
    return updated;
  }

  async deleteFocusSong(id: string, actorUserId?: string): Promise<void> {
    // Get the song before deletion for logging
    const [song] = await db.select().from(focusSongs).where(eq(focusSongs.id, id));
    
    // First, handle foreign key relationships to prevent constraint violations
    // Update tasks to remove reference to this focus song
    await db.update(tasks)
      .set({ focusSongId: null })
      .where(eq(tasks.focusSongId, id));
    
    // Delete daily metrics that reference this focus song (or set to null if preferred)
    await db.delete(dailyMetrics).where(eq(dailyMetrics.focusSongId, id));
    
    // Now safe to delete the focus song
    await db.delete(focusSongs).where(eq(focusSongs.id, id));
    
    // Log deletion
    if (song && actorUserId) {
      await this.logEntityChange(
        'focus_song',
        id,
        'deleted',
        actorUserId,
        song,
        null
      );
    }
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByMeeting(meetingId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.meetingId, meetingId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByFocusSong(focusSongId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.focusSongId, focusSongId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.status, status as any))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask, actorUserId?: string): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    
    // Log creation
    await this.logEntityChange(
      'task',
      newTask.id,
      'created',
      actorUserId || task.createdBy,
      null,
      newTask
    );
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>, actorUserId?: string): Promise<Task> {
    // Get the current state before update
    const [oldTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldTask && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldTask[field as keyof Task] !== newValue) {
          await this.logEntityChange(
            'task',
            id,
            field === 'status' ? 'status_changed' : 'updated',
            actorUserId,
            oldTask[field as keyof Task],
            newValue,
            field
          );
        }
      }
    }
    
    return updated;
  }

  async deleteTask(id: string, actorUserId?: string): Promise<void> {
    // Get the task before deletion for logging
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    
    await db.delete(tasks).where(eq(tasks.id, id));
    
    // Log deletion
    if (task && actorUserId) {
      await this.logEntityChange(
        'task',
        id,
        'deleted',
        actorUserId,
        task,
        null
      );
    }
  }

  // Meeting minutes operations
  async getMeetingMinutesByMeeting(meetingId: string): Promise<MeetingMinutes | undefined> {
    const [minutes] = await db.select().from(meetingMinutes)
      .where(eq(meetingMinutes.meetingId, meetingId));
    return minutes;
  }

  async createMeetingMinutes(minutes: InsertMeetingMinutes, actorUserId?: string): Promise<MeetingMinutes> {
    const [newMinutes] = await db.insert(meetingMinutes).values(minutes).returning();
    
    // Log creation
    await this.logEntityChange(
      'meeting_minutes',
      newMinutes.id,
      'created',
      actorUserId || minutes.createdBy,
      null,
      newMinutes
    );
    
    return newMinutes;
  }

  async updateMeetingMinutes(id: string, updates: Partial<InsertMeetingMinutes>, actorUserId?: string): Promise<MeetingMinutes> {
    // Get the current state before update
    const [oldMinutes] = await db.select().from(meetingMinutes).where(eq(meetingMinutes.id, id));
    
    const [updated] = await db
      .update(meetingMinutes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(meetingMinutes.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldMinutes && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldMinutes[field as keyof MeetingMinutes] !== newValue) {
          await this.logEntityChange(
            'meeting_minutes',
            id,
            'updated',
            actorUserId,
            oldMinutes[field as keyof MeetingMinutes],
            newValue,
            field
          );
        }
      }
    }
    
    return updated;
  }

  // Daily metrics operations
  async getDailyMetricsByFocusSong(focusSongId: string): Promise<DailyMetrics[]> {
    return await db.select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.focusSongId, focusSongId))
      .orderBy(desc(dailyMetrics.date));
  }

  async getDailyMetricsByDate(focusSongId: string, date: string): Promise<DailyMetrics[]> {
    return await db.select()
      .from(dailyMetrics)
      .where(and(
        eq(dailyMetrics.focusSongId, focusSongId),
        eq(dailyMetrics.date, date)
      ));
  }

  async createDailyMetrics(metrics: InsertDailyMetrics, actorUserId?: string): Promise<DailyMetrics> {
    const [newMetrics] = await db.insert(dailyMetrics)
      .values(metrics)
      .returning();
    
    // Log creation
    await this.logEntityChange(
      'daily_metrics',
      newMetrics.id,
      'created',
      actorUserId || metrics.createdBy,
      null,
      newMetrics
    );
    
    return newMetrics;
  }

  async updateDailyMetrics(id: string, updates: Partial<InsertDailyMetrics>, actorUserId?: string): Promise<DailyMetrics> {
    // Get the current state before update
    const [oldMetrics] = await db.select().from(dailyMetrics).where(eq(dailyMetrics.id, id));
    
    const [updatedMetrics] = await db.update(dailyMetrics)
      .set(updates)
      .where(eq(dailyMetrics.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldMetrics && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (oldMetrics[field as keyof DailyMetrics] !== newValue) {
          await this.logEntityChange(
            'daily_metrics',
            id,
            'updated',
            actorUserId,
            oldMetrics[field as keyof DailyMetrics],
            newValue,
            field
          );
        }
      }
    }
    
    return updatedMetrics;
  }

  async deleteDailyMetrics(id: string, actorUserId?: string): Promise<void> {
    // Get the metrics before deletion for logging
    const [metrics] = await db.select().from(dailyMetrics).where(eq(dailyMetrics.id, id));
    
    await db.delete(dailyMetrics).where(eq(dailyMetrics.id, id));
    
    // Log deletion
    if (metrics && actorUserId) {
      await this.logEntityChange(
        'daily_metrics',
        id,
        'deleted',
        actorUserId,
        metrics,
        null
      );
    }
  }

  // Action items operations
  async getAllActionItems(): Promise<ActionItem[]> {
    return await db.select().from(actionItems).orderBy(desc(actionItems.createdAt));
  }

  async getActionItemById(id: string): Promise<ActionItem | undefined> {
    const [actionItem] = await db.select().from(actionItems).where(eq(actionItems.id, id));
    return actionItem;
  }

  async getActionItemsByType(type: string): Promise<ActionItem[]> {
    return await db.select()
      .from(actionItems)
      .where(eq(actionItems.type, type))
      .orderBy(desc(actionItems.createdAt));
  }

  async getActionItemsByStatus(status: string): Promise<ActionItem[]> {
    return await db.select()
      .from(actionItems)
      .where(eq(actionItems.status, status as any))
      .orderBy(desc(actionItems.createdAt));
  }

  async getActionItemsByAssignee(assignedTo: string): Promise<ActionItem[]> {
    return await db.select()
      .from(actionItems)
      .where(eq(actionItems.assignedTo, assignedTo))
      .orderBy(desc(actionItems.createdAt));
  }

  async createActionItem(actionItem: InsertActionItem, actorUserId?: string): Promise<ActionItem> {
    const [newActionItem] = await db.insert(actionItems)
      .values(actionItem)
      .returning();
    
    // Log creation
    await this.logEntityChange(
      'action_item',
      newActionItem.id,
      'created',
      actorUserId || actionItem.createdBy,
      null,
      newActionItem
    );
    
    return newActionItem;
  }

  async updateActionItem(id: string, updates: Partial<InsertActionItem>, actorUserId?: string): Promise<ActionItem> {
    // Get the current state before update
    const [oldActionItem] = await db.select().from(actionItems).where(eq(actionItems.id, id));
    
    const [updatedActionItem] = await db.update(actionItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(actionItems.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldActionItem && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldActionItem[field as keyof ActionItem] !== newValue) {
          await this.logEntityChange(
            'action_item',
            id,
            field === 'status' ? 'status_changed' : 'updated',
            actorUserId,
            oldActionItem[field as keyof ActionItem],
            newValue,
            field
          );
        }
      }
    }
    
    return updatedActionItem;
  }

  async deleteActionItem(id: string, actorUserId?: string): Promise<void> {
    // Get the action item before deletion for logging
    const [actionItem] = await db.select().from(actionItems).where(eq(actionItems.id, id));
    
    await db.delete(actionItems).where(eq(actionItems.id, id));
    
    // Log deletion
    if (actionItem && actorUserId) {
      await this.logEntityChange(
        'action_item',
        id,
        'deleted',
        actorUserId,
        actionItem,
        null
      );
    }
  }

  // Calendar actions operations
  async getAllCalendarActions(): Promise<CalendarAction[]> {
    return await db.select().from(calendarActions).orderBy(desc(calendarActions.date));
  }

  async getCalendarActionsByDate(date: string): Promise<CalendarAction[]> {
    return await db.select()
      .from(calendarActions)
      .where(eq(calendarActions.date, date))
      .orderBy(calendarActions.title);
  }

  async getCalendarActionsByDateRange(startDate: string, endDate: string): Promise<CalendarAction[]> {
    return await db.select()
      .from(calendarActions)
      .where(and(
        gte(calendarActions.date, startDate),
        lte(calendarActions.date, endDate)
      ))
      .orderBy(calendarActions.date);
  }

  async getPendingCalendarActions(): Promise<CalendarAction[]> {
    return await db.select()
      .from(calendarActions)
      .where(eq(calendarActions.isCompleted, false))
      .orderBy(calendarActions.date);
  }

  async createCalendarAction(calendarAction: InsertCalendarAction, actorUserId?: string): Promise<CalendarAction> {
    const [newCalendarAction] = await db.insert(calendarActions)
      .values(calendarAction)
      .returning();
    
    // Log creation
    await this.logEntityChange(
      'calendar_action',
      newCalendarAction.id,
      'created',
      actorUserId || calendarAction.createdBy,
      null,
      newCalendarAction
    );
    
    return newCalendarAction;
  }

  async updateCalendarAction(id: string, updates: Partial<InsertCalendarAction>, actorUserId?: string): Promise<CalendarAction> {
    // Get the current state before update
    const [oldAction] = await db.select().from(calendarActions).where(eq(calendarActions.id, id));
    
    const [updatedCalendarAction] = await db.update(calendarActions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calendarActions.id, id))
      .returning();
    
    // Log update with field-level changes
    if (oldAction && actorUserId) {
      for (const [field, newValue] of Object.entries(updates)) {
        if (field !== 'updatedAt' && oldAction[field as keyof CalendarAction] !== newValue) {
          await this.logEntityChange(
            'calendar_action',
            id,
            field === 'isCompleted' ? 'status_changed' : 'updated',
            actorUserId,
            oldAction[field as keyof CalendarAction],
            newValue,
            field
          );
        }
      }
    }
    
    return updatedCalendarAction;
  }

  async deleteCalendarAction(id: string, actorUserId?: string): Promise<void> {
    // Get the action before deletion for logging
    const [action] = await db.select().from(calendarActions).where(eq(calendarActions.id, id));
    
    await db.delete(calendarActions).where(eq(calendarActions.id, id));
    
    // Log deletion
    if (action && actorUserId) {
      await this.logEntityChange(
        'calendar_action',
        id,
        'deleted',
        actorUserId,
        action,
        null
      );
    }
  }

  // History log operations
  async getHistoryByEntity(entityType: string, entityId: string): Promise<HistoryLog[]> {
    return await db.select()
      .from(historyLog)
      .where(and(
        eq(historyLog.entityType, entityType),
        eq(historyLog.entityId, entityId)
      ))
      .orderBy(desc(historyLog.createdAt));
  }

  async createHistoryLog(history: InsertHistoryLog): Promise<HistoryLog> {
    const [newHistoryLog] = await db.insert(historyLog)
      .values(history)
      .returning();
    return newHistoryLog;
  }

  // Enhanced focus song operations
  async getFocusSongsByCategory(category: string): Promise<FocusSong[]> {
    return await db.select()
      .from(focusSongs)
      .where(eq(focusSongs.category, category as any))
      .orderBy(desc(focusSongs.createdAt));
  }
}

export const storage = new DatabaseStorage();
