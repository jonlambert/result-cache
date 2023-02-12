# Cache Promise Results

Easily cache anything that returns a promise.

```ts
import { createCache } from 'result-cache';

const { cache } = createCache();

const results = await cache(() => fetch('api.example.com').then(response => response.json()), 'results');

```

## Use with Redis

By default, results will be stored in-memory. This is only suitable for development or testing - instead it's strongly recommended to use an external key/value store such as Redis.

## Caveats

### Validation

**NOTE: This library does not validate anything retrieved from the cache.**

It is strongly recommended to treat anything returned as unstructured, validating accordingly:

```ts
import { z } from 'zod';

const personSchema = z.object({ name: z.string() });

const results = await cache(fetchPerson, 'person');
```
