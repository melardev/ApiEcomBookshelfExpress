const Tag = require('./../config/db.config').Tag;
const bookshelf = require('./../config/db.config').bookshelf;
const Category = require('./../config/db.config').Category;
const CategoryImage = require('./../config/db.config').CategoryImage;
const TagImage = require('./../config/db.config').TagImage;

const TagDto = require('../dtos/responses/tags.dto');
const CategoryDto = require('../dtos/responses/categories.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');


exports.getTags = function (req, res, next) {
    Tag.fetchPage({
        page: req.page,
        pageSize: req.pageSize,
        withRelated: ['images'],
        debug: process.env.DEBUG
    }).then(function (rawTags) {
        const tags = rawTags.serialize();
        return res.json(TagDto.buildPagedList(tags, req.page, req.pageSize, rawTags.pagination.rowCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.getCategories = function (req, res, next) {

    Category.fetchPage({
        page: req.page,
        papgeSize: req.pageSize,
        withRelated: ['images'],
    }).then(function (categories) {
        const totalCategoriesCount = categories.pagination.rowCount;
        categories = categories.serialize();
        return res.json(CategoryDto.buildPagedList(categories, req.page, req.pageSize, totalCategoriesCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createTag = async function (req, res, next) {
    const tagObj = {};
    const promises = [];
    if (req.body.name) {
        tagObj.name = req.body.name;
    }

    if (req.body.description) {
        tagObj.description = req.body.description;
    }

    if (tagObj.name == null) {
        return res.json(AppResponseDto.buildWithErrorMessages('You must provide the name for the category'));
    }

    await Tag.create(tagObj, {debug: process.env.SHOW_SQL}).then(async tag => {
        tag = tag.serialize();
        for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
            filePath = filePath.replace('public', '');
            promises.push(TagImage.create({
                file_name: file.filename,
                file_path: filePath,
                original_name: file.originalname,
                file_size: file.size,
                tag_id: tag.id
            }));
        }

        Promise.all(promises).then(results => {
            tag.images = results.map(tagImage => tagImage.serialize());
            return res.json(AppResponseDto.buildWithDtoAndMessages(TagDto.buildDto(tag, true), 'Tag created successfully'));
        }).catch(err => {
            res.json(AppResponseDto.buildWithErrorMessages(err));
        });
    }).catch(err => {
        res.json(AppResponseDto.buildWithErrorMessages(err));
    });

};

exports.createCategory = function (req, res, next) {
    const categoryObj = {};
    const promises = [];
    if (req.body.name) {
        categoryObj.name = req.body.name;
    }

    if (req.body.description) {
        categoryObj.description = req.body.description;
    }

    if (categoryObj.name == null) {
        return res.json(AppResponseDto.buildWithErrorMessages('You must provide the name for the category'));
    }

    Category.create(categoryObj).then(async category => {
        category = category.serialize();
        for (let i = 0; req.files != null && i < req.files.length; i++) {
            let file = req.files[i];
            let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
            filePath = filePath.replace('public', '');
            promises.push(CategoryImage.create({
                file_name: file.filename,
                file_path: filePath,
                original_name: file.originalname,
                file_size: file.size,
                category_id: category.id
            }));
        }

        await Promise.all(promises).then(results => {
            category.images = results.map(catImage => catImage.serialize());
            return res.json(AppResponseDto.buildWithDtoAndMessages(CategoryDto.buildDto(category, true), 'Category created successfully'));
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};