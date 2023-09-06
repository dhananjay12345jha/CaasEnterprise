import fs from 'fs';

export function writeFile(args, filePath, content) {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
}
