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

const EMPTY_METRICS: LiveSymmetryMetrics = {
  faceDetected: false,
  symmetryScore: 0,
  centerDeviationPercent: 0,
  eyeTiltDeg: 0,
  jawBalancePercent: 0,
  confidence: 0,
};

function getPoint(keypoints: Point[], index: number): Point | null {
  const point = keypoints[index];
  if (!point || Number.isNaN(point.x) || Number.isNaN(point.y)) return null;
  return point;
}

function hasValidFaceGeometry({
  faceWidth,
  eyeDistance,
  mouthWidth,
  faceHeight,
}: {
  faceWidth: number;
  eyeDistance: number;
  mouthWidth: number;
  faceHeight: number;
}) {
  const eyeToFace = eyeDistance / faceWidth;
  const mouthToFace = mouthWidth / faceWidth;
  const heightToFace = faceHeight / faceWidth;

  return (
    eyeToFace >= 0.2 &&
    eyeToFace <= 0.8 &&
    mouthToFace >= 0.14 &&
    mouthToFace <= 0.82 &&
    heightToFace >= 0.42 &&
    heightToFace <= 2.2
  );
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
    return EMPTY_METRICS;
  }

  const faceWidth = Math.max(distance(leftCheek, rightCheek), 1);
  const centerX = (leftCheek.x + rightCheek.x) / 2;
  const eyeDistance = distance(leftEye, rightEye);
  const mouthWidth = distance(leftMouth, rightMouth);
  const eyeMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
  const mouthMid = { x: (leftMouth.x + rightMouth.x) / 2, y: (leftMouth.y + rightMouth.y) / 2 };
  const faceHeight = distance(chin, eyeMid);

  if (!hasValidFaceGeometry({ faceWidth, eyeDistance, mouthWidth, faceHeight })) {
    return EMPTY_METRICS;
  }

  const centerDeviationPercent = clamp((Math.abs(nose.x - centerX) / (faceWidth / 2)) * 100, 0, 100);

  const eyeTiltRad = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const eyeTiltDeg = Math.abs((eyeTiltRad * 180) / Math.PI);

  const leftJaw = distance(chin, leftCheek);
  const rightJaw = distance(chin, rightCheek);
  const jawBalancePercent = clamp((Math.abs(leftJaw - rightJaw) / ((leftJaw + rightJaw) / 2 || 1)) * 100, 0, 100);

  let pairCount = 0;
  const pairResidual = SYMMETRY_PAIRS.reduce((acc, [leftIndex, rightIndex]) => {
    const left = getPoint(keypoints, leftIndex);
    const right = getPoint(keypoints, rightIndex);
    if (!left || !right) return acc;

    pairCount += 1;
    const mirroredRightX = centerX - (right.x - centerX);
    const residual = Math.hypot(left.x - mirroredRightX, left.y - right.y);
    return acc + residual / faceWidth;
  }, 0);

  if (pairCount < 4) return EMPTY_METRICS;

  const normalizedResidual = pairResidual / pairCount;

  const yawProxyPercent = clamp(
    (Math.abs(distance(nose, leftCheek) - distance(nose, rightCheek)) / (faceWidth / 2 || 1)) * 100,
    0,
    100,
  );
  const pitchProxyPercent = clamp(
    (Math.abs(distance(nose, eyeMid) - distance(nose, mouthMid)) / faceWidth) * 100,
    0,
    100,
  );

  const posePenalty = yawProxyPercent * 0.35 + pitchProxyPercent * 0.18 + eyeTiltDeg * 0.7;

  const symmetryScore = clamp(
    100 - normalizedResidual * 210 - centerDeviationPercent * 0.45 - eyeTiltDeg * 0.7 - jawBalancePercent * 0.55 - posePenalty * 0.4,
    0,
    100,
  );

  const confidence = clamp(
    100 - normalizedResidual * 125 - posePenalty * 0.65 - centerDeviationPercent * 0.5,
    0,
    100,
  );

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
  const valid = metrics.filter((metric) => metric.faceDetected && metric.confidence >= 15);
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

