export const sleep = (secs = 0) =>
  new Promise((res) =>
    setTimeout(() => {
      res(true);
    }, secs * 1000)
  );