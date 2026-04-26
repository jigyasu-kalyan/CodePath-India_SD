import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { SubmissionService } from '../../src/services/SubmissionService';
import { SubmissionStatus } from '../../src/types/enums';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    submission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    leaderboard: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    badge: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('SubmissionService', () => {
  let service: SubmissionService;
  const prismaMock = prisma as any;

  beforeEach(() => {
    service = new SubmissionService(true);
    jest.clearAllMocks();
  });

  test('accepts a submission when output matches', async () => {
    prismaMock.submission.create.mockResolvedValue({ id: 'submission-1' });
    prismaMock.leaderboard.upsert.mockResolvedValue({});
    prismaMock.leaderboard.findUnique.mockResolvedValue({ problemsSolved: 1 });
    prismaMock.badge.findFirst.mockResolvedValue(null);
    prismaMock.badge.create.mockResolvedValue({});

    const result = await service.submit(
      'user-1',
      'challenge-1',
      'print(2)',
      'python',
      'Dry run executed successfully'
    );

    expect(result.id).toBe('submission-1');
    expect(result.status).toBe(SubmissionStatus.ACCEPTED);
    expect(result.verdict).toBe('Accepted');
    expect(result.passed).toBe(true);
  });

  test('returns wrong answer when output does not match', async () => {
    prismaMock.submission.create.mockResolvedValue({ id: 'submission-2' });

    const result = await service.submit(
      'user-1',
      'challenge-1',
      'print(2)',
      'python',
      'different output'
    );

    expect(result.status).toBe(SubmissionStatus.WRONG_ANSWER);
    expect(result.verdict).toBe('Wrong Answer');
    expect(result.passed).toBe(false);
    expect(prisma.leaderboard.upsert).not.toHaveBeenCalled();
  });

  test('saves the submission with simple execution details', async () => {
    prismaMock.submission.create.mockResolvedValue({ id: 'submission-3' });
    prismaMock.leaderboard.upsert.mockResolvedValue({});
    prismaMock.leaderboard.findUnique.mockResolvedValue({ problemsSolved: 1 });
    prismaMock.badge.findFirst.mockResolvedValue(null);
    prismaMock.badge.create.mockResolvedValue({});

    await service.submit(
      'user-2',
      'challenge-2',
      'print(2)',
      'python',
      'Dry run executed successfully'
    );

    expect(prisma.submission.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-2',
        challengeId: 'challenge-2',
        code: 'print(2)',
        language: 'python',
        score: 100,
        status: SubmissionStatus.ACCEPTED,
        verdict: 'Accepted',
        runtime: 0.01,
        memory: 2,
        output: 'Dry run executed successfully',
        error: '',
      },
    });
  });

  test('allows strategy swapping', async () => {
    const customStrategy: any = {
      execute: (jest.fn() as any).mockResolvedValue({
        passed: true,
        stdout: 'custom output',
        stderr: '',
        time: 0.5,
        memory: 10,
        status: 'Accepted',
      }),
    };

    service.setStrategy(customStrategy);
    prismaMock.submission.create.mockResolvedValue({ id: 'submission-4' });
    prismaMock.leaderboard.upsert.mockResolvedValue({});
    prismaMock.leaderboard.findUnique.mockResolvedValue({ problemsSolved: 1 });
    prismaMock.badge.findFirst.mockResolvedValue(null);
    prismaMock.badge.create.mockResolvedValue({});

    const result = await service.submit(
      'user-3',
      'challenge-3',
      'code',
      'python',
      'custom output'
    );

    expect(customStrategy.execute).toHaveBeenCalledWith('code', 'python', '');
    expect(result.status).toBe(SubmissionStatus.ACCEPTED);
  });

  test('notifies leaderboard and badge observers on accepted submission', async () => {
    prismaMock.submission.create.mockResolvedValue({ id: 'submission-5' });
    prismaMock.leaderboard.upsert.mockResolvedValue({});
    prismaMock.leaderboard.findUnique.mockResolvedValue({ problemsSolved: 1 });
    prismaMock.badge.findFirst.mockResolvedValue(null);
    prismaMock.badge.create.mockResolvedValue({});

    await service.submit(
      'user-4',
      'challenge-4',
      'print(2)',
      'python',
      'Dry run executed successfully'
    );

    expect(prisma.leaderboard.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-4' },
      update: {
        totalScore: {
          increment: 100,
        },
        problemsSolved: {
          increment: 1,
        },
      },
      create: {
        userId: 'user-4',
        totalScore: 100,
        problemsSolved: 1,
      },
    });
    expect(prisma.badge.create).toHaveBeenCalled();
  });

  test('returns submission history for a user', async () => {
    const mockHistory = [
      { id: '1', userId: 'user-1', challengeId: 'challenge-1' },
      { id: '2', userId: 'user-1', challengeId: 'challenge-2' },
    ];

    prismaMock.submission.findMany.mockResolvedValue(mockHistory);

    const history = await service.getSubmissionHistory('user-1');

    expect(history).toEqual(mockHistory);
    expect(prisma.submission.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });

  test('checks whether a user has solved a challenge', async () => {
    prismaMock.submission.findFirst.mockResolvedValue({ id: 'submission-6' });

    const hasSolved = await service.hasSolvedChallenge('user-1', 'challenge-1');

    expect(hasSolved).toBe(true);
    expect(prisma.submission.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        challengeId: 'challenge-1',
        status: SubmissionStatus.ACCEPTED,
      },
    });
  });

  test('returns false when a user has not solved a challenge', async () => {
    prismaMock.submission.findFirst.mockResolvedValue(null);

    const hasSolved = await service.hasSolvedChallenge('user-1', 'challenge-1');

    expect(hasSolved).toBe(false);
  });
});
