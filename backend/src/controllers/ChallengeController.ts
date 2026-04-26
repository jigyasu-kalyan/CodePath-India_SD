import { Request, Response } from 'express';
import { ChallengeService } from '../services/ChallengeService';
import { prisma } from '../config/database';

const challengeService = new ChallengeService();

export class ChallengeController {
  async getChallenges(req: Request, res: Response): Promise<void> {
    try {
      const tags = req.query.tags as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const challenges = await challengeService.getAllChallenges(tags, limit);
      res.status(200).json({ success: true, data: challenges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getChallengeById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id as string; // Expects "contestId-index" or UUID

      // If it's a UUID (length 36, contains 4 dashes)
      if (idParam.length === 36 && idParam.split('-').length === 5) {
        const localChallenge = await prisma.challenge.findUnique({
          where: { id: idParam }
        });
        if (localChallenge) {
          const formatted = {
            id: localChallenge.id,
            title: localChallenge.title,
            difficulty: localChallenge.difficulty,
            tags: localChallenge.tags,
            source: 'Manual',
            description: localChallenge.description,
            sampleInput: localChallenge.sampleInput,
            sampleOutput: localChallenge.sampleOutput
          };
          res.status(200).json({ success: true, data: formatted });
          return;
        }
        res.status(404).json({ success: false, message: 'Challenge not found' });
        return;
      }

      const [contestIdStr, index] = idParam.split('-');
      const contestId = parseInt(contestIdStr);

      if (!contestId || !index) {
        res.status(400).json({ success: false, message: 'Invalid challenge ID format. Expected contestId-index or UUID.' });
        return;
      }

      const challenge = await challengeService.getChallengeById(contestId, index);
      if (!challenge) {
        res.status(404).json({ success: false, message: 'Challenge not found' });
        return;
      }

      res.status(200).json({ success: true, data: challenge });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, difficulty, rating, tags, sampleInput, sampleOutput, testCases } = req.body;
      const authorId = (req as any).user?.userId;

      if (!authorId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const challenge = await (prisma.challenge.create as any)({
        data: {
          title,
          description,
          difficulty,
          rating: rating ? parseInt(rating) : null,
          tags,
          sampleInput,
          sampleOutput,
          testCases: testCases ? testCases : null,
          authorId
        }
      });

      res.status(201).json({ success: true, data: challenge });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
