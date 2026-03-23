import { createAuth } from "../auth";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { DataModel } from "../_generated/dataModel";

export const auth = createAuth({} as GenericCtx<DataModel>);