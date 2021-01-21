import collect from 'collect.js';
import Vue from 'vue';

const errorHandlers = {
  422: response => {
    if (response.data.errors) {
      backendValidationErrors.errors = collect(response.data.errors).flatten().unique();
    } else {
      backendValidationErrors.errors = collect(response.data.message);
    }
  },
  403: response => {
    backendValidationErrors.errors = collect(response.data.message);
  },
};

////

const backendValidationErrors = Vue.observable({ errors: collect([]) });
const errorMessagesByCode = Vue.observable({ messages: null, default: null });
const hasExpectedError = response => Object.keys(errorHandlers)
                                           .map(code => +code)
                                           .includes(response?.status);
const customMessageForCode = response => errorMessagesByCode.messages?.[response?.status];
const hasCustomMessageForCode = response => !! customMessageForCode(response);
const setMessagesByCode = messages => errorMessagesByCode.messages = messages;
const setDefaultMessage = message => errorMessagesByCode.default = message;

const renderErrors = response => {
  if (hasCustomMessageForCode(response)) {
    backendValidationErrors.errors = collect(customMessageForCode(response));
    return;
  }

  const handler = errorHandlers?.[response?.status];
  if (handler) {
    handler(response);
  } else {
    backendValidationErrors.errors = collect(errorMessagesByCode?.default ?? []);
  }
};

/**
 * @return {Collection||boolean}
 */
export function getBackendValidationErrors() {
  return backendValidationErrors.errors;
}

/**
 * @param response
 * @param errorMessagesByCode
 * @param defaultMessage
 * @return {boolean}
 */
export function renderAnyErrors(response, errorMessagesByCode = null, defaultMessage = null) {
  if (hasExpectedError(response) || errorMessagesByCode !== null || defaultMessage !== null) {
    setMessagesByCode(errorMessagesByCode);
    setDefaultMessage(defaultMessage);
    renderErrors(response);
    return true;
  }

  return false;
}

export function resetBackendValidationErrors() {
  backendValidationErrors.errors = collect([]);
  errorMessagesByCode.messages = null;
  errorMessagesByCode.default = null;
}
