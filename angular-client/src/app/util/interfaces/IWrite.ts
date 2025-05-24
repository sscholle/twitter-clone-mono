export interface IWrite<T> {
    create(item: T): Promise<boolean>;
    update(item: T): Promise<boolean>;
    delete(item: T): Promise<boolean>;
  }
