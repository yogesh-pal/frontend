export const updateFieldDetailsHandler = (fieldArr, jsonForm) => {
  try {
    const tempJson = jsonForm;
    fieldArr.forEach((item) => {
      const inputIndex = tempJson?.input?.findIndex(
        (inputValue) => inputValue?.name === item?.name
      );
      if (inputIndex >= 0) {
        tempJson.input[inputIndex][item?.key] = item?.value;
      }
    });
    return tempJson;
  } catch (e) {
    console.log(e);
  }
};
