import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class ClassroomController {
  async createClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { name, meetLink, scheduleDays, scheduleTime } = req.body;
      const teacherId = (req as any).user?.userId;
      
      if (!teacherId || (req as any).user?.role !== 'TEACHER') {
        res.status(403).json({ success: false, message: 'Only teachers can create classrooms' });
        return;
      }

      // Generate a random 6-character uppercase alphanumeric join code
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const classroom = await prisma.classroom.create({
        data: {
          name,
          joinCode,
          teacherId,
          meetLink,
          scheduleDays,
          scheduleTime
        }
      });

      res.status(201).json({ success: true, data: classroom });
    } catch (error: any) {
      console.error('Error creating classroom:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async joinClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { joinCode } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const classroom = await prisma.classroom.findUnique({
        where: { joinCode: joinCode.toUpperCase() }
      });

      if (!classroom) {
        res.status(404).json({ success: false, message: 'Classroom not found. Please check the code.' });
        return;
      }

      // Check if already joined
      const existingMember = await prisma.classroomMember.findFirst({
        where: { classroomId: classroom.id, userId }
      });

      if (existingMember) {
        res.status(400).json({ success: false, message: 'You have already joined this classroom' });
        return;
      }

      await prisma.classroomMember.create({
        data: {
          classroomId: classroom.id,
          userId
        }
      });

      res.status(200).json({ success: true, message: 'Joined classroom successfully' });
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyClassrooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const role = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let classrooms = [];

      if (role === 'TEACHER') {
        // Fetch classrooms created by this teacher
        classrooms = await prisma.classroom.findMany({
          where: { teacherId: userId },
          include: {
            _count: {
              select: { members: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        // Fetch classrooms joined by this student
        const memberships = await prisma.classroomMember.findMany({
          where: { userId },
          include: {
            classroom: {
              include: {
                _count: {
                  select: { members: true }
                }
              }
            }
          },
          orderBy: { classroom: { createdAt: 'desc' } }
        });
        classrooms = memberships.map(m => m.classroom);
      }

      // Map _count.members to _count.students for frontend consistency
      const formattedClassrooms = classrooms.map(c => ({
        ...c,
        _count: {
          students: c._count?.members || 0
        }
      }));

      res.status(200).json(formattedClassrooms);
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
