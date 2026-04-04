# Research Report: Angular Dependency Injection System — Chapter 1

**Agent**: Researcher #3 — Code Archaeologist  
**Target Repo**: [angular/angular](https://github.com/angular/angular)  
**Commit**: `4a174b89c8de7bad62be780d1bc20fe1383d4404`  
**Source Path**: `packages/core/src/di/`  
**Research Duration**: Deep read, ~2 hours  

---

## Overview: What I Came Looking For vs What I Found

I started with a simple question: when you write `inject(MyService)` in a component constructor, what actually happens? I expected to find a registry lookup. What I found is more interesting — a three-layer architecture with a clever "inject switch" that redirects calls based on context, sentinels borrowed from compiler theory, and a primitives layer that's quietly being extracted under the hood.

---

## Layer 0: The Primitives Layer (New, Often Overlooked)

Before reaching the Angular DI code, there's now a separate module:

```
packages/core/primitives/di/src/injector.ts
```

This is a *framework-agnostic* layer that defines the concept of an "injection context":

```typescript
// packages/core/primitives/di/src/injector.ts:L15-30
let _currentInjector: Injector | undefined | null = undefined;

export function getCurrentInjector(): Injector | undefined | null {
  return _currentInjector;
}

export function setCurrentInjector(
  injector: Injector | null | undefined,
): Injector | undefined | null {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}
```

The three states of `_currentInjector` encode everything:
- `undefined` → we are NOT in any injection context; `inject()` call is illegal and will throw
- `null` → we ARE in an injection context, but there's no injector (the "limp mode")
- `Injector instance` → normal operation; this injector handles the lookup

The primitives layer also defines the `Injector` interface with just one method:

```typescript
// packages/core/primitives/di/src/injector.ts:L12-14
export interface Injector {
  retrieve<T>(token: InjectionToken<T>, options?: unknown): T | NotFound;
}
```

Notice: only `retrieve()`. The familiar `get()` method is a *backwards-compatibility* wrapper added by the Angular layer on top.

**Interesting Note**: The primitives layer uses a sentinel return value pattern (`NotFound`) instead of exceptions for the "not found" case. The Angular layer (`R3Injector`) wraps this and re-throws when needed.

---

## Layer 1: The Token System

### `InjectionToken<T>` — packages/core/src/di/injection_token.ts

```typescript
// packages/core/src/di/injection_token.ts:L60-75
export class InjectionToken<T> {
  /** @internal */
  readonly ngMetadataName = 'InjectionToken';
  readonly ɵprov: unknown;

  constructor(
    protected _desc: string,
    options?: {
      providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
      factory: () => T;
    },
  ) {
    this.ɵprov = undefined;
    if (typeof options == 'number') {
      // Special hack: assign __NG_ELEMENT_ID__ for internal injector markers
      (this as any).__NG_ELEMENT_ID__ = options;
    } else if (options !== undefined) {
      this.ɵprov = ɵɵdefineInjectable({
        token: this,
        providedIn: options.providedIn || 'root',
        factory: options.factory,
      });
    }
  }
}
```

Key observations:
1. `ɵprov` is the "injectable declaration" — if it's `undefined`, this token has no factory and must be explicitly provided.
2. The `typeof options == 'number'` branch is a surprising hack: passing a **negative number** to the constructor sets `__NG_ELEMENT_ID__`, used for internal Angular tokens like `Injector`, `ElementRef`, etc. The comment says "only negative numbers are supported here."
3. The `_desc` string is only for debugging — the token identity is determined by **object reference**, not by description string. Two tokens with the same description are still different tokens.

### `ɵɵdefineInjectable` — packages/core/src/di/interface/defs.ts

```typescript
// packages/core/src/di/interface/defs.ts:L168-180
export function ɵɵdefineInjectable<T>(opts: {
  token: unknown;
  providedIn?: Type<any> | 'root' | 'platform' | 'any' | 'environment' | null;
  factory: (parent?: Type<any>) => T;
}): ɵɵInjectableDeclaration<T> {
  return {
    token: opts.token,
    providedIn: (opts.providedIn as any) || null,
    factory: opts.factory,
    value: undefined,   // ← lazy cache slot
  };
}
```

The `value: undefined` slot is used as a singleton cache. For "root"-scoped tokens without an explicit injector (limp mode), the value is stored directly on the `ɵɵInjectableDeclaration` object.

### The `ɵɵInjectableDeclaration` interface

```typescript
// packages/core/src/di/interface/defs.ts:L37-63
export interface ɵɵInjectableDeclaration<T> {
  providedIn: InjectorType<any> | 'root' | 'platform' | 'any' | 'environment' | null;
  token: unknown;
  factory: (t?: Type<any>) => T;
  value: T | undefined;
}
```

This is the runtime metadata attached to every injectable class/token as a static `ɵprov` field. The Angular compiler emits calls to `ɵɵdefineInjectable()` to populate this at class definition time.

---

## Layer 2: The Provider Interfaces

`packages/core/src/di/interface/provider.ts` defines the full union:

```typescript
export type Provider =
  | TypeProvider        // just the class itself
  | ValueProvider       // { provide: TOKEN, useValue: VALUE }
  | ClassProvider       // { provide: TOKEN, useClass: CLASS }
  | ConstructorProvider // { provide: CLASS, deps: [...] }
  | ExistingProvider    // { provide: TOKEN, useExisting: OTHER_TOKEN }
  | FactoryProvider     // { provide: TOKEN, useFactory: fn, deps: [...] }
  | any[];
```

All six types get normalized to an internal `Record<T>` by `providerToRecord()` — more on that below.

---

## Layer 3: The R3Injector — The Heart of the System

### File: `packages/core/src/di/r3_injector.ts`

This is the main implementation. `R3Injector` extends `EnvironmentInjector` (the abstract class also defined in this file) and implements the primitives `Injector` interface.

### The `Record<T>` Internal Type

```typescript
// packages/core/src/di/r3_injector.ts:L103-108
interface Record<T> {
  factory: ((_: undefined, flags?: InternalInjectFlags) => T) | undefined;
  value: T | {};
  multi: any[] | undefined;
}
```

This is the core data structure. For every provider token, the injector keeps:
- `factory`: how to make the value (may be `undefined` for value providers after the value is cached)
- `value`: the singleton instance (or a sentinel `NOT_YET`/`CIRCULAR`)
- `multi`: the accumulated array for `multi: true` providers

### The Sentinel Values

```typescript
// packages/core/src/di/r3_injector.ts:L83-94
const NOT_YET = {};    // value not yet created
const CIRCULAR = {};   // factory currently executing (cycle detection)
```

These are plain empty objects `{}`. No class, no symbol. This is intentional: identity comparison (`===`) is all that matters. Using actual class instances would risk accidentally triggering other code paths.

### The `R3Injector` Constructor

```typescript
// packages/core/src/di/r3_injector.ts:L229-262
constructor(
  providers: Array<Provider | EnvironmentProviders>,
  readonly parent: Injector,
  readonly source: string | null,
  readonly scopes: Set<InjectorScope>,
) {
  super();
  forEachSingleProvider(providers, (provider) => this.processProvider(provider));

  // Always make INJECTOR token return this injector
  this.records.set(INJECTOR, makeRecord(undefined, this));

  if (scopes.has('environment')) {
    this.records.set(EnvironmentInjector, makeRecord(undefined, this));
  }

  const record = this.records.get(INJECTOR_SCOPE) as Record<InjectorScope | null>;
  if (record != null && typeof record.value === 'string') {
    this.scopes.add(record.value as InjectorScope);
  }
  this.injectorDefTypes = new Set(this.get(INJECTOR_DEF_TYPES, EMPTY_ARRAY, {self: true}));
}
```

Notable: at construction time, **all providers are processed into `Record` entries**, but **no values are instantiated**. Everything is lazy (`value = NOT_YET`).

### The `get()` Method — The Lookup Algorithm

This is the key function. Full text (~90 lines) starting around line 322 of `r3_injector.ts`:

```typescript
override get<T>(token: ProviderToken<T>, notFoundValue: any = THROW_IF_NOT_FOUND, options?: InjectOptions): T {
  assertNotDestroyed(this);

  // Special case: tokens with NG_ENV_ID (like ElementRef) bypass the normal lookup
  if (token.hasOwnProperty(NG_ENV_ID)) {
    return (token as any)[NG_ENV_ID](this);
  }

  const flags = convertToBitFlags(options) as InternalInjectFlags;

  // Set injection context for devtools profiling
  const previousInjector = setCurrentInjector(this);
  const previousInjectImplementation = setInjectImplementation(undefined);
  try {
    // Step 1: SkipSelf check — if set, don't look in this injector
    if (!(flags & InternalInjectFlags.SkipSelf)) {
      let record: Record<T> | undefined | null = this.records.get(token);

      if (record === undefined) {
        // Step 2: Token not in records. Check for tree-shakable provider.
        const def = couldBeInjectableType(token) && getInjectableDef(token);
        if (def && this.injectableDefInScope(def)) {
          // Token is tree-shakable and belongs to this scope — register it now
          record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
        } else {
          record = null;  // null means "checked and not here"
        }
        this.records.set(token, record);  // cache the result (even null)
      }

      // Step 3: If we have a record, hydrate it
      if (record != null) {
        return this.hydrate(token, record, flags);
      }
    }

    // Step 4: Delegate up the hierarchy
    const nextInjector = !(flags & InternalInjectFlags.Self) ? this.parent : getNullInjector();
    notFoundValue = flags & InternalInjectFlags.Optional && notFoundValue === THROW_IF_NOT_FOUND
      ? null : notFoundValue;
    return nextInjector.get(token, notFoundValue);

  } catch (error: any) {
    // Step 5: Error enrichment — append current token to the dependency path
    const errorCode = getRuntimeErrorCode(error);
    if (errorCode === RuntimeErrorCode.CYCLIC_DI_DEPENDENCY ||
        errorCode === RuntimeErrorCode.PROVIDER_NOT_FOUND) {
      if (ngDevMode) {
        prependTokenToDependencyPath(error, token);
        if (previousInjector) {
          throw error;
        } else {
          throw augmentRuntimeError(error, this.source);
        }
      } else {
        throw new RuntimeError(errorCode, null);  // strip path info in prod
      }
    } else {
      throw error;
    }
  } finally {
    setInjectImplementation(previousInjectImplementation);
    setCurrentInjector(previousInjector);
    ngDevMode && setInjectorProfilerContext(prevInjectContext!);
  }
}
```

**Critical insight in Step 5**: Angular walks the error up the injector chain, *prepending* the current token to a path. By the time the error reaches the top, `ngTokenPath` in the error object contains the full chain `[A → B → C → (missing)]`. This is why Angular's "no provider" errors show a token path — it's assembled on the way up.

**Another critical insight**: `this.records.set(token, null)` when a token is not found. `null` means "we already checked, it's not here." This is a negative-caching optimization. On subsequent lookups for the same token, we skip the `getInjectableDef()` check and go straight to the parent.

### The `hydrate()` Method — Singleton Creation with Cycle Detection

```typescript
// packages/core/src/di/r3_injector.ts:L524-554
private hydrate<T>(token: ProviderToken<T>, record: Record<T>, flags: InternalInjectFlags): T {
  const prevConsumer = setActiveConsumer(null);
  try {
    if (record.value === CIRCULAR) {
      throw cyclicDependencyError(ngDevMode ? stringify(token) : '');
    } else if (record.value === NOT_YET) {
      record.value = CIRCULAR;           // ← Mark as "currently creating"
      record.value = record.factory!(undefined, flags);  // ← Actually create it
    }
    if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
      this._ngOnDestroyHooks.add(record.value);
    }
    return record.value as T;
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
```

The cycle detection is elegant:
1. Before calling `factory()`, set `record.value = CIRCULAR`
2. If `factory()` triggers another `get()` for the *same token*, the value check hits `=== CIRCULAR` and throws immediately
3. If `factory()` completes normally, `record.value` gets the real instance and `CIRCULAR` is overwritten
4. On all subsequent calls, `record.value !== NOT_YET` and `!== CIRCULAR`, so we just return the cached value

### `providerToFactory()` — How Providers Become Factories

```typescript
// packages/core/src/di/r3_injector.ts:L638-700
export function providerToFactory(provider: SingleProvider, ...): (...) => any {
  if (isTypeProvider(provider)) {
    return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
  } else {
    if (isValueProvider(provider)) {
      factory = () => resolveForwardRef(provider.useValue);
    } else if (isFactoryProvider(provider)) {
      factory = () => provider.useFactory(...injectArgs(provider.deps || []));
    } else if (isExistingProvider(provider)) {
      factory = (_, flags) => ɵɵinject(resolveForwardRef(provider.useExisting), flags);
    } else {
      // useClass case
      const classRef = resolveForwardRef(provider.useClass || provider.provide);
      if (hasDeps(provider)) {
        factory = () => new classRef(...injectArgs(provider.deps));
      } else {
        return getFactoryDef(classRef) || injectableDefOrInjectorDefFactory(classRef);
      }
    }
  }
  return factory;
}
```

Key observation about `useExisting`: it doesn't store the value — it calls `ɵɵinject()` every time. This means `useExisting` is not just "copy the value at registration time" — it's a live alias that goes through the full lookup each time (though since the result is cached, this is only called once in practice).

---

## Layer 4: The Inject Switch

### File: `packages/core/src/di/inject_switch.ts`

```typescript
// packages/core/src/di/inject_switch.ts:L21-38
let _injectImplementation:
  | (<T>(token: ProviderToken<T>, flags?: InternalInjectFlags) => T | null)
  | undefined;

export function setInjectImplementation(
  impl: ... | undefined,
): ... | undefined {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}
```

And the `ɵɵinject` function in `injector_compatibility.ts`:

```typescript
// packages/core/src/di/injector_compatibility.ts:L139-145
export function ɵɵinject<T>(token, flags = InternalInjectFlags.Default): T | null {
  return (getInjectImplementation() || injectInjectorOnly)(
    resolveForwardRef(token),
    flags,
  );
}
```

This single line `(getInjectImplementation() || injectInjectorOnly)` is how Angular separates environment injectors from component (node) injectors. When processing a component's constructor:
- `_injectImplementation` is set to `directiveInject` (which walks the NodeInjector tree)
- After the component is created, it's restored to `undefined`

This means `inject()` is context-sensitive at the function-pointer level.

---

## Layer 5: The Injector Hierarchy

### Two Parallel Trees

Angular maintains two separate injector hierarchies:

**Environment (R3Injector) tree:**
```
NullInjector           ← root terminator, always throws
  └── Platform Injector (scopes: {'platform'})
        └── Root Injector (scopes: {'root', 'environment'})
              └── Route/Feature Injectors (optional)
```

**Node (Component) tree:**
```
Each component has a NodeInjector
NodeInjector looks up its own providers, then delegates to parent NodeInjector
When it reaches the root component, it delegates to the Environment tree
```

### `NullInjector` — The Final Terminator

```typescript
// packages/core/src/di/null_injector.ts:L16-27
export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const error = createRuntimeError(message, RuntimeErrorCode.PROVIDER_NOT_FOUND);
      error.name = 'ɵNotFound';   // ← matches primitives layer's NotFound check
      throw error;
    }
    return notFoundValue;
  }
}
```

The `error.name = 'ɵNotFound'` is interesting — it's set to match the `isNotFound()` check in the primitives layer, which identifies "not found" errors vs other errors by name check.

### The `injectableDefInScope()` Method

```typescript
// packages/core/src/di/r3_injector.ts:L558-574
private injectableDefInScope(def: ɵɵInjectableDeclaration<any>): boolean {
  if (!def.providedIn) {
    return false;
  }
  const providedIn = resolveForwardRef(def.providedIn);
  if (typeof providedIn === 'string') {
    return providedIn === 'any' || this.scopes.has(providedIn);
  } else {
    return this.injectorDefTypes.has(providedIn);
  }
}
```

This is how `providedIn: 'root'` works. When the root injector processes a token lookup:
1. Gets `def.providedIn = 'root'`
2. Checks `this.scopes.has('root')` → true (root injector has `'root'` in its scopes set)
3. Returns `true` → creates the token here

---

## Layer 6: The `runInInjectionContext` Entry Point

### File: `packages/core/src/di/contextual.ts`

```typescript
// packages/core/src/di/contextual.ts:L40-62
export function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT {
  let internalInjector: PrimitivesInjector;
  if (injector instanceof R3Injector) {
    assertNotDestroyed(injector);
    internalInjector = injector;
  } else {
    internalInjector = new RetrievingInjector(injector);  // ← wraps old-style injectors
  }

  const prevInjector = setCurrentInjector(internalInjector);
  const previousInjectImplementation = setInjectImplementation(undefined);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
    setInjectImplementation(previousInjectImplementation);
  }
}
```

The pattern here is the same pattern used throughout Angular DI: **save → set → execute → restore**. It's essentially a manual call stack for injection context. Every injection-context-setting function (`get()`, `runInContext()`, `runInInjectionContext()`) uses this same pattern, saving the previous value and restoring it in `finally`.

---

## The "Limp Mode" — Injecting Without an Injector

```typescript
// packages/core/src/di/inject_switch.ts:L50-68
export function injectRootLimpMode<T>(
  token: ProviderToken<T>,
  notFoundValue: T | undefined,
  flags: InternalInjectFlags,
): T | null {
  const injectableDef = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == 'root') {
    return injectableDef.value === undefined
      ? (injectableDef.value = injectableDef.factory())
      : injectableDef.value;
  }
  if (flags & InternalInjectFlags.Optional) return null;
  if (notFoundValue !== undefined) return notFoundValue;
  throwProviderNotFoundError(token, ...);
}
```

This handles the edge case: `_currentInjector === null`. When you inject `providedIn: 'root'` tokens in server-side rendering startup code or test utilities before bootstrapping, the factory is called directly and the result is cached in `injectableDef.value`. This is the singleton cache on the declaration object itself.

---

## Full Call Chain: `inject(MyService)` → Instance

```
inject(MyService)
  └── ɵɵinject(MyService, Default)               injector_compatibility.ts
        └── (getInjectImplementation() || injectInjectorOnly)(MyService)
              └── injectInjectorOnly(MyService)
                    └── getCurrentInjector()       → R3Injector instance
                    └── currentInjector.retrieve(MyService, options)
                          └── R3Injector.retrieve()
                                └── R3Injector.get(MyService, THROW_IF_NOT_FOUND, flags)
                                      ├── [check NG_ENV_ID]                → no
                                      ├── records.get(MyService)           → Record{value: NOT_YET}
                                      │     OR
                                      │     record === undefined
                                      │       └── getInjectableDef(MyService).providedIn?
                                      │             └── injectableDefInScope()  → true/false
                                      │                   └── makeRecord(factory, NOT_YET)
                                      └── hydrate(MyService, record, flags)
                                            ├── record.value === CIRCULAR?  → throw CyclicDep
                                            ├── record.value === NOT_YET?
                                            │     └── record.value = CIRCULAR  ← guard
                                            │     └── record.factory()
                                            │           └── new MyService(...deps resolved recursively)
                                            │     └── record.value = instance  ← replace guard
                                            └── return record.value
```

If `records.get(MyService)` returns `null` (negative cache) or is not found after tree-shakable check:
```
R3Injector.get() → this.parent.get(MyService, notFoundValue)
  └── parent R3Injector.get() → ...
        └── NullInjector.get() → throw PROVIDER_NOT_FOUND
              └── error.name = 'ɵNotFound'
              └── thrown up the chain, each injector prepends its token to error path
```

---

## Surprising Implementation Details

### 1. The `null` negative cache is a performance trick

When `records.get(token) === undefined`, the injector checks for tree-shakable providers via `getInjectableDef()`. But if the token is not relevant to this scope, it sets `this.records.set(token, null)`. On the *next* lookup for the same token, `records.get(token) === null` (not `undefined`), so the `getInjectableDef()` check is skipped entirely and it goes straight to the parent. This is an O(1) negative cache.

### 2. `NG_ENV_ID` bypasses everything

Special tokens (like `ElementRef`, `ViewContainerRef`) set `__NG_ENV_ID__` to a function, and `R3Injector.get()` has a fast path at the very top that calls that function directly without touching `records`. This is how Angular provides view-layer tokens from an environment injector — they're intercepted before the lookup even starts.

### 3. Error paths are production-stripped differently

```typescript
if (ngDevMode) {
  prependTokenToDependencyPath(error, token);
  // ...
} else {
  throw new RuntimeError(errorCode, null);  // null message
}
```

In production builds, Angular throws a new `RuntimeError` with `null` as the message rather than propagating the dev-mode error with the token path. This means the error object type can change between dev and prod — something to be aware of when writing custom error handlers.

### 4. `useExisting` doesn't cache at registration time

The factory for `useExisting` is:
```typescript
factory = (_, flags) => ɵɵinject(resolveForwardRef(provider.useExisting), flags)
```
It calls `ɵɵinject()` every time the factory is invoked. Since `hydrate()` caches the result in `record.value`, the factory is only called once. But the alias is resolved dynamically through the full injection pipeline — including respecting the `@Optional` flag.

### 5. The `CIRCULAR` guard covers the multi-step pattern

The assignment `record.value = CIRCULAR` happens *before* `record.factory()` is called. The factory runs synchronously (injection is always synchronous), so if `factory()` calls `inject(SameToken)`, it hits the `CIRCULAR` check immediately. There's no `Set<token>` tracking visited tokens — just the sentinel value on the record itself.

---

## File Index Summary

| File | Role | Key Exports |
|------|------|-------------|
| `primitives/di/src/injector.ts` | Context tracking | `_currentInjector`, `setCurrentInjector()` |
| `di/injection_token.ts` | Token definition | `InjectionToken<T>` |
| `di/interface/defs.ts` | Injectable metadata | `ɵɵdefineInjectable()`, `ɵɵInjectableDeclaration` |
| `di/interface/provider.ts` | Provider types | `Provider`, all `*Provider` interfaces |
| `di/inject_switch.ts` | Context dispatch | `_injectImplementation`, limp mode |
| `di/injector_compatibility.ts` | Public inject API | `ɵɵinject()`, `injectInjectorOnly()` |
| `di/r3_injector.ts` | Core engine | `R3Injector`, `EnvironmentInjector`, `Record<T>` |
| `di/null_injector.ts` | Hierarchy root | `NullInjector` |
| `di/injector.ts` | Public API class | `Injector` abstract class |
| `di/contextual.ts` | Context utilities | `runInInjectionContext()`, `isInInjectionContext()` |

---

## Open Questions for Follow-Up Research

1. **NodeInjector** (`packages/core/src/render3/node_injector.ts`): How exactly does `directiveInject` walk the component tree? There should be a `TNode`-based lookup separate from `R3Injector`.
2. **Signal integration**: The `setActiveConsumer(null)` call in `hydrate()` disables the reactive signal consumer during DI — why? What would happen if we left it enabled?
3. **`INJECTOR_DEF_TYPES`**: The injector collects these at construction. How does this relate to `NgModule` imports being processed?
4. **`couldBeInjectableType`**: This is a guard function used before calling `getInjectableDef`. What types does it rule out?

<!-- RESEARCH_COMPLETE -->
