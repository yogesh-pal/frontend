import { cloneDeep } from 'lodash';
import { resetHandler } from './resetFields';
import { fieldHandler } from './hideFields';
import { disableFieldHandler } from './disableFormFields';

export const formBackHandler = (formDetails, step, setValue, unregister) => {
  try {
    const tempForm = formDetails[step];
    let onBackJSON = tempForm?.onBack;
    if (tempForm?.onBack?.dynamicHandler) {
      onBackJSON = tempForm.onBack.dynamicHandler(unregister, formDetails, setValue);
    }
    if (onBackJSON?.reset) {
      if (onBackJSON?.reset?.currentForm) {
        resetHandler(onBackJSON?.reset?.currentForm, setValue);
      }
    }
    if (onBackJSON?.condition) {
      if (onBackJSON?.condition?.currentForm) {
        fieldHandler(onBackJSON?.condition?.currentForm, tempForm);
      }
    }
    if (onBackJSON?.disable) {
      disableFieldHandler(
        onBackJSON?.disable?.disableFields,
        onBackJSON?.disable?.value,
        tempForm
      );
    }
    if (onBackJSON?.status) {
      const currentFormStatus = onBackJSON?.status?.currentForm;
      if (currentFormStatus) {
        currentFormStatus.forEach((item) => {
          const inputIndex = tempForm?.input?.findIndex(
            (inputValue) => inputValue?.name === item?.name
          );
          if (inputIndex >= 0) {
            tempForm.input[inputIndex].status = item?.status;
          }
        });
      }
    }
    if (onBackJSON?.resetAdditionalForm && tempForm?.input) {
      const newFormInputToSet = tempForm.input.filter((ele) => !ele?.name.includes('__'));
      tempForm.input = newFormInputToSet;
    }
    if (onBackJSON?.resetFieldValidation) {
      Object.keys(onBackJSON?.resetFieldValidation).forEach((item) => {
        const newFieldValidationIndex = tempForm.input.findIndex((ele) => ele?.name === item);
        if (newFieldValidationIndex !== -1) {
          const validationOBJ = cloneDeep(onBackJSON?.resetFieldValidation[item]);
          tempForm.input[newFieldValidationIndex] = {
            ...tempForm.input[newFieldValidationIndex],
            // validation: tempForm?.onBack?.resetFieldValidation[item]
            validation: validationOBJ
          };
        }
      });
    }
    if (onBackJSON?.unregisterFields) {
      unregister(onBackJSON.unregisterFields);
    }
  } catch (e) {
    console.log('Error', e);
  }
};
