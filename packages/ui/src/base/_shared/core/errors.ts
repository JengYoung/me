export type ErrorPhase =
  | 'initialization'
  | 'guard'
  | 'assign'
  | 'action'
  | 'effect'
  | 'cleanup'
  | 'queue'
  | 'subscriber';

export class MachineError extends Error {
  readonly phase: ErrorPhase;
  readonly state: string;
  readonly event: string | undefined;

  constructor(phase: ErrorPhase, state: string, event: string | undefined, cause: unknown) {
    super(`Iris machine failed during ${phase} in state "${state}"${event ? ` (${event})` : ''}.`, { cause });
    this.name = 'MachineError';
    this.phase = phase;
    this.state = state;
    this.event = event;
  }
}
