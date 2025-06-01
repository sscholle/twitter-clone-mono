export interface IWrite<TReturn> {
    create(item: TReturn): Promise<boolean>;
    update(item: TReturn): Promise<boolean>;
    delete(item: TReturn): Promise<boolean>;
  }
