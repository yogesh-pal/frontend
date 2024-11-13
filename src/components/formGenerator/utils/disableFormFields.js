/* eslint-disable max-len */
export const disableFieldHandler = (disableArray, value, jsonForm) => {
  try {
    if (!disableArray.length) return;
    const tempForm = jsonForm;
    tempForm?.input?.forEach((item, index) => {
      if (disableArray.includes(item.name)) {
        tempForm.input[index].disabled = value;
        // if (tempForm?.input?.[index]?.validation?.isRequired) tempForm.input[index].validation.isRequired = false;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

export const disableFieldIfHaveValue = (disableArray, value, jsonForm, getValues) => {
  try {
    if (!disableArray.length) return;
    const tempForm = jsonForm;
    tempForm?.input?.forEach((item, index) => {
      if (disableArray.includes(item.name)) {
        if (getValues(item.name)) {
          tempForm.input[index].disabled = value;
          // if (tempForm?.input?.[index]?.validation?.isRequired) tempForm.input[index].validation.isRequired = false;
        } else {
          tempForm.input[index].disabled = false;
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};
