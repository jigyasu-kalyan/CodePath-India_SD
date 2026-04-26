import { IExecutionStrategy, TestResult } from './IExecutionStrategy';

export class DryRunExecutionStrategy implements IExecutionStrategy {
  async execute(code: string, language: string, input: string): Promise<TestResult> {
    return {
      passed: true,
      stdout: 'Dry run executed successfully',
      stderr: '',
      time: 0.01,
      memory: 2,
      status: 'Accepted',
    };
  }
}
