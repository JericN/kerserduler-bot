function extractCommandOptions(input, options) {
    const optionValues = new Object();
    options.forEach((option) => {
        optionValues[option.name] = input.get(option.name)?.value || option.default;
    });
    return optionValues;
}

module.exports = extractCommandOptions;
