import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Brand, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

/** A centered white card dialog with a dimmed backdrop (tap outside to dismiss). */
export function CenterModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Outlined radio that fills green when selected. */
export function Radio({ selected }: { selected: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.radioOuter, { borderColor: selected ? Brand.green : colors.border }]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { width: '100%', maxWidth: 360, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.soft },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: Brand.green },
});
