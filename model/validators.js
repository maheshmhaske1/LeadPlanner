var validator = require('validator');

exports.checkMandatoryFields = async (res, values) => {
  const missingFields = [];
  console.log(values)

  for (const field in values) {
    if (!values[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return res.json({
      status: false,
      message: `these mandatory fields are missing: ${missingFields.join(
        ", "
      )}`,
      missingFields: missingFields,
    });
  }
};

exports.validateEmail = async (res, email) => {
  if (!validator.isEmail(email)) {
    return res.json({
      status: false,
      message: `${email} this is not an valid email`
    })
  }
}
