import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/** The walking-figure glyph that stands in for the "A" in the Strack wordmark. */
export function WalkMark({ size = 28, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="walk" size={size} color={color} />;
}
