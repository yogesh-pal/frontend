export const fieldHandler = (fieldArr, jsonForm) => {
  try {
    const tempJson = jsonForm;
    fieldArr.forEach((item) => {
      const inputIndex = tempJson?.input?.findIndex(
        (inputValue) => inputValue?.name === item?.name
      );
      if (inputIndex >= 0) {
        if (item?.condition) {
          tempJson.input[inputIndex].condition[item?.condition] = item?.value;
        }
      }
    });
    return tempJson;
  } catch (e) {
    console.log(e);
  }
};
