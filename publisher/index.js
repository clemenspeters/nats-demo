const { connect, StringCodec, StringParser } = require('nats');
const sc = StringCodec();
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log('Publisher connected to', nc.getServer());

  // Enable JetStream
  const jsm = await nc.jetstreamManager().catch(() => null);
  if (jsm) {
    const desired = {
      name: 'GREET',
      subjects: ['greet'],
      retention: 'workqueue',
      storage: 'file',
      discard: 'old',
    };
    let recreate = false;
    try {
      const info = await jsm.streams.info('GREET');
      const currentRetention = info.config.retention; // expected 'limits' currently
      if (currentRetention !== 'workqueue') {
        console.log('Existing stream retention is', currentRetention, '-> will recreate as workqueue (destructive)');
        recreate = true;
      }
    } catch (_) {
      // missing stream
      recreate = true;
    }
    if (recreate) {
      try { await jsm.streams.delete('GREET'); } catch (_) {}
      await jsm.streams.add(desired);
      console.log('Created JetStream stream GREET with workqueue retention');
    } else {
      console.log('Stream GREET already has workqueue retention');
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
