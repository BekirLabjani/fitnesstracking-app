export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type ExerciseKind = 'pushups';

interface AngleJoints {
  shoulder: number;
  elbow: number;
  wrist: number;
}

const JOINTS: Record<ExerciseKind, { left: AngleJoints; right: AngleJoints }> = {
  pushups: {
    left: { shoulder: 11, elbow: 13, wrist: 15 },
    right: { shoulder: 12, elbow: 14, wrist: 16 },
  },
};

const DOWN_ANGLE = 90;
const UP_ANGLE = 150;
const MIN_VISIBILITY = 0.5;

function angleBetween(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.hypot(ab.x, ab.y);
  const magCb = Math.hypot(cb.x, cb.y);
  if (magAb === 0 || magCb === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Tracks a down→up elbow-angle cycle to count bodyweight reps (push-ups).
 * Pure state machine, no DOM/camera dependency, so it can be unit-tested directly.
 */
export class PoseRepCounter {
  reps = 0;
  private state: 'up' | 'down' = 'up';

  constructor(private exercise: ExerciseKind = 'pushups') {}

  reset() {
    this.reps = 0;
    this.state = 'up';
  }

  /** Feed one frame of landmarks; returns the current elbow angle (or null if not confidently visible). */
  update(landmarks: Landmark[]): number | null {
    const joints = JOINTS[this.exercise];
    const angle = this.bestSideAngle(landmarks, joints.left) ?? this.bestSideAngle(landmarks, joints.right);
    if (angle === null) return null;

    if (this.state === 'up' && angle < DOWN_ANGLE) {
      this.state = 'down';
    } else if (this.state === 'down' && angle > UP_ANGLE) {
      this.state = 'up';
      this.reps += 1;
    }
    return angle;
  }

  private bestSideAngle(landmarks: Landmark[], joints: AngleJoints): number | null {
    const shoulder = landmarks[joints.shoulder];
    const elbow = landmarks[joints.elbow];
    const wrist = landmarks[joints.wrist];
    if (!shoulder || !elbow || !wrist) return null;
    const visible = [shoulder, elbow, wrist].every(
      p => (p.visibility ?? 1) >= MIN_VISIBILITY
    );
    if (!visible) return null;
    const angle = angleBetween(shoulder, elbow, wrist);
    return Number.isNaN(angle) ? null : angle;
  }
}
