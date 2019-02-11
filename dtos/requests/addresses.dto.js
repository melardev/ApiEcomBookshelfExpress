const sanitizeInput = require('../../utils/sanitize').sanitizeInput;

exports.createAddressDto = (input, user) => {
    const resultBinding = {
        validatedData: {
            user_id: user ? user.id : null
        },
        errors: {},
    };


    const first_name = input.first_name || user.first_name;
    const last_name = input.last_name || user.last_name;
    const zip_code = input.zip_code;
    const address = input.address;
    const city = input.city;
    const country = input.country;

    if (!first_name || first_name.trim() === '')
        resultBinding.errors.first_name = 'city is required';
    else
        resultBinding.validatedData.first_name = sanitizeInput(first_name);

    if (!last_name || last_name.trim() === '')
        resultBinding.errors.last_name = 'last_name is required';
    else
        resultBinding.validatedData.last_name = sanitizeInput(last_name);

    if (!city || city.trim() === '')
        resultBinding.errors.city = 'city is required';
    else
        resultBinding.validatedData.city = sanitizeInput(city);

    if (!country || country.trim() === '')
        resultBinding.errors.country = 'country is required';
    else
        resultBinding.validatedData.country = sanitizeInput(country);

    if (!zip_code || zip_code.trim() === '')
        resultBinding.errors.zip_code = 'zip_code is required';
    else
        resultBinding.validatedData.zip_code = sanitizeInput(zip_code);

    if (!address || address.trim() === '')
        resultBinding.errors.address = 'address must not be empty';
    else
        resultBinding.validatedData.address = sanitizeInput(address);
    return resultBinding;
};