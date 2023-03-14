# Cache Promise Results

Cleanly cache the result of any function that returns a promise. API heavily inspired by @tanstack/query.

Zero dependencies (Redis optional)

```bash
npm install result-cache
```

```ts
import { createCache } from 'result-cache';

const { cache } = createCache({ ttl: 30 });

// If there's a previous value in the cache matching the key 'results', fetch and return it. 
// Otherwise, execute the fetch call and cache the result.
const result = await cache(() => fetch('api.example.com').then(response => response.json()), 'results');

```

## Use with Redis

By default, records will be cached in memory (just a simple `Map`). This is only really advisable for development or testing. In production, configure the Redis driver:

```bash
npm install @redis/client
```

```ts
import { createCache } from 'result-cache';
import { RedisDriver } from 'result-cache/redis';

import { createClient } from '@redis/client';

const driver = new RedisDriver(createClient());
const { cache } = createCache({ driver });
```

## Caveats

### Serialisation

Objects will be serialised before being written to the cache. Therefore any unsupported attributes (functions, symbols) will be stripped when the cache is hit.

### Validation

This library does not validate anything retrieved from the cache. This responsibility should lie outside the library. As such, it is strongly recommended to consider any data returned as unstructured.

```ts
import { z } from 'zod';

const personSchema = z.object({ name: z.string() });

const result = await cache(fetchPerson, 'person');

const person = personSchema.parse(result);
```
