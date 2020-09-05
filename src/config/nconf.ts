import { argv } from 'nconf';
import path from 'path';

/**
 * Web server server environment configuration. Define your global configuration properties in the `global.json` file.
 */
const config = argv()
  .env('__')
  .file({
    file: path.join(__dirname, 'global.json'),
  });

export default config;
