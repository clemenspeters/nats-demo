const { connect, StringCodec } = require('nats');
const sc = StringCodec();
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log('Publisher connected to', nc.getServer());
  const subj = 'greet';
  let i = 0;
  setInterval(() => {
    const msg = `hello ${++i} from publisher`;
    nc.publish(subj, sc.encode(msg));
    console.log('Published:', msg);
  }, 1000);
})();
