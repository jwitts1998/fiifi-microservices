import { startServer } from './server';

const port = parseInt(process.env.PORT || '3000', 10);
startServer(port);
