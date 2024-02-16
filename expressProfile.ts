export interface SettableExpressProfile {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  secondaryEmails?: string[];
  primaryActivity?: string;
  secondaryActivity?: string;
  thirdActivity?: string;
  phoneNumbers?: string[];
  languages?: { lang: string; proficiency: string }[];
  gender?: 'male' | 'female' | 'other';
  state?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  workRadius?: 'local' | 'state' | 'national' | 'international';
  university?: string;
  associations?: string;
  remote?: boolean;
  probono?: boolean;
  certifications?: string;
  headline?: string;
  birthday?: string;
}
