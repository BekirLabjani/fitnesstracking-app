import { Landmark, PoseRepCounter } from './pose-rep-counter';

function landmarks(leftElbowAngleDeg: number): Landmark[] {
  // Shoulder fixed above elbow; wrist rotated around the elbow so the
  // shoulder-elbow-wrist angle equals the requested value.
  const shoulder: Landmark = { x: 0, y: -1, z: 0, visibility: 1 };
  const elbow: Landmark = { x: 0, y: 0, z: 0, visibility: 1 };
  const rad = (leftElbowAngleDeg * Math.PI) / 180;
  const wrist: Landmark = { x: Math.sin(rad), y: -Math.cos(rad), z: 0, visibility: 1 };

  const points: Landmark[] = new Array(33).fill({ x: 0, y: 0, z: 0, visibility: 0 });
  points[11] = shoulder;
  points[13] = elbow;
  points[15] = wrist;
  return points;
}

describe('PoseRepCounter', () => {
  it('starts at zero reps', () => {
    const counter = new PoseRepCounter('pushups');
    expect(counter.reps).toBe(0);
  });

  it('counts one rep for a full down-to-up cycle', () => {
    const counter = new PoseRepCounter('pushups');
    counter.update(landmarks(170)); // arm extended (up)
    counter.update(landmarks(70)); // arm bent (down)
    counter.update(landmarks(170)); // back to extended (up) -> 1 rep
    expect(counter.reps).toBe(1);
  });

  it('does not count a rep without reaching the down threshold', () => {
    const counter = new PoseRepCounter('pushups');
    counter.update(landmarks(170));
    counter.update(landmarks(120)); // bent, but not enough
    counter.update(landmarks(170));
    expect(counter.reps).toBe(0);
  });

  it('returns null when the required landmarks are not visible', () => {
    const counter = new PoseRepCounter('pushups');
    const invisible = landmarks(70).map(l => ({ ...l, visibility: 0 }));
    expect(counter.update(invisible)).toBeNull();
  });

  it('reset() clears the rep count and state', () => {
    const counter = new PoseRepCounter('pushups');
    counter.update(landmarks(170));
    counter.update(landmarks(70));
    counter.update(landmarks(170));
    expect(counter.reps).toBe(1);
    counter.reset();
    expect(counter.reps).toBe(0);
  });
});
