// Observer Pattern — notify services after submission verdict
export interface SubmissionEvent {
  userId: string;
  challengeId: string;
  status: string;
  runtime: number;
  memory: number;
}

export interface IObserver {
  update(event: SubmissionEvent): Promise<void>;
}

export interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(event: SubmissionEvent): Promise<void>;
}
