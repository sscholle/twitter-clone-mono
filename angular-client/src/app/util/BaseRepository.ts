
// import all interfaces
import { IWrite } from './interfaces/IWrite';
import { IRead, RelationParam } from './interfaces/IRead';
import { Schema } from '@rocicorp/zero';

// that class only can be extended
export abstract class BaseRepository<T, S extends Schema> implements IWrite<T>, IRead<T> {
    create(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    upsert(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchCreate(items: T[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchUpdate(items: T[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchDelete(items: T[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchUpsert(items: T[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    batchDeleteByID(ids: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    find(queryParams: Record<string, string>, relations?: RelationParam<S>[], orderBy?: Record<string, string>, limit?: 0 ): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    findOne(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
}
