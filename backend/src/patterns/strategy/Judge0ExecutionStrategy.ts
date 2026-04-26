import { IExecutionStrategy, TestResult } from './IExecutionStrategy';
import { Judge0Service } from '../../services/Judge0Service';

export class Judge0ExecutionStrategy implements IExecutionStrategy {
  private judge0Service: Judge0Service;

  constructor() {
    this.judge0Service = new Judge0Service();
  }

  async execute(code: string, language: string, input: string): Promise<TestResult> {
    return await this.judge0Service.execute(code, language, input);
  }
}
