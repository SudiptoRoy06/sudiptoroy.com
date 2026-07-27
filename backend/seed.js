import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {
  connectDatabase, closeDatabase, normalizeEmail, User, Profile, Skill, Experience
} from './db.js';

const email = normalizeEmail(process.env.ADMIN_EMAIL || '');
const password = process.env.ADMIN_PASSWORD || '';
if (!email || password.length < 12) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) before provisioning');
}

try {
  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne({ email }, { $set: { passwordHash }, $setOnInsert: { email } }, { upsert: true, runValidators: true });
  await Profile.updateOne({ identity: 'primary' }, {
    $setOnInsert: {
      identity: 'primary',
      headline: 'Software engineer crafting dependable digital products.',
      biography: 'I turn complex problems into clear, accessible experiences—pairing product thinking with pragmatic engineering.',
      email: '', availability: true
    }
  }, { upsert: true, runValidators: true });
  if (!await Skill.exists({})) {
    await Skill.insertMany(['React & TypeScript', 'Node.js & APIs', 'Product engineering', 'Accessible UI']
      .map((name, sortOrder) => ({ name, description: 'Proficiency level to be verified by Sudipto.', sortOrder })));
  }
  if (!await Experience.exists({})) {
    await Experience.create({
      role: 'Software Engineer', company: 'Employer to verify', period: 'Dates to verify',
      summary: 'Employment claims and outcomes require Sudipto’s review.', sortOrder: 0
    });
  }
  console.log(`Provisioned ${email} and added only missing draft content.`);
} finally {
  await closeDatabase();
}
