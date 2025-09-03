const { connect, StringCodec } = require('nats');
const sc = StringCodec();
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log('Subscriber connected to', nc.getServer());
  const subj = 'greet';
  const sub = nc.subscribe(subj);
  console.log(`Subscribed to ${subj}`);
  for await (const m of sub) {
    console.log('Received:', sc.decode(m.data));
  }
})();
