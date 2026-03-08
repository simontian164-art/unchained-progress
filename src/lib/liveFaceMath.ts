export interface LiveSymmetryMetrics {
  faceDetected: boolean;
  symmetryScore: number;
  centerDeviationPercent: number;
  eyeTiltDeg: number;
  jawBalancePercent: number;
  confidence: number;
}

type Point = { x: number; y: number };

const LANDMARKS = {
  noseTip: 1,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftMouth: 61,
  rightMouth: 291,
  leftCheek: 234,
  rightCheek: 454,
  chin: 152,
} as const;

const SYMMETRY_PAIRS: Array<[number, number]> = [
  [33, 263],
  [133, 362],
  [159, 386],
  [61, 291],
  [78, 308],
  [234, 454],
  [93, 323],
  [172, 397],
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function getPoint(keypoints: Point[], index: number): Point | null {
  const point = keypoints[index];
  if (!point || Number.isNaN(point.x) || Number.isNaN(point.y)) return null;
  return point;
}

export function calculateLiveSymmetryMetrics(keypoints: Point[]): LiveSymmetryMetrics {
  const nose = getPoint(keypoints, LANDMARKS.noseTip);
  const leftEye = getPoint(keypoints, LANDMARKS.leftEyeOuter);
  const rightEye = getPoint(keypoints, LANDMARKS.rightEyeOuter);
  const leftMouth = getPoint(keypoints, LANDMARKS.leftMouth);
  const rightMouth = getPoint(keypoints, LANDMARKS.rightMouth);
  const leftCheek = getPoint(keypoints, LANDMARKS.leftCheek);
  const rightCheek = getPoint(keypoints, LANDMARKS.rightCheek);
  const chin = getPoint(keypoints, LANDMARKS.chin);

  if (!nose || !leftEye || !rightEye || !leftMouth || !rightMouth || !leftCheek || !rightCheek || !chin) {
    return {
      faceDetected: false,
      symmetryScore: 0,
      centerDeviationPercent: 0,
      eyeTiltDeg: 0,
      jawBalancePercent: 0,
      confidence: 0,
    };
  }

  const faceWidth = Math.max(distance(leftCheek, rightCheek), 1);
  const centerX = (leftCheek.x + rightCheek.x) / 2;

  const centerDeviationPercent = (Math.abs(nose.x - centerX) / (faceWidth / 2)) * 100;

  const eyeTiltRad = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const eyeTiltDeg = Math.abs((eyeTiltRad * 180) / Math.PI);

  const leftJaw = distance(chin, leftCheek);
  const rightJaw = distance(chin, rightCheek);
  const jawBalancePercent = (Math.abs(leftJaw - rightJaw) / ((leftJaw + rightJaw) / 2 || 1)) * 100;

  const pairResidual = SYMMETRY_PAIRS.reduce((acc, [leftIndex, rightIndex]) => {
    const left = getPoint(keypoints, leftIndex);
    const right = getPoint(keypoints, rightIndex);
    if (!left || !right) return acc;

    const mirroredRightX = centerX - (right.x - centerX);
    const residual = Math.hypot(left.x - mirroredRightX, left.y - right.y);
    return acc + residual / faceWidth;
  }, 0);

  const normalizedResidual = pairResidual / SYMMETRY_PAIRS.length;

  const symmetryScore = clamp(
    100 - normalizedResidual * 260 - centerDeviationPercent * 0.8 - eyeTiltDeg * 1.3 - jawBalancePercent * 0.6,
    0,
    100,
  );

  const confidence = clamp(100 - normalizedResidual * 180, 0, 100);

  return {
    faceDetected: true,
    symmetryScore: Number(symmetryScore.toFixed(1)),
    centerDeviationPercent: Number(centerDeviationPercent.toFixed(2)),
    eyeTiltDeg: Number(eyeTiltDeg.toFixed(2)),
    jawBalancePercent: Number(jawBalancePercent.toFixed(2)),
    confidence: Number(confidence.toFixed(1)),
  };
}

export function averageLiveMetrics(metrics: LiveSymmetryMetrics[]): LiveSymmetryMetrics | null {
  const valid = metrics.filter((metric) => metric.faceDetected);
  if (valid.length === 0) return null;

  const sum = valid.reduce(
    (acc, metric) => ({
      symmetryScore: acc.symmetryScore + metric.symmetryScore,
      centerDeviationPercent: acc.centerDeviationPercent + metric.centerDeviationPercent,
      eyeTiltDeg: acc.eyeTiltDeg + metric.eyeTiltDeg,
      jawBalancePercent: acc.jawBalancePercent + metric.jawBalancePercent,
      confidence: acc.confidence + metric.confidence,
    }),
    {
      symmetryScore: 0,
      centerDeviationPercent: 0,
      eyeTiltDeg: 0,
      jawBalancePercent: 0,
      confidence: 0,
    },
  );

  const count = valid.length;

  return {
    faceDetected: true,
    symmetryScore: Number((sum.symmetryScore / count).toFixed(1)),
    centerDeviationPercent: Number((sum.centerDeviationPercent / count).toFixed(2)),
    eyeTiltDeg: Number((sum.eyeTiltDeg / count).toFixed(2)),
    jawBalancePercent: Number((sum.jawBalancePercent / count).toFixed(2)),
    confidence: Number((sum.confidence / count).toFixed(1)),
  };
}
