import { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../design';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text variant="label">A note</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="display">Something gave way</Text>
          <View style={{ height: spacing.md }} />
          <Text>{this.state.error.message}</Text>
          <View style={{ height: spacing.lg }} />
          <Button onPress={this.reset}>Try again</Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand, padding: spacing.md, justifyContent: 'center' },
});
