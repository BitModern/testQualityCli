import * as glob from 'glob';

export default function asyncGlob(
  pattern: string,
  options: glob.IOptions = {}
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}
