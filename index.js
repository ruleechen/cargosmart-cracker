/*
* index
*/

const dotenv = require('dotenv');
const server = require('./src/server');

dotenv.config({ path: './.env' });

const instance = server.create();

console.log(`Server is listening on http://localhost:${process.env.port}`);

instance.listen(process.env.port);
