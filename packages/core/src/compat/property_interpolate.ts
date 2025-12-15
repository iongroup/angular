import {ɵɵproperty} from '../render3/instructions/property';
import {ɵɵinterpolate} from '../render3/instructions/value_interpolation';

/**
 * For ng15 and ng17 backward ABI compatibility
 */
export const ɵɵpropertyInterpolate = (propName: string, v0: any) => {
  return ɵɵproperty(propName, ɵɵinterpolate(v0));
};
