import { argv } from 'nconf';
import { join } from 'path';

const config = argv()
  .env('__')
  .file({
    file: join(__dirname, 'global.json'),
  });

export default config;
