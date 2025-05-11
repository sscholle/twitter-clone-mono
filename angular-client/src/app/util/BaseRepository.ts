
// import all interfaces
import { IWrite } from './interfaces/IWrite';
import { IRead, RelationParam } from './interfaces/IRead';
import { Schema } from '@rocicorp/zero';

// that class only can be extended
export abstract class BaseRepository<T, S extends Schema> implements IWrite<T>, IRead<T> {
    create(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(id: string, item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    find(queryParams: Record<string, string>, relations?: RelationParam<S>[], orderBy?: Record<string, string>, limit?: 0 ): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    findOne(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
}
