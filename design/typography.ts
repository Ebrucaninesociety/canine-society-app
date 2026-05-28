import { TextStyle } from 'react-native';

// Baskervville is the canine-society.com display face. Manrope stands in
// for Switzer (the site's licensed body face is not on Google Fonts —
// Manrope is the bundled fallback the site itself uses in CSS).

export const typography = {
  display: {
    fontFamily: 'Baskervville_400Regular',
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -0.5,
  } as TextStyle,
  headline: {
    fontFamily: 'Baskervville_400Regular',
    fontSize: 30,
    lineHeight: 34,
  } as TextStyle,
  title: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,
  label: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 2.0,
    textTransform: 'uppercase',
  } as TextStyle,
};
