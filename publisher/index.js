const { connect, StringCodec, StringParser } = require('nats');
const sc = StringCodec();
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log('Publisher connected to', nc.getServer());

  // Enable JetStream
  const jsm = await nc.jetstreamManager().catch(() => null);
  if (jsm) {
    try {
      await jsm.streams.info('GREET');
    } catch (err) {
      // create stream if missing
      await jsm.streams.add({ name: 'GREET', subjects: ['greet', 'greet.*'] });
      console.log('Created JetStream stream GREET');
    }
  }

  const subj = 'greet';
  let i = 0;
  setInterval(async () => {
    const msg = `hello ${++i} from publisher`;
    if (nc.jetstream) {
      const js = nc.jetstream();
      await js.publish(subj, sc.encode(msg));
    } else {
      nc.publish(subj, sc.encode(msg));
    }
    console.log('Published:', msg);
  }, 1000);
})();
