const validatePricingPlan = (data) => {
    const errors = [];
  
    // Validate title
    const validTitles = ["Basic", "Advanced", "Premium"];
    if (!data.title || !validTitles.includes(data.title)) {
      errors.push(
        "Invalid or missing title. Allowed values: Basic, Advanced, Premium."
      );
    }
  
    // Validate description
    if (!data.description || typeof data.description !== "string") {
      errors.push("Description is required and must be a string.");
    }
  
    // Validate price
    if (
      data.price === undefined ||
      typeof data.price !== "number" ||
      data.price <= 0
    ) {
      errors.push("Price is required and must be a positive number.");
    }
  
    // Validate features
    if (!Array.isArray(data.features) || data.features.length === 0) {
      errors.push("Features must be a non-empty array of strings.");
    }
  
    // Validate iconUrl
    if (!data.iconUrl || !data.iconUrl.startsWith("http")) {
      errors.push("Icon URL is required and must be a valid URL.");
    }
  
    return errors;
  };