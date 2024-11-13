export const resetHandler = (resetArr, setValues) => {
  try {
    resetArr.forEach((item) => {
      setValues(item, '');
    });
  } catch (e) {
    console.log(e);
  }
};
