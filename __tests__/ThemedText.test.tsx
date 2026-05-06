import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../components/themed-text';

jest.mock('../hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('ThemedText', () => {
  it('renders children text', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders each type variant without crashing', () => {
    const types = ['default', 'title', 'defaultSemiBold', 'subtitle', 'link'] as const;
    for (const type of types) {
      const { getByText } = render(<ThemedText type={type}>Text</ThemedText>);
      expect(getByText('Text')).toBeTruthy();
    }
  });

  it('applies the default text color from the theme', () => {
    const { getByText } = render(<ThemedText>Themed text</ThemedText>);
    const flat = StyleSheet.flatten(getByText('Themed text').props.style);
    expect(flat.color).toBeDefined();
  });

  it('uses the lightColor prop as text color in light theme', () => {
    const { getByText } = render(
      <ThemedText lightColor="#abcdef">Colored</ThemedText>,
    );
    const flat = StyleSheet.flatten(getByText('Colored').props.style);
    expect(flat.color).toBe('#abcdef');
  });

  it('title type has a larger fontSize than default', () => {
    const { getByText: getDefault } = render(<ThemedText type="default">A</ThemedText>);
    const { getByText: getTitle } = render(<ThemedText type="title">B</ThemedText>);
    const defaultStyle = StyleSheet.flatten(getDefault('A').props.style);
    const titleStyle = StyleSheet.flatten(getTitle('B').props.style);
    expect(titleStyle.fontSize).toBeGreaterThan(defaultStyle.fontSize as number);
  });
});
