const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Custom Joi extension to sanitize HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// ✅ Schema for creating or editing a perfume
module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()  // optional for handling image deletions
});


// ✅ Schema for reviews (same as in campground project)
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});
