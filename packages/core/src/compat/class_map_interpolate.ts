import { ɵɵclassMap } from "../render3/instructions/styling";
import { ɵɵinterpolate1 } from "../render3/instructions/value_interpolation";

export const ɵɵclassMapInterpolate1 = (prefix: string, v0: any, suffix = '') => {
  return ɵɵclassMap(ɵɵinterpolate1(prefix, v0, suffix) as string);
}