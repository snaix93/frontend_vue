import { resetBackendValidationErrors } from '@/use/useBackendValidation';

export function useToggle(stateKey) {
  resetBackendValidationErrors();
  return (state, value = null) => {
    if (value?.target) value = null;
    state[stateKey] = value !== null ? value : ! state[stateKey];
  };
}


