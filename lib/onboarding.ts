import { create } from 'zustand';

export type Gender = 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say';
export type LookingFor = 'women' | 'men' | 'everyone';
export type DogSize = 'small' | 'medium' | 'large';
export type Country = 'DE' | 'AT' | 'CH';

type OnboardingState = {
  displayName: string;
  birthdate: string;
  gender: Gender | null;
  lookingFor: LookingFor[];
  city: string;
  country: Country;
  bio: string;
  photos: { uri: string; isDog: boolean }[];
  dog: { name: string; breed: string; size: DogSize | null; bio: string };
};

type OnboardingActions = {
  set: (partial: Partial<OnboardingState>) => void;
  reset: () => void;
};

export type Onboarding = OnboardingState & OnboardingActions;

const initial: OnboardingState = {
  displayName: '',
  birthdate: '',
  gender: null,
  lookingFor: [],
  city: '',
  country: 'DE',
  bio: '',
  photos: [],
  dog: { name: '', breed: '', size: null, bio: '' },
};

export const useOnboarding = create<Onboarding>((set) => ({
  ...initial,
  set: (partial) => set(partial),
  reset: () => set(initial),
}));
