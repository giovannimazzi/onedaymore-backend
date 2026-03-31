function logger(req, res, next) {
  if (process.env.APP_MODE === "dev") {
    const now = new Date();

    const fullYear =
      now.getFullYear() < 10 ? "0" + now.getFullYear() : now.getFullYear();
    const month =
      now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
    const date = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

    const hours = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
    const minutes =
      now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
    const seconds =
      now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();

    const actualDate = `${fullYear}/${month}/${date}`;
    const actualTime = `${hours}:${minutes}:${seconds}`;
    const reqInfos = `${req.method} ${req.url}`;

    console.log(`[INFO]: ${actualDate} ${actualTime} - ${reqInfos}`);
  }
  next();
}

module.exports = logger;
