import fs from 'fs';
import contacts from './contacts.json';
import axios from 'axios';
import { SettableExpressProfile } from './expressProfile';

const BASE_URL = 'http://localhost:8000';

const server = axios.create({
  baseURL: BASE_URL,
  timeout: 1000,
  headers: {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBhdC53dWNrZXJ0MTJAaG90bWFpbC5jb20iLCJyb2xlIjoidXNlciIsIlByb2ZpbGVJZCI6IjA2NDdmN2E5LTRhNDItNDBkYi1iMjA3LWRjN2NjZGRiNjBhMyIsImlhdCI6MTcwODA3MjQ2OSwiZXhwIjoxNzA4MDc2MDY5fQ.esd4k05yCp9DHQ3MiKwjdl5LcEC7r0UnQQfytr1kw_c',
  },
});

async function getOrCreateUser(userProfile: (typeof contacts)[0]) {
  try {
    const res = await server.post('/api/profiles', {
      email: userProfile.email,
      type: userProfile.type,
    });
    return res.data.entity;
  } catch (e) {
    const res = await server.get('/api/profiles', {
      params: {
        email: userProfile.email,
      },
    });
    return res.data.entity[0];
  }
}

async function createUser(userProfile: (typeof contacts)[0]) {
  if (userProfile.email === undefined) return;
  if (userProfile.type !== 'moral' && userProfile.type !== 'fisica') return;

  const userId = (await getOrCreateUser(userProfile)).id;

  const newUser: SettableExpressProfile = {
    firstName: userProfile.name,
    lastName: userProfile.lastname || undefined,
    nickName: userProfile.nickname || undefined,
    secondaryEmails: [userProfile.altEmail, userProfile.altEmail2].filter(
      (v) => !!v
    ) as string[],
    primaryActivity: userProfile.subareas?.at(0),
    secondaryActivity: userProfile.subareas?.at(1),
    thirdActivity: userProfile.subareas?.at(2),
    phoneNumbers:
      ([userProfile.phone, userProfile.altPhone, userProfile.altPhone2]
        .map((v) => v?.replaceAll(/[- /]/g, ''))
        .filter((v) => !!v) as string[]) || undefined,
    state: userProfile.state || undefined,
    city: userProfile.city || undefined,
    country: userProfile.country || undefined,
    postalCode: userProfile.postalCode || undefined,
    university: userProfile.university || undefined,
    associations: userProfile.asociations || undefined,
    remote: userProfile.remoteWork === true,
    certifications: userProfile.certifications || undefined,
    birthday: !!userProfile.birthday
      ? new Date(userProfile.birthday).toISOString()
      : undefined,
    headline: userProfile.headline || undefined,
    languages: userProfile.languages?.map((lang) => ({
      lang: lang.lang,
      proficiency:
        typeof lang.proficiency == 'string'
          ? lang.proficiency
          : ['basic', 'intermediate', 'advanced', 'native'][lang.proficiency],
    })),
    gender:
      userProfile.gender === 'Masculino'
        ? 'male'
        : userProfile.gender === 'Femenino'
        ? 'female'
        : ['Persona Moral', 'No binario', 'Prefiero no decir'].includes(
            userProfile.gender
          )
        ? 'other'
        : undefined,
    workRadius:
      userProfile.workRadius === 'international'
        ? 'international'
        : userProfile.workRadius === 'local'
        ? 'local'
        : userProfile.workRadius === 'national'
        ? 'national'
        : userProfile.workRadius === 'state'
        ? 'state'
        : undefined,
    probono: userProfile.probono === true,
  };

  await server.patch('/api/profiles/' + userId, newUser);
}

function countryToISO31661Alpha2(country?: string) {
  if (country === undefined) return undefined;
  switch (country.toLocaleLowerCase().trim()) {
    case 'mexico':
      return 'MX';
    case 'méxico':
      return 'MX';
    case 'mèxico':
      return 'MX';
    case 'non':
      return 'MX';
    case 'perú':
      return 'PE';
    case 'colombia':
      return 'CO';
    case 'argentina':
      return 'AR';
    case 'uruguay':
      return 'UY';
    case 'usa':
      return 'US';
    case 'united states':
      return 'US';
    case 'panamá':
      return 'PA';
    case 'guatemala':
      return 'GT';
    case 'rep dominicana':
      return 'DO';
    case 'españa':
      return 'ES';
    case 'puerto rico':
      return 'PR';
    case 'costa rica':
      return 'CR';
    default:
      return undefined;
  }
}
const usersNotAdded: string[] = [];
async function addRecordsToDatabase() {
  for (let user of contacts) {
    user.country = countryToISO31661Alpha2(user.country);
    try {
      await createUser(user);
    } catch (e) {
      console.error(e);

      usersNotAdded.push(
        `${user.email!} ${JSON.stringify(
          (e! as { response: { data: { errors: object } } }).response!.data!
            .errors
        )}`
      );
    }
  }
  fs.writeFileSync('./missing.txt', usersNotAdded.join('\n'));
}

addRecordsToDatabase();
