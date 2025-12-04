const check = (_, res) => {
    res.status(200).json({ status: "ok", message: "Healthcheck passed" });
};

export { check };
