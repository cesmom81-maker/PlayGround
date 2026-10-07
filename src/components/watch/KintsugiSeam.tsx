export function KintsugiSeam({
  color,
  dim = false,
}: {
  color: string;
  dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.28 : 1}>
      <path
        d="M44 18 C 56 42, 50 68, 58 88 C 68 114, 82 122, 100 130 C 122 140, 140 150, 158 172 C 166 182, 172 192, 176 204"
        fill="none"
        stroke={color}
        strokeWidth={dim ? 1.1 : 1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 130 C 92 144, 108 156, 102 174"
        fill="none"
        stroke={color}
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d="M58 88 C 70 84, 78 96, 74 108"
        fill="none"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.55}
      />
    </g>
  );
}
