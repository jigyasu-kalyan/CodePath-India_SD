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
    testCases: { input: string; output: string }[]
  ) {
    if (!testCases || testCases.length === 0) {
      testCases = [{ input: '', output: '' }];
    }

    let overallStatus = SubmissionStatus.ACCEPTED;
    let overallVerdict = 'Accepted';
    let maxRuntime = 0;
    let maxMemory = 0;
    let lastStdout = '';
    let lastStderr = '';

    for (const tc of testCases) {
      const executionResult: TestResult = await this.executionStrategy.execute(code, language, tc.input);
      const status = this.getFinalStatus(executionResult, tc.output);
      
      maxRuntime = Math.max(maxRuntime, executionResult.time || 0);
      maxMemory = Math.max(maxMemory, executionResult.memory || 0);
      lastStdout = executionResult.stdout;
      lastStderr = executionResult.stderr;

      if (status !== SubmissionStatus.ACCEPTED) {
        overallStatus = status;
        overallVerdict = this.getVerdictLabel(status);
        break;
      }
    }

    const passed = overallStatus === SubmissionStatus.ACCEPTED;
    const alreadySolved = await this.hasSolvedChallenge(userId, challengeId);

    const submission = await prisma.submission.create({
      data: {
        userId,
        challengeId,
        code,
        language,
        score: passed ? 100 : 0,
        status: overallStatus,
        verdict: overallVerdict,
        runtime: maxRuntime,
        memory: maxMemory,
        output: lastStdout,
        error: lastStderr,
      },
    });

    if (passed && !alreadySolved) {
      const event: SubmissionEvent = {
        userId,
        challengeId,
        status: overallStatus,
        runtime: maxRuntime,
        memory: maxMemory,
      };
      await this.notifyObservers(event);
    }

    return {
      id: submission.id,
      verdict: overallVerdict,
      status: overallStatus,
      stdout: lastStdout,
      stderr: lastStderr,
      time: maxRuntime,
      memory: maxMemory,
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

  async verifyCodeforces(userId: string, challengeId: string, handle: string) {
    const [contestId, index] = challengeId.split('-');
    const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=100`;
    
    try {
      const axios = require('axios');
      const res = await axios.get(url, { timeout: 10000 });
      const submissions = res.data.result || [];
      
      const hasAccepted = submissions.some((sub: any) => 
        sub.problem.contestId.toString() === contestId && 
        sub.problem.index === index && 
        sub.verdict === 'OK'
      );

      if (hasAccepted) {
        const alreadySolved = await this.hasSolvedChallenge(userId, challengeId);
        
        // Create an accepted submission record
        const submission = await prisma.submission.create({
          data: {
            userId,
            challengeId,
            code: '// Code verified via Codeforces',
            language: 'codeforces',
            score: 100,
            status: SubmissionStatus.ACCEPTED,
            verdict: 'Accepted',
          },
        });

        if (!alreadySolved) {
          const event: SubmissionEvent = {
            userId,
            challengeId,
            status: SubmissionStatus.ACCEPTED,
            runtime: 0,
            memory: 0
          };
          await this.notifyObservers(event);
        }

        return { passed: true, status: 'ACCEPTED', id: submission.id };
      }

      return { passed: false, status: 'WRONG_ANSWER' };
    } catch (e) {
      console.error('Codeforces verify error', e);
      return { passed: false, status: 'ERROR' };
    }
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
