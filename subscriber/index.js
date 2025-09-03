const { connect, StringCodec, AckPolicy } = require('nats');
const sc = StringCodec();
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const PROCESS_MS = parseInt(process.env.PROCESS_MS || '5000', 10);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log('Subscriber connected to', nc.getServer());

  if (nc.jetstream) {
    const js = nc.jetstream();
    const DURABLE = 'demo_consumer_v4';
    try {
      const sub = await js.pullSubscribe('greet', {
        config: {
          durable_name: DURABLE,
          ack_policy: AckPolicy.Explicit,
          ack_wait: Math.max(PROCESS_MS * 4, 30000) * 1_000_000, // nanos
        },
      });
      console.log('Pull consumer ready (durable', DURABLE + ')');

      // issue initial pull
      sub.pull({ batch: 1, expires: 5000 });

      for await (const m of sub) {
        try {
          const data = sc.decode(m.data);
          console.log(new Date().toISOString(), '| got message:', data);
          await sleep(PROCESS_MS);
          m.ack();
          console.log(new Date().toISOString(), '| acked message:', data);
        } catch (err) {
          console.error('Process error:', err.message || err);
        } finally {
          // request next one
          try { sub.pull({ batch: 1, expires: 5000 }); } catch (_) {}
        }
      }
    } catch (err) {
      console.error('Failed to start pull subscription:', err.message || err);
    }
  } else {
    const subj = 'greet';
    const sub = nc.subscribe(subj);
    console.log(`Subscribed to ${subj}`);
    for await (const m of sub) {
      console.log('Received:', sc.decode(m.data));
      await sleep(PROCESS_MS);
      console.log('Done processing');
    }
  }
})();
