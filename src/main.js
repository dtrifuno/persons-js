import { createApp } from './app';
import { Configuration } from './config';

const config = new Configuration();
const app = createApp(config);
app.listen(config.server);
