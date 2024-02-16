import fs from 'fs';
import firebase from 'firebase-admin';

import serviceAccount from './creds.json';

firebase.initializeApp({
  credential: firebase.credential.cert(
    serviceAccount as firebase.ServiceAccount
  ),
  databaseURL: 'gs://labrujulaaudiovisual-c163e.appspot.com',
});

async function scrapeFirestore() {
  let data: object[] = [];

  const db = firebase.firestore();
  const collection = db.collection('users');

  const totalRegistrations = (await collection.count().get()).data().count;

  console.log(totalRegistrations);

  const LIMIT = 50;

  for (var i = 0; i < totalRegistrations; i += LIMIT) {
    const res = await collection.orderBy('__name__').limit(LIMIT).offset(i).get();
    data.push(...res.docs.map((doc) => doc.data()));
  }

  fs.writeFileSync('./contacts.json', JSON.stringify(data), {
    encoding: 'utf-8',
  });
  console.log(`Se descargaron ${data.length} contactos.`);
}

scrapeFirestore().then(() =>
  console.log('Todos los contactos han sido descargados de Firebase')
);
