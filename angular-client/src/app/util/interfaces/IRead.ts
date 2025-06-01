import { Query, ResultType, Schema } from "@rocicorp/zero";
import { Observable } from "rxjs";

export interface RelationParam<S extends Schema, TTable extends keyof S['tables'] & string> {
  table: keyof S['relationships'][TTable] & string;
  // cb: (query: Query<S, DestTableName<string, S, any>, DestRow<string, S, any>>) => Query<S, string>;
  cb: (query: Query<S, string>) => Query<S, keyof S['tables'] & string>;
}

export interface IRead<TReturn, TSchema extends Schema, TTable extends keyof TSchema['tables'] & string> {
    find<E extends Error>(queryParams: Record<string, string>, relations: RelationParam<TSchema, TTable>[], orderBy: Record<string, string>, limit: 0 ): Observable<TReturn[] | E>;
    /**
     * @todo - consider using a query config object instead of multiple parameters.
     * @todo - implement Error handling for not found cases.
     * @param id - The ID of the item to find.
     * @returns A promise that resolves to the found item or an error if not found.
     */
    findOne<E extends Error | void>(id: string, resultType: ResultType[]): Observable<TReturn | E>;
  }
