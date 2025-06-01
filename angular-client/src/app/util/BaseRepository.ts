
// import all interfaces
import { IWrite } from './interfaces/IWrite';
import { IRead, RelationParam } from './interfaces/IRead';
import { ResultType, Schema } from '@rocicorp/zero';
import { Observable } from 'rxjs';

/**
 * BaseRepository class that implements IWrite and IRead interfaces.
 * This class provides a skeleton for repository operations such as create, update, delete, and find.
 * It is designed to be extended by specific repositories for different data types.
 */
export abstract class BaseRepository<TReturn, TSchema extends Schema, TTable extends keyof TSchema['tables'] & string> implements IWrite<TReturn>, IRead<TReturn, TSchema, TTable> {
    create(item: TReturn): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(item: TReturn): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    upsert(item: TReturn): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchCreate(items: TReturn[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchUpdate(items: TReturn[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchDelete(items: TReturn[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchUpsert(items: TReturn[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchDeleteByID(ids: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(item: TReturn): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    find<E extends Error>(queryParams: Record<string, string>, relations?: RelationParam<TSchema, TTable>[], orderBy?: Record<string, string>, limit?: 0 ): Observable<TReturn[] | E> {
        throw new Error("Method not implemented.");
    }
    findOne<E>(id: string, resultTypes: ResultType[]): Observable<TReturn | E> {
        throw new Error("Method not implemented.");
    }
}
