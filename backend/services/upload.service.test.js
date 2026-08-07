import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Profile } from '../models/index.js';

const r2 = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  putObject: vi.fn(),
  putBuffer: vi.fn()
}));

vi.mock('./r2.service.js', () => r2);

const { saveContentUpload, saveProfileUpload, validContentFolder } = await import('./upload.service.js');

const image = {
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
  mimetype: 'image/png',
  originalname: 'example.PNG'
};

describe('R2 upload folders', () => {
  beforeEach(() => vi.clearAllMocks());

  test.each(['projects', 'products', 'blogs', 'events', 'writing-and-talks'])(
    'accepts the safe content folder %s',
    folder => expect(validContentFolder(folder)).toBe(true)
  );

  test.each(['', 'avatar', 'cv', 'about', '../events', 'events/photos', 'Events', '-events'])(
    'rejects the unsafe or reserved folder %s',
    folder => expect(validContentFolder(folder)).toBe(false)
  );

  test('uploads project and custom-section images beneath their folder', async () => {
    const projectUrl = await saveContentUpload('image', image, 'projects');
    const blogUrl = await saveContentUpload('logo', image, 'blogs');

    expect(projectUrl).toMatch(/^\/uploads\/projects\/[a-f0-9-]+-original\.png$/);
    expect(blogUrl).toMatch(/^\/uploads\/blogs\/[a-f0-9-]+-original\.png$/);
    expect(r2.putObject.mock.calls.map(([key]) => key)).toEqual([
      expect.stringMatching(/^projects\/[a-f0-9-]+-original\.png$/),
      expect.stringMatching(/^blogs\/[a-f0-9-]+-original\.png$/)
    ]);
  });

  test('stores portraits and CVs in their designated folders', async () => {
    vi.spyOn(Profile, 'findOneAndUpdate').mockReturnValue({
      lean: vi.fn().mockResolvedValue({ portrait: '', cv: '' })
    });

    const portraitUrl = await saveProfileUpload('portrait', image);
    const cvUrl = await saveProfileUpload('cv', {
      buffer: Buffer.from('pdf'),
      mimetype: 'application/pdf',
      originalname: 'resume.pdf'
    });

    expect(portraitUrl).toMatch(/^\/uploads\/avatar\/[a-f0-9-]+-original\.png$/);
    expect(cvUrl).toMatch(/^\/uploads\/cv\/[a-f0-9-]+\.pdf$/);
  });

  test('does not upload when the MIME type or folder is invalid', async () => {
    expect(await saveContentUpload('image', image, '../blogs')).toBeNull();
    expect(await saveContentUpload('image', { ...image, mimetype: 'application/pdf' }, 'blogs')).toBeNull();
    expect(r2.putObject).not.toHaveBeenCalled();
  });
});
