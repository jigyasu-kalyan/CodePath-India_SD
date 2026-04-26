import { Request, Response } from 'express';
import { SubmissionService } from '../services/SubmissionService';

const submissionService = new SubmissionService();

export class SubmissionController {
  async verifyCodeforces(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, handle } = req.body;
      const userId = (req as any).user.userId; // Assuming auth middleware attaches user

      if (!challengeId || !handle) {
        res.status(400).json({ success: false, message: 'Missing challengeId or handle' });
        return;
      }

      const result = await submissionService.verifyCodeforces(userId, challengeId, handle);
      if (result.passed) {
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(400).json({ success: false, message: 'Verification failed. No accepted submission found on Codeforces for this handle and problem.' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async submitCode(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, code, language } = req.body;
      const userId = (req as any).user.userId;

      if (!challengeId || !code || !language) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      // Expected output should ideally come from challenge test cases in DB
      // For simplicity here, we assume it's retrieved inside or passed, but submit takes expectedOutput
      // For now, let's just pass empty string or fetch challenge to get expectedOutput
      const challenge = await import('../config/database').then(m => m.prisma.challenge.findUnique({ where: { id: challengeId } }));
      
      let testCases: { input: string; output: string }[] = [];
      if (challenge) {
        if ((challenge as any).testCases) {
          try {
            // Assume testCases is stored as JSON array of objects
            const parsed = typeof (challenge as any).testCases === 'string' ? JSON.parse((challenge as any).testCases) : (challenge as any).testCases;
            if (Array.isArray(parsed)) {
              testCases = parsed.map(tc => ({ input: tc.input || '', output: tc.output || '' }));
            }
          } catch (e) {
            console.error('Failed to parse test cases', e);
          }
        }
        
        // Always add the sample test case if we don't have any hidden test cases or just to be safe
        if (testCases.length === 0 && challenge.sampleOutput) {
          testCases.push({ input: challenge.sampleInput || '', output: challenge.sampleOutput });
        }
      }

      const result = await submissionService.submit(userId, challengeId, code, language, testCases);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMySubmissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const submissions = await submissionService.getSubmissionHistory(userId);
      res.status(200).json(submissions); // Frontend expects array directly
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
