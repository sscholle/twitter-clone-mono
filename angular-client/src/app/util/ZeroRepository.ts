import { Query, Row, Schema, SimpleOperator, TableMutator, TableSchema, Zero } from "@rocicorp/zero";
import { BaseRepository } from "./BaseRepository";
import { QueryService, ZeroService } from "zero-angular";
import { filter, map, Observable } from "rxjs";
import { inject } from "@angular/core";
import { RelationParam } from "./interfaces/IRead";

/**
 * Look at Implementing Custom Error Types in TypeScript for a better way to handle errors.
 * https://www.typescriptlang.org/docs/handbook/2/classes.html#implementing-custom-error-types-in-typescript
 */
// import { ItemNotFoundError } from "./ItemNotFoundError";
// class ItemNotFoundError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = "ItemNotFoundError";
//     Object.setPrototypeOf(this, ItemNotFoundError.prototype);
//   }
// }

type ParamValueType = string | number | boolean | Date | null | undefined;
type ParamType = ParamValueType | ParamValueType[] | Record<string, ParamValueType> | Record<string, ParamValueType[]>;
// type SimpleOperator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "in" | "not in" | "like" | "not like" | "contains" | "not contains" | "starts with" | "ends with";
// type ParamValue = [SimpleOperator, ParamValueType] | ParamValueType;
type ParamValue = [SimpleOperator, ParamType] | ParamType;

export interface QueryConfig<S extends Schema, T extends Row<TableSchema>> {
  queryParams: Record<string, ParamValue>;
  relations?: RelationParam<S>[];
  orderBy?: Record<string, string>;
  pageSize?: number;
  startRecord?: Partial<T>
}

export class ZeroRepository<S extends Schema, T extends Row<TableSchema>> extends BaseRepository<T, S> {
  private zeroService = inject(ZeroService<S>);
  private query = inject(QueryService);
  private z = this.zeroService.getZero() as Zero<S>;

  constructor(
    private collectionName: string,
    /**
     * Bridge Tables would have multiple ID fields, e.g. Follower has userID and followerID.
     * For a single ID field, you can just use ["id"].
     * For a composite key, you can use ["userID", "followerID"].
     */
    private idField: string[] = ["id"],
  ) {
    super();
    this.baseQuery = this.z.query[this.collectionName];
    this.baseMutate = this.z.mutate[this.collectionName];
  }

  mapItemToIdField(item: T): Record<string, string> {
    const idField = this.idField.reduce((acc, field) => {
      acc[field] = item[field];
      return acc;
    }, {} as Record<string, string>);
    return idField;
  }

  baseQuery: Query<S, string>;
  baseMutate: TableMutator<S["tables"][string]>;
  override create(item: T): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.baseMutate.insert({ ...item, ...this.mapItemToIdField(item) } as any);
        resolve(true);
      }
      catch (error) {
        console.error("Error creating item:", error);
        resolve(false);
      }
    });
  }

  override update(item: Partial<T>): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.baseMutate.update({ ...item, ...this.mapItemToIdField(item as T) } as any);
        resolve(true);
      }
      catch (error) {
        console.error("Error updating item:", error);
        resolve(false);
      }
    });
  }

  override upsert(item: Partial<T>): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        console.log("upsert", item);
        this.baseMutate.upsert({ ...item, ...this.mapItemToIdField(item as T) } as any);
        resolve(true);
      }
      catch (error) {
        console.error("Error upserting item:", error);
        resolve(false);
      }
    });
  }
  override batchCreate(items: T[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.z.mutateBatch(
          (tx) => {
            items.forEach((item) => {
              tx[this.collectionName].insert({ ...item, ...this.mapItemToIdField(item) } as any);
            });
          }
        )
        resolve(true);
      }
      catch (error) {
        console.error("Error batch creating items:", error);
        resolve(false);
      }
    });
  }
  override batchUpdate(items: T[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.z.mutateBatch(
          (tx) => {
            items.forEach((item) => {
              tx[this.collectionName].update({ ...item, ...this.mapItemToIdField(item as T) } as any);
            });
          }
        )
        resolve(true);
      }
      catch (error) {
        console.error("Error batch updating items:", error);
        resolve(false);
      }
    });
  }
  override batchDelete(items: T[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.z.mutateBatch(
          (tx) => {
            items.forEach((item) => {
              tx[this.collectionName].delete({ ...item, ...this.mapItemToIdField(item as T) } as any);
            });
          }
        )
        resolve(true);
      }
      catch (error) {
        console.error("Error batch deleting items:", error);
        resolve(false);
      }
    });
  }
  override batchUpsert(items: Partial<T>[]): Promise<boolean> {
    console.log("batchUpsert", items);
    return new Promise((resolve) => {
      try {
        if(items.length === 0) {
          resolve(true);
          return;
        }
        this.z.mutateBatch(
          (tx) => {
            items.forEach((item) => {
              tx[this.collectionName].upsert({ ...item, ...this.mapItemToIdField(item as T) } as any);
            });
          }
        )
        resolve(true);
      }
      catch (error) {
        console.error("Error batch upserting items:", error);
        resolve(false);
      }
    });
  }
  // override batchDeleteByID(ids: string[]): Promise<boolean> {
  //   return new Promise((resolve) => {
  //     try {
  //       this.z.mutateBatch(
  //         (tx) => {
  //           ids.forEach((id) => {
  //             tx[this.collectionName].delete({ [this.idField]: id } as any);
  //           });
  //         }
  //       )
  //       resolve(true);
  //     }
  //     catch (error) {
  //       console.error("Error batch deleting items by ID:", error);
  //       resolve(false);
  //     }
  //   });
  // }

  override delete(item: T): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.baseMutate.delete({ ...this.mapItemToIdField(item) } as any);
        resolve(true);
      }
      catch (error) {
        console.error("Error deleting item:", error);
        resolve(false);
      }
    });
  }

  override find(
    queryParams: Record<string, ParamValue> = {},
    relations?: RelationParam<S>[],
    orderBy?: Record<string, string>,
    limit?: number,
    start?: Partial<T>,
    resultTypes: string[] = ["unknown", "complete"]
  ): Promise<T[]> {
    return new Promise((resolve) => {
      try {
        const find = this.generateQueryObject(queryParams, relations, orderBy, limit, start);
        this.query.useQuery(find)
          .pipe(
            filter(([result, resultType]) => {
              return resultTypes.includes(resultType.type);// resultType.type === "complete";
            })
          ).subscribe(([result, resultType]) => {
            resolve(result as T[]);
          });
      }
      catch (error) {
        console.error("Error finding item:", error);
        // resolve(new ItemNotFoundError("Item not found or query failed"));
        resolve([] as T[]);
      }
    });
  }

  override findOne(id: string): Promise<T> {
    return new Promise((resolve) => {
      try {
        this.query.useQuery(
          this.baseQuery.where(this.idField[0] as any, id as any).one()
        )
          .pipe(
            filter(([result, resultType]) => {
              console.log("resultType", resultType);
              return resultType.type === "complete";
            })
          ).subscribe(([result, resultType]) => {
            console.log("result", result);
            const data = result as unknown as T;
            resolve(data);
          });
      }
      catch (error) {
        console.error("Error finding item:", error);
        resolve({} as T);
      }
    });
  }

  // #region CUSTOM QUERIES
  findSubscribe(
    queryParams: Record<string, ParamValue> = {},
    relations?: RelationParam<S>[],
    orderBy?: Record<string, string>,
    limit?: number,
    start?: Partial<T>,
    resultTypes: string[] = ["unknown", "complete"]
  ): Observable<T[]> {
    const find = this.generateQueryObject(queryParams, relations, orderBy, limit, start);
    return this.query.useQuery(find)
      .pipe(
        filter(([result, resultType]) => {
          return resultTypes.includes(resultType.type);// resultType.type === "complete";
        }),
        map(([result, type]) => {
          return result as T[];
        })
      );
  }
  // #endregion CUSTOM QUERIES

  // #region UTILITY METHODS
  /**
   * Convert query parameters into a Zero Query object.
   * This method allows you to build a query object that can be used with Zero's query system.
   * It supports filtering, relations, ordering, limiting, and starting from a specific record.
   * @param queryParams
   * @param relations
   * @param orderBy
   * @param limit
   * @param start
   * @returns
   */
  generateQueryObject(queryParams: Record<string, ParamValue>, relations?: RelationParam<S>[], orderBy?: Record<string, string>, limit?: number, start?: Partial<T>): Query<S, string> {
    let find = this.baseQuery;
    relations?.forEach((relation) => {
      find = find.related(relation.table as any, (query) => relation.cb(query as Query<S, string>));
    });
    console.log("find", this.collectionName, queryParams, relations, orderBy, limit, start);
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key] as [SimpleOperator, any];
      if (value) {
        if (typeof value === "string")
          find = find.where(key as any, value as any);
        else if (Array.isArray(value))
          find = find.where(key as any, ...value);
      }
    });
    if (orderBy)
      Object.keys(orderBy).forEach((key) => {
        const value = orderBy[key];
        if (value) {
          find = find.orderBy(key as any, value as any);
        }
      });
    if (limit && limit > 0)
      find = find.limit(limit);
    if(start)
      find = find.start(start)
    return find;
  }
  // #endregion UTILITY METHODS
}
