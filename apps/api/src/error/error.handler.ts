import type { ErrorFactory } from './error.factory.js';
import type {
  AsyncResultContract,
  ErrorHandlerContract,
  ResultContract,
} from './result.contract.d.js';

export class OkResult<T, E extends Error> implements ResultContract<T, E> {
  public constructor(readonly value: T) {}

  public isOk(): boolean {
    return true;
  }

  public isErr(): boolean {
    return false;
  }

  public map<U>(fn: (value: T) => U): ResultContract<U, E> {
    return new OkResult<U, E>(fn(this.value));
  }

  public andThen<U>(fn: (value: T) => ResultContract<U, E>): ResultContract<U, E> {
    return fn(this.value);
  }

  public mapErr<F extends Error>(_: (error: E) => F): ResultContract<T, F> {
    return new OkResult<T, F>(this.value);
  }

  public match<R>(onOk: (value: T) => R, _: (error: E) => R): R {
    return onOk(this.value);
  }
}

export class ErrResult<T, E extends Error> implements ResultContract<T, E> {
  public constructor(readonly error: E) {}

  public isOk(): boolean {
    return false;
  }

  public isErr(): boolean {
    return true;
  }

  public map<U>(_: (value: T) => U): ResultContract<U, E> {
    return new ErrResult<U, E>(this.error);
  }

  public andThen<U>(_: (value: T) => ResultContract<U, E>): ResultContract<U, E> {
    return new ErrResult<U, E>(this.error);
  }

  public mapErr<F extends Error>(fn: (error: E) => F): ResultContract<T, F> {
    return new ErrResult<T, F>(fn(this.error));
  }

  public match<R>(_: (value: T) => R, onErr: (error: E) => R): R {
    return onErr(this.error);
  }
}

export class AsyncResultImpl<T, E extends Error> implements AsyncResultContract<T, E> {
  constructor(private readonly operation: Promise<ResultContract<T, E>>) {}

  public map<U>(fn: (value: T) => U): AsyncResultContract<U, E> {
    const nextOperation: Promise<ResultContract<U, E>> = this.operation.then((result) =>
      result.map(fn),
    );

    return new AsyncResultImpl<U, E>(nextOperation);
  }

  public andThen<U>(fn: (value: T) => AsyncResultContract<U, E>): AsyncResultContract<U, E> {
    const nextOperation: Promise<ResultContract<U, E>> = this.operation.then((result) =>
      result.match<Promise<ResultContract<U, E>>>(
        (value) => fn(value).toPromise(),
        (error) => Promise.resolve(new ErrResult<U, E>(error)),
      ),
    );

    return new AsyncResultImpl<U, E>(nextOperation);
  }

  public mapErr<F extends Error>(fn: (error: E) => F): AsyncResultContract<T, F> {
    const nextOperation: Promise<ResultContract<T, F>> = this.operation.then((result) =>
      result.mapErr(fn),
    );

    return new AsyncResultImpl<T, F>(nextOperation);
  }

  public match<R>(
    onOk: (value: T) => R | Promise<R>,
    onErr: (error: E) => R | Promise<R>,
  ): Promise<R> {
    return this.operation.then((result) => result.match(onOk, onErr));
  }

  public toPromise(): Promise<ResultContract<T, E>> {
    return this.operation;
  }
}

export class DefaultErrorHandler implements ErrorHandlerContract {
  constructor(private readonly errorFactory: ErrorFactory) {}

  public normalize(value: unknown): Error {
    if (value instanceof Error) {
      return value;
    }

    if (typeof value === 'string') {
      return this.errorFactory(value);
    }

    try {
      const serialized = JSON.stringify(value);

      return this.errorFactory(serialized || String(value));
    } catch {
      return this.errorFactory(String(value));
    }
  }

  public ok<T>(value: T): ResultContract<T, Error> {
    return new OkResult<T, Error>(value);
  }

  public err<T, E extends Error>(error: E): ResultContract<T, E> {
    return new ErrResult<T, E>(error);
  }

  public okAsync<T>(value: T): AsyncResultContract<T, Error> {
    return new AsyncResultImpl<T, Error>(Promise.resolve(new OkResult<T, Error>(value)));
  }

  public errAsync<T, E extends Error>(error: E): AsyncResultContract<T, E> {
    return new AsyncResultImpl<T, E>(Promise.resolve(new ErrResult<T, E>(error)));
  }

  public fromPromise<T>(fn: () => Promise<T>): AsyncResultContract<T, Error> {
    const operation: Promise<ResultContract<T, Error>> = Promise.resolve()
      .then(fn)
      .then<ResultContract<T, Error>>((value) => new OkResult<T, Error>(value))
      .catch<ResultContract<T, Error>>((cause: unknown) => {
        return new ErrResult<T, Error>(this.normalize(cause));
      });

    return new AsyncResultImpl<T, Error>(operation);
  }

  public fromResult<T, E extends Error>(result: ResultContract<T, E>): AsyncResultContract<T, E> {
    return new AsyncResultImpl<T, E>(Promise.resolve(result));
  }
}
