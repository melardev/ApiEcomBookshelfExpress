const _ = require('lodash');

const Product = require('./../config/db.config').Product;
const ProductTag = require('./../config/db.config').ProductTag;
const Tag = require('./../config/db.config').Tag;
const ProductImage = require('./../config/db.config').ProductImage;
const Category = require('./../config/db.config').Category;
const Comment = require('./../config/db.config').Comment;
const User = require('./../config/db.config').User;

const AppResponseDto = require('./../dtos/responses/app_response.dto');
const ProductRequestDto = require('./../dtos/requests/products.dto');
const ProductResponseDto = require('./../dtos/responses/products.dto');


exports.getAll = (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    Promise.all([
        Product.fetchPage({
            pageSize,
            page,
            columns: ['id', 'name', 'slug', 'price', 'created_at', 'updated_at'],
            withRelated: [
                /* // TODO: if I make this work I will not need to check againg the comment count per article as I did below
                {
                    'comments': function (queryBuilder) {
                        queryBuilder.column('comments.id')
                    }
                },
                */
                {
                    'tags': function (queryBuilder) {
                        // it is weird, for the id it says it is ambiguous, for name it does not
                        queryBuilder.column('tags.id', 'name');
                    }
                }, {
                    'categories': function (queryBuilder) {
                        queryBuilder.select('categories.id', 'name');
                    }
                }, 'images'
            ],
            debug: process.env.SHOW_SQL,
        }),
        Product.query().count('* as productsCount')
    ])
        .then(results => {
            const products = results[0].serialize();
            const productIds = products.map(product => product.id);
            const productsCount = results[1][0].productsCount;
            Comment.query(queryBuilder => {
                queryBuilder.where('product_id', 'in', productIds);
            }).fetchAll({
                columns: ['product_id']
            }).then(comments => {
                comments.serialize().forEach(comment => {
                    let productId = comment.product_id;
                    let product = products.find(product => product.id === productId);
                    if (product.comments_count == null)
                        product.comments_count = 0;
                    else
                        product.comments_count++;
                });
                return res.json(ProductResponseDto.buildPagedList(products, page, pageSize, productsCount, req.baseUrl));
            }).catch(err => {
                res.json(AppResponseDto.buildWithErrorMessages(err.message));
            });

        }).catch(err => {
        return res.status(400).send(err.message);
    });
};

exports.getByIdOrSlug = function (req, res, next) {
    Product.where(req.query).fetch({
        withRelated: [
            'comments', 'comments.user', 'images',
            {
                'tags': function (queryBuilder) {
                    queryBuilder.select('tags.id', 'tags.name');
                }
            }, {
                'categories': function (queryBuilder) {
                    queryBuilder.select('categories.id', 'name');
                }
            }
        ],
        debug: process.env.DEBUG,
    }).then(product => {
        return res.json(ProductResponseDto.buildDetails(product.serialize(), true, false));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.searchProduct = (req, res, next) => {
    return res.json(AppResponseDto.buildNotImplementedResponse());
    /*
        Product.query(queryBuilder => {
            queryBuilder.where('slug', 'LIKE', '%' + req.slug + '%')
        }).fetchPage({page: req.page, req.pageSize});
        */
};

exports.getByTag = function (req, res, next) {

    return Promise.all([
        Product.query(query => {
            query.join('products_tags', 'products_tags.product_id', 'products.id');
            query.where({'products_tags.tag_id': req.tagId});
            query.debug(process.env.DEBUG);
        }).fetchPage({
            page: req.page, pageSize: req.pageSize,
            withRelated: ['tags', 'categories'],
        }),
        ProductTag.where('tag_id', req.tagId).count('*'),
    ]).then(results => {
        const rawProducts = results[0];
        const products = results[0].models;
        const productsCount = results[0].pagination.rowCount;
        // or
        // const productsCount = results[1];
        const productIds = products.map(article => article.id);
        Comment.query(function (qb) {
            qb.where('product_id', 'in', productIds);
        })
            .fetchAll({
                columns: ['product_id']
            })
            .then(comments => {
                comments.models.forEach(comment => {
                    let productId = comment.get('product_id');
                    let product = products.find(product => product.id === productId);
                    product.set('comments_count', product.get('comments_count') + 1);
                });
                return res.json(ProductResponseDto.buildPagedList(rawProducts.serialize(), req.page, req.pageSize, productsCount, req.baseUrl));
            }).catch(err => {
            res.json(AppResponseDto.buildWithErrorMessages(err));
        });
    }).catch(err => {
        res.json(AppResponseDto.buildWithErrorMessages(err));
    });

};

exports.getByCategory = function (req, res, next) {

    const categoryQuery = {};
    if (!!req.params.category_slug)
        categoryQuery.slug = req.params.category_slug;
    else
        categoryQuery.id = req.params.categoryId;
    return Category.where(categoryQuery).fetch({
        columns: ['id']
    }).then(category => {
        Product.query(queryBuilder => {
            queryBuilder.join('products_categories', 'products_categories.product_id', 'products.id');
            queryBuilder.where({'products_categories.category_id': category.id});
            // queryBuilder.debug(true);
        }).fetchPage({
            page: req.page || 1,
            pageSize: req.pageSize || 5,
            debug: process.env.DEBUG,
            // TODO: retrieve only the comments.id and not the whole row
            withRelated: ['categories', 'tags', 'comments']
        }).then(products => {
            return res.json(ProductResponseDto.buildPagedList(products.serialize(), req.page, req.pageSize, products.pagination.rowCount, req.baseUrl));
        }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages(err));
        });
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createProduct = (req, res) => {
    const bindingResult = ProductRequestDto.createProductResponseDto(req);
    const promises = [];
    if (!_.isEmpty(bindingResult.errors)) {
        return res.json(AppResponseDto.buildWithErrorMessages(bindingResult.errors));
    }
    const tags = req.body.tags || [];
    const categories = req.body.categories || [];
    _.forOwn(tags, (description, name) => {
        promises.push(Tag.findOrCreate({name},
            {
                defaults: {description: tags[name]}
            }));
    });
    // another way of doing it without lodash
    Object.keys(categories).forEach(name => {
        promises.push(Category.findOrCreate({name}, {
            default: {
                description: categories[name]
            }
        }));
    });
    promises.push(Product.create(bindingResult.validatedData));
    Promise.all(promises).then(async rawTagsAndCategories => {
        promises.length = 0;
        const rawProduct = rawTagsAndCategories.pop();
        const tags = [];
        const categories = [];
        rawTagsAndCategories.forEach(rawTagOrCategory => {
            if (rawTagOrCategory.tableName === 'tags') // method 1 of getting table name
                tags.push(rawTagOrCategory.serialize());
            else if (rawTagOrCategory.constructor.prototype.tableName === 'categories') // method 2 of getting table name
                categories.push(rawTagOrCategory.serialize());
        });

        promises.push(rawProduct.tags().attach(tags.map(tag => tag.id), {debug: process.env.SHOW_SQL}));
        promises.push(rawProduct.categories().attach(categories.map(category => category.id), {debug: process.env.SHOW_SQL}));

        for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
            filePath = filePath.replace('public', '');
            promises.push(ProductImage.create({
                file_name: file.filename,
                file_path: filePath,
                original_name: file.originalname,
                file_size: file.size,
                product_id: rawProduct.id
            }));
        }

        await Promise.all(promises).then(results => {
            const images = results.reduce((filtered, image) => {
                if (image.tableName && image.tableName === 'file_uploads')
                    filtered.push(image.serialize());
                return filtered;
            }, []);
            const product = rawProduct.serialize();
            product.images = images;
            product.tags = tags;
            product.categories = categories;
            return res.json(AppResponseDto.buildWithDtoAndMessages(ProductResponseDto.buildDto(product), 'product created successfully'));
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.updateProduct = (req, res, next) => {
    res.json(AppResponseDto.buildWithErrorMessages('not implemented yet'));
};

exports.deleteProduct = (req, res, next) => {
    req.product.destroy(req.query).then(result => {
        res.json(AppResponseDto.buildSuccessWithMessages('Product deleted successfully'));
    }).catch(err => {
        res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};
