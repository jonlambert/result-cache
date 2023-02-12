# Cache Promise Results

Easily cache anything that returns a promise.

```ts
import { createCache } from 'result-cache';

const { cache } = createCache({ ttl: 30 });

const result = await cache(() => fetch('api.example.com').then(response => response.json()), 'results');

```

## Use with Redis

By default, results will be stored in-memory. This is only suitable for development or testing - instead it's strongly recommended to use an external key/value store such as Redis.

## Caveats

### Serialisation

Objects will be serialised before being written to the cache. Therefore, any unsupported attributes will be stripped when the cache is hit. To help guard against unexpected behaviour, the result of `cache(fn)` will match the return type of `fn`, with any symbols, functions, etc. marked as `optional`.

### Validation

This library does not validate anything retrieved from the cache. As such, it is strongly recommended to consider any data returned as unstructured.

```ts
import { z } from 'zod';

const personSchema = z.object({ name: z.string() });

const result = await cache(fetchPerson, 'person');

const person = personSchema.parse(result);
```
