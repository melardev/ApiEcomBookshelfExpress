const db = {};
const mode = process.env.MODE || 'development';
db.knex = require('knex')(require('../knexfile')[mode]);

db.bookshelf = require('bookshelf')(db.knex);

db.bookshelf.plugin('pagination');
db.bookshelf.plugin(require('bookshelf-scopes'));

db.bookshelf.plugin('virtuals');

db.ModelBase = require('bookshelf-modelbase')(db.bookshelf);

db.User = require('./../models/user.model')(db);
db.Role = require('./../models/role.model')(db);
db.UserRole = require('./../models/user_role.model')(db);

db.Product = require('../models/product.model')(db);

db.Tag = require('./../models/tag.model')(db);
db.ProductTag = require('../models/product_tag.model')(db);

db.Category = require('./../models/category.model')(db);
db.ProductCategory = require('../models/product_category.model')(db);
db.Comment = require('./../models/comment.model')(db);

db.Order = require('./../models/order.model')(db);
db.OrderItem = require('./../models/order_item.model')(db);

db.Address = require('../models/address.model')(db);

db.FileUpload = require('../models/file_upload.model')(db);
db.ProductImage = require('../models/product_image.model')(db);
db.CategoryImage = require('../models/category_image.model')(db);
db.TagImage = require('../models/tag_image.model')(db);

module.exports = db;


