import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.5,
  } as TextStyle,
  headline: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 32,
    lineHeight: 36,
  } as TextStyle,
  title: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  } as TextStyle,
};
