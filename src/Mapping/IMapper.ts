import { IMappingSchema } from "./IMapping";

export interface IMapper {
    DoMapping<IN, OUT> (inputObject: IN, schema: IMappingSchema): OUT[];
}