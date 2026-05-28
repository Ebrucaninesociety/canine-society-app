import { TextStyle } from 'react-native';

// Display: 'The Seasons' is the brand's display face. It is not on Google
// Fonts (licensed via Lost Type). Until the .otf is licensed and dropped
// in assets/fonts/, we use Bodoni Moda as the official fallback per the
// brand DESIGN.md.
//
// To swap in the real Seasons:
//   1. Place TheSeasons-Regular.otf in assets/fonts/
//   2. Load it via expo-font in app/_layout.tsx with name 'TheSeasons_Regular'
//   3. Replace 'BodoniModa_400Regular' below with 'TheSeasons_Regular'
//
// Body / label: DM Sans (free, Google Fonts).

export const typography = {
  display: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -0.5,
  } as TextStyle,
  headline: {
    fontFamily: 'BodoniModa_400Regular',
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
