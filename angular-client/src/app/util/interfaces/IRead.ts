import { Query, Schema } from "@rocicorp/zero";

export interface RelationParam<S extends Schema> {
  table: string;
  // cb: (query: Query<S, DestTableName<string, S, any>, DestRow<string, S, any>>) => Query<S, string>;
  cb: (query: Query<S, string>) => Query<S, string>;
}

export interface IRead<T> {
    find(queryParams: Record<string, string>, relations: RelationParam<any>[], orderBy: Record<string, string>, limit: 0 ): Promise<T[]>;
    findOne(id: string): Promise<T>;
  }
