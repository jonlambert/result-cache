type ExcludeFunctions<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K];
};
type ExcludeSymbols<T> = { [K in keyof T]: T[K] extends symbol ? never : T[K] };
// type ExcludeUndefined<T> = {
//   [K in keyof T]: T[K] extends undefined ? never : T[K];
// };
type ExcludeUnsupported<T> = ExcludeFunctions<ExcludeSymbols<T>>;

export type AfterSerialization<T> = {
  [K in keyof ExcludeFunctions<T>]: ExcludeFunctions<T>[K] extends never
    ? ExcludeFunctions<T>[K] | undefined
    : ExcludeFunctions<T>[K];
};
