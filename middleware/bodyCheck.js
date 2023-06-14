exports.checkMandatoryFields = async (res, values) => {
  const missingFields = [];

  for (const field in values) {
    if (!values[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: false,
      message: `these mandatory fields are missing: ${missingFields.join(
        ", "
      )}`,
      missingFields: missingFields,
    });
  }


};
