import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { 
  insertTeamMemberSchema,
  insertMeetingSchema,
  insertFocusSongSchema,
  insertTaskSchema,
  insertMeetingMinutesSchema,
  insertDailyMetricsSchema,
  insertActionItemSchema,
  insertCalendarActionSchema,
  insertHistoryLogSchema,
} from "@shared/schema";
import { sendEmail } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - TEMPORARILY DISABLED FOR RAILWAY DEPLOYMENT
  // await setupAuth(app);

  // Mock user for testing without authentication
  const MOCK_USER_ID = "test-user-001";

  // Auth routes - TEMPORARILY DISABLED FOR RAILWAY DEPLOYMENT
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return mock user for testing
      const mockUser = {
        id: MOCK_USER_ID,
        email: "test@roton.ro",
        firstName: "Test",
        lastName: "User",
        profileImageUrl: null
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Team member routes
  app.get('/api/team-members', async (req, res) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get('/api/team-members/department/:department', async (req, res) => {
    try {
      const { department } = req.params;
      const teamMembers = await storage.getTeamMembersByDepartment(department);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members by department:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/team-members', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const teamMember = await storage.createTeamMember(validatedData, userId);
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.patch('/api/team-members/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const teamMember = await storage.updateTeamMember(id, updates, userId);
      res.json(teamMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete('/api/team-members/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteTeamMember(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Meeting routes
  app.get('/api/meetings', async (req, res) => {
    try {
      const { startDate, endDate, type } = req.query;
      
      let meetings;
      if (startDate && endDate) {
        meetings = await storage.getMeetingsByDateRange(startDate as string, endDate as string);
      } else if (type) {
        meetings = await storage.getMeetingsByType(type as string);
      } else {
        meetings = await storage.getAllMeetings();
      }
      
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get('/api/meetings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const meeting = await storage.getMeetingById(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.post('/api/meetings', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertMeetingSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const meeting = await storage.createMeeting(validatedData, userId);
      
      // Send email notifications
      if (meeting.participants && meeting.participants.length > 0) {
        try {
          await sendEmail({
            to: meeting.participants.join(','),
            subject: `New Meeting: ${meeting.title}`,
            html: `
              <h2>New Meeting Scheduled</h2>
              <p><strong>Title:</strong> ${meeting.title}</p>
              <p><strong>Date:</strong> ${meeting.date}</p>
              <p><strong>Time:</strong> ${meeting.time}</p>
              <p><strong>Description:</strong> ${meeting.description || 'No description provided'}</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      }
      
      res.status(201).json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch('/api/meetings/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const meeting = await storage.updateMeeting(id, updates, userId);
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete('/api/meetings/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteMeeting(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Focus songs routes
  app.get('/api/focus-songs', async (req, res) => {
    try {
      const { active, backCatalog } = req.query;
      
      let songs;
      if (active === 'true') {
        songs = await storage.getActiveFocusSongs();
      } else if (backCatalog === 'true') {
        songs = await storage.getBackCatalogSongs();
      } else {
        songs = await storage.getAllFocusSongs();
      }
      
      res.json(songs);
    } catch (error) {
      console.error("Error fetching focus songs:", error);
      res.status(500).json({ message: "Failed to fetch focus songs" });
    }
  });

  app.get('/api/focus-songs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const song = await storage.getFocusSongById(id);
      if (!song) {
        return res.status(404).json({ message: "Focus song not found" });
      }
      res.json(song);
    } catch (error) {
      console.error("Error fetching focus song:", error);
      res.status(500).json({ message: "Failed to fetch focus song" });
    }
  });

  app.post('/api/focus-songs', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertFocusSongSchema.parse(req.body);
      const song = await storage.createFocusSong(validatedData, userId);
      res.status(201).json(song);
    } catch (error) {
      console.error("Error creating focus song:", error);
      res.status(500).json({ message: "Failed to create focus song" });
    }
  });

  app.patch('/api/focus-songs/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const song = await storage.updateFocusSong(id, updates, userId);
      res.json(song);
    } catch (error) {
      console.error("Error updating focus song:", error);
      res.status(500).json({ message: "Failed to update focus song" });
    }
  });

  app.delete('/api/focus-songs/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteFocusSong(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting focus song:", error);
      res.status(500).json({ message: "Failed to delete focus song" });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const { assignee, meeting, focusSong, status } = req.query;
      
      let tasks;
      if (assignee) {
        tasks = await storage.getTasksByAssignee(assignee as string);
      } else if (meeting) {
        tasks = await storage.getTasksByMeeting(meeting as string);
      } else if (focusSong) {
        tasks = await storage.getTasksByFocusSong(focusSong as string);
      } else if (status) {
        tasks = await storage.getTasksByStatus(status as string);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post('/api/tasks', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      
      // Preprocess data to handle empty date strings
      const processedBody = {
        ...req.body,
        createdBy: userId,
        deadline: req.body.deadline === '' ? null : req.body.deadline,
      };
      
      const validatedData = insertTaskSchema.parse(processedBody);
      
      const task = await storage.createTask(validatedData, userId);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      
      // Preprocess data to handle empty date strings
      const updates = {
        ...req.body,
        deadline: req.body.deadline === '' ? null : req.body.deadline,
      };
      
      const task = await storage.updateTask(id, updates, userId);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteTask(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Meeting minutes routes
  app.get('/api/meeting-minutes/:meetingId', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const minutes = await storage.getMeetingMinutesByMeeting(meetingId);
      if (!minutes) {
        return res.status(404).json({ message: "Meeting minutes not found" });
      }
      res.json(minutes);
    } catch (error) {
      console.error("Error fetching meeting minutes:", error);
      res.status(500).json({ message: "Failed to fetch meeting minutes" });
    }
  });

  app.post('/api/meeting-minutes', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertMeetingMinutesSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const minutes = await storage.createMeetingMinutes(validatedData, userId);
      res.status(201).json(minutes);
    } catch (error) {
      console.error("Error creating meeting minutes:", error);
      res.status(500).json({ message: "Failed to create meeting minutes" });
    }
  });

  app.patch('/api/meeting-minutes/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const minutes = await storage.updateMeetingMinutes(id, updates, userId);
      res.json(minutes);
    } catch (error) {
      console.error("Error updating meeting minutes:", error);
      res.status(500).json({ message: "Failed to update meeting minutes" });
    }
  });

  // Daily metrics routes
  app.get('/api/daily-metrics/:focusSongId', async (req, res) => {
    try {
      const { focusSongId } = req.params;
      const metrics = await storage.getDailyMetricsByFocusSong(focusSongId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching daily metrics:", error);
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  app.post('/api/daily-metrics', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertDailyMetricsSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const metrics = await storage.createDailyMetrics(validatedData, userId);
      res.status(201).json(metrics);
    } catch (error) {
      console.error("Error creating daily metrics:", error);
      res.status(500).json({ message: "Failed to create daily metrics" });
    }
  });

  app.patch('/api/daily-metrics/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const metrics = await storage.updateDailyMetrics(id, updates, userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error updating daily metrics:", error);
      res.status(500).json({ message: "Failed to update daily metrics" });
    }
  });

  app.delete('/api/daily-metrics/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteDailyMetrics(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting daily metrics:", error);
      res.status(500).json({ message: "Failed to delete daily metrics" });
    }
  });

  // Action items routes
  app.get('/api/action-items', async (req, res) => {
    try {
      const { type, status, assignedTo } = req.query;
      let actionItems;
      
      if (type) {
        actionItems = await storage.getActionItemsByType(type as string);
      } else if (status) {
        actionItems = await storage.getActionItemsByStatus(status as string);
      } else if (assignedTo) {
        actionItems = await storage.getActionItemsByAssignee(assignedTo as string);
      } else {
        actionItems = await storage.getAllActionItems();
      }
      
      res.json(actionItems);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  app.post('/api/action-items', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertActionItemSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const actionItem = await storage.createActionItem(validatedData, userId);
      res.status(201).json(actionItem);
    } catch (error) {
      console.error("Error creating action item:", error);
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  app.patch('/api/action-items/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const actionItem = await storage.updateActionItem(id, updates, userId);
      res.json(actionItem);
    } catch (error) {
      console.error("Error updating action item:", error);
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  app.delete('/api/action-items/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteActionItem(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting action item:", error);
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });

  // Calendar actions routes  
  app.get('/api/calendar-actions', async (req, res) => {
    try {
      const { date, startDate, endDate, pending } = req.query;
      let calendarActions;
      
      if (pending === 'true') {
        calendarActions = await storage.getPendingCalendarActions();
      } else if (date) {
        calendarActions = await storage.getCalendarActionsByDate(date as string);
      } else if (startDate && endDate) {
        calendarActions = await storage.getCalendarActionsByDateRange(startDate as string, endDate as string);
      } else {
        calendarActions = await storage.getAllCalendarActions();
      }
      
      res.json(calendarActions);
    } catch (error) {
      console.error("Error fetching calendar actions:", error);
      res.status(500).json({ message: "Failed to fetch calendar actions" });
    }
  });

  app.post('/api/calendar-actions', async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const validatedData = insertCalendarActionSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const calendarAction = await storage.createCalendarAction(validatedData, userId);
      res.status(201).json(calendarAction);
    } catch (error) {
      console.error("Error creating calendar action:", error);
      res.status(500).json({ message: "Failed to create calendar action" });
    }
  });

  app.patch('/api/calendar-actions/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      const updates = req.body;
      const calendarAction = await storage.updateCalendarAction(id, updates, userId);
      res.json(calendarAction);
    } catch (error) {
      console.error("Error updating calendar action:", error);
      res.status(500).json({ message: "Failed to update calendar action" });
    }
  });

  app.delete('/api/calendar-actions/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = MOCK_USER_ID;
      await storage.deleteCalendarAction(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calendar action:", error);
      res.status(500).json({ message: "Failed to delete calendar action" });
    }
  });

  // History log routes
  app.get('/api/history/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const history = await storage.getHistoryByEntity(entityType, entityId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Enhanced focus songs routes
  app.get('/api/focus-songs/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const songs = await storage.getFocusSongsByCategory(category);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching focus songs by category:", error);
      res.status(500).json({ message: "Failed to fetch focus songs by category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
