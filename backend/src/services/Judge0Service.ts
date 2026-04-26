import axios from 'axios';
import { TestResult } from '../patterns/strategy/IExecutionStrategy';

const LANGUAGE_MAP: Record<string, number> = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
  c: 50,
};

export class Judge0Service {
  private apiUrl = 'https://judge0-ce.p.rapidapi.com';
  private headers = {
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json',
  };

  async execute(code: string, language: string, stdin: string): Promise<TestResult> {
    try {
      if (!this.headers['X-RapidAPI-Key']) {
        return {
          passed: false,
          stdout: '',
          stderr: 'Judge0 API key is missing',
          time: 0,
          memory: 0,
          status: 'System Error',
        };
      }

      const languageId = LANGUAGE_MAP[language.toLowerCase()] || 71;

      const submitRes = await axios.post(
        `${this.apiUrl}/submissions?base64_encoded=false&wait=false`,
        {
          source_code: code,
          language_id: languageId,
          stdin: stdin || '',
        },
        { headers: this.headers }
      );

      const token = submitRes.data.token;
      let result: any = null;

      for (let i = 0; i < 10; i++) {
        await new Promise(res => setTimeout(res, 1000));

        const res = await axios.get(
          `${this.apiUrl}/submissions/${token}?base64_encoded=false`,
          { headers: this.headers }
        );

        result = res.data;
        if (result.status?.id > 2) break;
      }

      const statusMap: Record<number, string> = {
        1: 'Pending',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error',
        8: 'System Error',
      };

      const status = statusMap[result?.status?.id] || 'Unknown';
      const passed = result?.status?.id === 3;

      return {
        passed,
        stdout: result?.stdout || '',
        stderr: result?.stderr || result?.compile_output || '',
        time: parseFloat(result?.time || '0'),
        memory: result?.memory || 0,
        status,
      };
    } catch (error) {
      return {
        passed: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        time: 0,
        memory: 0,
        status: 'System Error',
      };
    }
  }
}
