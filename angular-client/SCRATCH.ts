
type ParamValueType = string | number | boolean | Date | null | undefined;
type ParamType = ParamValueType | ParamValueType[] | Record<string, ParamValueType> | Record<string, ParamValueType[]>;
type ParamValue = [SimpleOperator, ParamType] | ParamType;

export interface RelationParam<S extends Schema> {
  table: string;
  cb: (query: Query<S, string>) => Query<S, string>;
}

export interface QueryConfig<S extends Schema, T extends Row<TableSchema>> {
  queryParams: Record<string, ParamValue>;
  relations?: RelationParam<S>[];
  orderBy?: Record<string, string>;
  pageSize?: number;
  startRecord?: Partial<T>
}

export function getMessages<S extends Schema, T extends Row<TableSchema>>(queryObject: QueryConfig<S, T>) {
  return find(
    queryObject.queryParams,
    queryObject.relations,
    queryObject.orderBy,
    queryObject.pageSize,
    queryObject.startRecord
  );
}

function find<S extends Schema, T extends Row<TableSchema>>(
    queryParams: Record<string, ParamValue> = {},
    relations?: RelationParam<S>[],
    orderBy?: Record<string, string>,
    limit?: number,
    start?: Partial<T>,
    resultTypes: string[] = ["unknown", "complete"]
  ): Promise<T[]> {
    return new Promise((resolve) => {
      try {
        const find = generateQueryObject(queryParams, relations, orderBy, limit, start);
        zeroQuery.useQuery(find)
          .pipe(
            filter(([result, resultType]) => {
              return resultType.type === "complete";
              // return resultTypes.includes(resultType.type);
            })
          ).subscribe(([result, resultType]) => {
            resolve(result as T[]);
          });
      }
      catch (error) {
        console.error("Error finding item:", error);
        resolve([] as T[]);
      }
    });
  }
