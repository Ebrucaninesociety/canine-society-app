import { TextStyle } from 'react-native';

// Per the brand book: headlines in The Seasons, body in DM Sans.
// The Seasons is loaded from a licensed .ttf at assets/fonts/TheSeasons-Regular.ttf.

export const typography = {
  display: {
    fontFamily: 'TheSeasons_Regular',
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -0.5,
  } as TextStyle,
  headline: {
    fontFamily: 'TheSeasons_Regular',
    fontSize: 30,
    lineHeight: 34,
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
    letterSpacing: 2.0,
    textTransform: 'uppercase',
  } as TextStyle,
};
