import { Query, Schema } from "@rocicorp/zero";

export interface RelationParam<S extends Schema> {
  table: string;
  // cb: (query: Query<S, DestTableName<string, S, any>, DestRow<string, S, any>>) => Query<S, string>;
  cb: (query: Query<S, string>) => Query<S, string>;
}

export interface IRead<T> {
    find<E extends Error | void>(queryParams: Record<string, string>, relations: RelationParam<any>[], orderBy: Record<string, string>, limit: 0 ): Promise<T[] | E>;
    /**
     * @todo - consider using a query config object instead of multiple parameters.
     * @todo - implement Error handling for not found cases.
     * @param id - The ID of the item to find.
     * @returns A promise that resolves to the found item or an error if not found.
     */
    findOne<E extends Error | void>(id: string): Promise<T | E>;
  }
