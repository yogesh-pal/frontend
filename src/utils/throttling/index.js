export const throttleFunction = (argument, loaderRef, setIsButtonDisabled) => {
  let seconds = 0;
  setIsButtonDisabled(true);
  const intervalAddress = setInterval(() => {
    seconds += 1;
    if (seconds >= 1 && !loaderRef.current) {
      setIsButtonDisabled(false);
      clearInterval(intervalAddress);
    }
  }, 1000);
  argument.function1(...argument.args1);
  if (argument.args2 && argument.function2) {
    argument.function2(...argument.args2);
  }
};
