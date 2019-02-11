const sanitizeInput = require('../../utils/sanitize').sanitizeInput;

exports.createCommentDto = (input) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    if (input.content && input.content.trim() !== '')
        resultBinding.validatedData.content = 'a content for your comment is required';
    else
        resultBinding.errors.content = sanitizeInput(input.content);

    return resultBinding;
};