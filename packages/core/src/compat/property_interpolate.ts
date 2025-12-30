import {ɵɵproperty} from '../render3/instructions/property';
import {ɵɵinterpolate, ɵɵinterpolate1} from '../render3/instructions/value_interpolation';

/**
 * For ng15 and ng17 backward ABI compatibility
 */
export const ɵɵpropertyInterpolate = (propName: string, v0: any) => {
  return ɵɵproperty(propName, ɵɵinterpolate(v0));
};

/**
 * For ng15 and ng17 backward ABI compatibility
 */
export const ɵɵpropertyInterpolate1 = (propName: string, prefix: string, v0: any, suffix = '') => {
  return ɵɵproperty(propName, ɵɵinterpolate1(prefix, v0, suffix));
};