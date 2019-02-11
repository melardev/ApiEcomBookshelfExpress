exports.benchmark = (req, res, next) => {
    /*
      res.on('finish', function() {
        logger.info('API request.', {
            module: 'core'
            data  : {
                req: {
                    method: req.method,
                    url   : req.url,
                    ip    : req.ip
                },
                res: {
                    status_code: res.statusCode // Always 200 and not the really one.
                }
            }
        });
    });

     */
    const startTime = new Date().getTime();
    next();
    const elapsed = (new Date().getTime() - startTime) / 1000;
    res.set('X-Perf-Time', elapsed);
};