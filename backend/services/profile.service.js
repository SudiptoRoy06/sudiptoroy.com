import sanitizeHtml from 'sanitize-html';
import { Profile } from '../models/index.js';

export const updateProfile = (value) => Profile.findOneAndUpdate(
  { identity: 'primary' },
  {
    $set: {
      headline: sanitizeHtml(value.headline, { allowedTags: [] }),
      biography: sanitizeHtml(value.bio, { allowedTags: [] }),
      email: value.email,
      availability: value.available
    }
  },
  { new: true, runValidators: true, upsert: true }
);

export const findProfileCv = () => Profile.findOne({ identity: 'primary' }).select('cv').lean();
