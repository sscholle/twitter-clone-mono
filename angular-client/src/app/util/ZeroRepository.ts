import { Query, ResultType, Row, Schema, SimpleOperator, TableMutator, TableSchema, TTL, Zero } from "@rocicorp/zero";
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
export class ItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemNotFoundError";
    Object.setPrototypeOf(this, ItemNotFoundError.prototype);
  }
}

type ParamValueType = string | number | boolean | Date | null | undefined;
type ParamType = ParamValueType | ParamValueType[] | Record<string, ParamValueType> | Record<string, ParamValueType[]>;
// type SimpleOperator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "in" | "not in" | "like" | "not like" | "contains" | "not contains" | "starts with" | "ends with";
// type ParamValue = [SimpleOperator, ParamValueType] | ParamValueType;
type ParamValue = [SimpleOperator, ParamType] | ParamType;

export interface QueryConfig<TSchema extends Schema, TReturn extends Row<TableSchema>, TTable extends keyof TSchema['tables'] & string> {
  queryParams: Record<string, ParamValue>;
  relations?: RelationParam<TSchema, TTable>[];
  orderBy?: Record<string, string>;
  pageSize?: number;
  startRecord?: Partial<TReturn>
}

export class ZeroRepository<TSchema extends Schema, TTable extends keyof TSchema['tables'] & string, TReturn extends Row<TableSchema>> extends BaseRepository<TReturn, TSchema, TTable> {
  private zeroService = inject(ZeroService<TSchema>);
  private query = inject(QueryService);
  private z = this.zeroService.getZero() as Zero<TSchema>;

  constructor(
    private collectionName: TTable,
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

  mapItemToIdField(item: TReturn): Record<string, string> {
    const idField = this.idField.reduce((acc, field) => {
      acc[field] = item[field];
      return acc;
    }, {} as Record<string, string>);
    return idField;
  }

  baseQuery: Query<TSchema, TTable>;
  baseMutate: TableMutator<TSchema["tables"][TTable]>;
  override create(item: TReturn): Promise<boolean> {
    return new Promise((resolve) => {
      this.baseMutate.insert({ ...item, ...this.mapItemToIdField(item) } as any)
      .then(() => {
        console.log("Item created successfully:", item);
        resolve(true);
      }).catch((error) => {
        console.error("Error creating item:", error);
        resolve(false);
      });
    });
  }

  override update(item: Partial<TReturn>): Promise<boolean> {
    return new Promise((resolve) => {
      this.baseMutate.update({ ...item, ...this.mapItemToIdField(item as TReturn) } as any)
      .then(() => {
        console.log("Item updated successfully:", item);
        resolve(true);
      }).catch((error) => {
        console.error("Error updating item:", error);
        resolve(false);
      });
    });
  }

  override upsert(item: Partial<TReturn>): Promise<boolean> {
    return new Promise((resolve) => {
      this.baseMutate.upsert({ ...item, ...this.mapItemToIdField(item as TReturn) } as any)
      .then(() => {
        console.log("Item upserted successfully:", item);
        resolve(true);
      }).catch((error) => {
        console.error("Error upserting item:", error);
        resolve(false);
      });
    });
  }
  override batchCreate(items: TReturn[]): Promise<boolean> {
    return new Promise((resolve) => {
      this.z.mutateBatch(
        (tx) => {
          items.forEach((item) => {
            tx[this.collectionName].insert({ ...item, ...this.mapItemToIdField(item) } as any);
          });
        }
      ).then(() => {
        console.log("Batch create successful:", items);
        resolve(true);
      }).catch((error) => {
        console.error("Error batch creating items:", error);
        resolve(false);
      });
    });
  }
  override batchUpdate(items: TReturn[]): Promise<boolean> {
    return new Promise((resolve) => {
      this.z.mutateBatch(
        (tx) => {
          items.forEach((item) => {
            tx[this.collectionName].update({ ...item, ...this.mapItemToIdField(item as TReturn) } as any);
          });
        }
      ).then(() => {
        console.log("Batch update successful:", items);
        resolve(true);
      }).catch((error) => {
        console.error("Error batch updating items:", error);
        resolve(false);
      });
    });
  }
  override batchDelete(items: TReturn[]): Promise<boolean> {
    return new Promise((resolve) => {
      this.z.mutateBatch(
        (tx) => {
          items.forEach((item) => {
            tx[this.collectionName].delete({ ...item, ...this.mapItemToIdField(item as TReturn) } as any);
          });
        }
      ).then(() => {
        console.log("Batch delete successful:", items);
        resolve(true);
      }).catch((error) => {
        console.error("Error batch deleting items:", error);
        resolve(false);
      });
    });
  }
  override batchUpsert(items: Partial<TReturn>[]): Promise<boolean> {
    console.log("batchUpsert", items);
    return new Promise((resolve) => {
      if(items.length === 0) {
        resolve(true);
        return;
      }
      this.z.mutateBatch(
        (tx) => {
          items.forEach((item) => {
            tx[this.collectionName].upsert({ ...item, ...this.mapItemToIdField(item as TReturn) } as any);
          });
        }
      ).then(() => {
        console.log("Batch upsert successful:", items);
        resolve(true);
      }).catch((error) => {
        console.error("Error batch upserting items:", error);
        resolve(false);
      });
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

  override delete(item: TReturn): Promise<boolean> {
    return new Promise((resolve) => {
      this.baseMutate.delete({ ...this.mapItemToIdField(item) } as any)
      .then(() => {
        console.log("Item deleted successfully:", item);
        resolve(true);
      }).catch((error) => {
        console.error("Error deleting item:", error);
        resolve(false);
      });
    });
  }

  override find<E extends Error = Error>(
    queryParams: Record<string, ParamValue> = {},
    relations?: RelationParam<TSchema, TTable>[],
    orderBy?: Record<string, string>,
    limit?: number,
    start?: Partial<TReturn>,
    resultTypes: string[] = ["unknown", "complete"],
    ttl: TTL = '10s'
  ): Observable<TReturn[]> {
    try {
      const find = this.generateQueryObject(queryParams, relations, orderBy, limit, start);
      return this.query.useQuery<TSchema, TTable, TReturn>(find, { ttl })
        .pipe(
          filter(([result, resultType]) => {
            // return resultType.type === "complete";
            return resultTypes.includes(resultType.type);// resultType.type === "complete";
          }),
          map(([result, resultType]) => {
            console.log("find result", result, "resultType", resultType);
            return result as TReturn[];
          })
        )
    }
    catch (error) {
      console.error("Error finding item:", error);
      // resolve(new ItemNotFoundError("Item not found or query failed") as E);
      // resolve(error as E);
      return new Observable<TReturn[]>((subscriber) => {
        subscriber.error(new ItemNotFoundError("Item not found or query failed") as E);
      });
    }
  }

  /**
   * Should only be used where there is a single ID field.
   * If you have a composite key, use findSubscribe with a query object.
   * @param id
   * @param resultTypes
   * @returns
   */
  override findOne(
    id: string,
    resultTypes: string[] = ["unknown", "complete"],
    ttl: TTL = '1m'
  ): Observable<TReturn> {
    return this.query.useQuery(
      this.baseQuery
      .where(this.idField[0] as any, id as any)
      .one(),
      { ttl } // Set TTL for the query
    )
    .pipe(
      filter(([result, resultType]) => {
        // return resultType.type === "complete";
        return resultTypes.includes(resultType.type);// resultType.type === "complete";
      }),
      map(([result, resultType]) => {
        console.log("findOne result", result, "resultType", resultType);
        if (result) {
          return result as unknown as TReturn;
        } else {
          // TODO: return error types...
          return null as unknown as TReturn;
          // throw new ItemNotFoundError(`Item with ID ${id} not found`);
        }
      })
    )
  }

  // #region CUSTOM QUERIES
  findSubscribe(
    queryParams: Record<string, ParamValue> = {},
    relations?: RelationParam<TSchema, TTable>[],
    orderBy?: Record<string, string>,
    limit?: number,
    start?: Partial<TReturn>,
    resultTypes: ResultType[] = ["unknown", "complete"],
    ttl: TTL = '1m'
  ): Observable<TReturn[]> {
    console.log("findSubscribe", this.collectionName, queryParams, relations, orderBy, limit, start);
    try {
      const find = this.generateQueryObject(queryParams, relations, orderBy, limit, start);
      return this.query.useQuery(find, { ttl })
        .pipe(
          filter(([result, resultType]) => {
            // console.log("resultType", resultType);
            // return resultType.type === "complete";
            return resultTypes.includes(resultType.type);// resultType.type === "complete";
          }),
          map(([result, type]) => {
            return result as TReturn[];
          })
        );
    } catch (error) {
      console.error("Error finding item:", error);
      return new Observable<TReturn[]>((subscriber) => {
        subscriber.error(new ItemNotFoundError("Item not found or query failed"));
      });
    }
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
  generateQueryObject(queryParams: Record<string, ParamValue>, relations?: RelationParam<TSchema, TTable>[], orderBy?: Record<string, string>, limit?: number, start?: Partial<TReturn>): Query<TSchema, TTable, TReturn> {
    let find = this.baseQuery as Query<TSchema, TTable, TReturn>;
    relations?.forEach((relation) => {
      // find = find.related(relation.table, (query) => relation.cb(query as Query<TSchema, TTable>));

      find = find.related(relation.table as TTable, (query) => relation.cb(query as Query<TSchema, TTable>)) as unknown as Query<TSchema, TTable, TReturn>;
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

  destroyZero() {
    console.log("Destroying ZeroRepository for collection:", this.collectionName);
    this.z.close(); // Close the Zero instance
    this.z = null as any; // Clear the Zero instance
    this.baseQuery = null as any; // Clear the base query
    this.baseMutate = null as any; // Clear the base mutator
  }
}
