export const timerUpdateHandler = (setTimer, qrCodeRef) => {
  try {
    console.log(qrCodeRef);
    if (!qrCodeRef.current) return;

    const { hr, min, sec } = qrCodeRef.current.timer;

    const obj = {
      hr,
      min,
      sec
    };

    if (sec === 0) {
      if (min > 0) {
        obj.min -= 1;
        obj.sec = 59;
      }

      if (min === 0 && hr > 0) {
        obj.hr -= 1;
        obj.min = 59;
        obj.sec = 59;
      }
    } else {
      obj.sec -= 1;
    }

    console.log(obj);
    qrCodeRef.current.timer = obj;

    setTimer(() => obj);
  } catch (e) {
    console.log('Error', e);
  }
};
