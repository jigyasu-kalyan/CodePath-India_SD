import { IExecutionStrategy, TestResult } from '../patterns/strategy/IExecutionStrategy';
import { IObserver, SubmissionEvent } from '../patterns/observer/IObserver';
import { Judge0ExecutionStrategy } from '../patterns/strategy/Judge0ExecutionStrategy';
import { DryRunExecutionStrategy } from '../patterns/strategy/DryRunExecutionStrategy';
import { LeaderboardObserver } from '../patterns/observer/LeaderboardObserver';
import { BadgeObserver } from '../patterns/observer/BadgeObserver';
import { prisma } from '../config/database';
import { SubmissionStatus } from '../types/enums';

export class SubmissionService {
  private executionStrategy: IExecutionStrategy;
  private observers: IObserver[] = [];

  constructor(useDryRun: boolean = false) {
    this.executionStrategy = useDryRun
      ? new DryRunExecutionStrategy()
      : new Judge0ExecutionStrategy();

    this.observers.push(new LeaderboardObserver());
    this.observers.push(new BadgeObserver());
  }

  setStrategy(strategy: IExecutionStrategy): void {
    this.executionStrategy = strategy;
  }

  attach(observer: IObserver): void {
    this.observers.push(observer);
  }

  detach(observer: IObserver): void {
    this.observers = this.observers.filter(currentObserver => currentObserver !== observer);
  }

  private async notifyObservers(event: SubmissionEvent): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.update(event);
      } catch {
        // Continue even if observer fails
      }
    }
  }

  async submit(
    userId: string,
    challengeId: string,
    code: string,
    language: string,
    expectedOutput: string
  ) {
    const executionResult: TestResult = await this.executionStrategy.execute(code, language, '');
    const status = this.getFinalStatus(executionResult, expectedOutput);
    const verdict = this.getVerdictLabel(status);
    const passed = status === SubmissionStatus.ACCEPTED;

    const submission = await prisma.submission.create({
      data: {
        userId,
        challengeId,
        code,
        language,
        score: passed ? 100 : 0,
        status,
        verdict,
        runtime: executionResult.time,
        memory: executionResult.memory,
        output: executionResult.stdout,
        error: executionResult.stderr,
      },
    });

    const event: SubmissionEvent = {
      userId,
      challengeId,
      status,
      runtime: executionResult.time,
      memory: executionResult.memory,
    };

    await this.notifyObservers(event);

    return {
      id: submission.id,
      verdict,
      status,
      stdout: executionResult.stdout,
      stderr: executionResult.stderr,
      time: executionResult.time,
      memory: executionResult.memory,
      passed,
    };
  }

  async getSubmissionHistory(userId: string, limit: number = 50) {
    return await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSubmissionsByChallenge(challengeId: string, limit: number = 100) {
    return await prisma.submission.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async hasSolvedChallenge(userId: string, challengeId: string): Promise<boolean> {
    const submission = await prisma.submission.findFirst({
      where: { userId, challengeId, status: SubmissionStatus.ACCEPTED },
    });
    return !!submission;
  }

  private getFinalStatus(
    executionResult: TestResult,
    expectedOutput: string
  ): SubmissionStatus {
    if (executionResult.status !== 'Accepted') {
      return this.mapExecutionStatus(executionResult.status);
    }

    const actualOutput = executionResult.stdout.trim();
    const expected = expectedOutput.trim();

    if (actualOutput === expected) {
      return SubmissionStatus.ACCEPTED;
    }

    return SubmissionStatus.WRONG_ANSWER;
  }

  private mapExecutionStatus(status: string): SubmissionStatus {
    switch (status) {
      case 'Accepted':
        return SubmissionStatus.ACCEPTED;
      case 'Wrong Answer':
        return SubmissionStatus.WRONG_ANSWER;
      case 'Time Limit Exceeded':
        return SubmissionStatus.TIME_LIMIT_EXCEEDED;
      case 'Compilation Error':
        return SubmissionStatus.COMPILATION_ERROR;
      case 'Runtime Error':
        return SubmissionStatus.RUNTIME_ERROR;
      default:
        return SubmissionStatus.PENDING;
    }
  }

  private getVerdictLabel(status: SubmissionStatus): string {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return 'Accepted';
      case SubmissionStatus.WRONG_ANSWER:
        return 'Wrong Answer';
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return 'Time Limit Exceeded';
      case SubmissionStatus.COMPILATION_ERROR:
        return 'Compilation Error';
      case SubmissionStatus.RUNTIME_ERROR:
        return 'Runtime Error';
      default:
        return 'Pending';
    }
  }
}
