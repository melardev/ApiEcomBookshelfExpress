exports.parsePaginationParams = (req, res, next) => {
    req.page = parseInt(req.query.page) || 1;
    req.pageSize = parseInt(req.query.pageSize) || 5;
    next();
};