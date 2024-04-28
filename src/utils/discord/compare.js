function areChoicesDifferent(existingChoices, localChoices) {
    for (const localChoice of localChoices) {
        const existingChoice = existingChoices?.find((choice) => choice.name === localChoice.name);

        if (!existingChoice) return true;
        if (localChoice.value !== existingChoice.value) return true;
    }
    return false;
}

function areOptionsDifferent(existingOptions, localOptions) {
    for (const localOption of localOptions) {
        const existingOption = existingOptions?.find((option) => option.name === localOption.name);

        if (!existingOption) return true;

        const { LDescription, LType, LRequired, LChoices } = localOption;
        const { EDescription, EType, ERequired, EChoices } = existingOption;

        if (LDescription !== EDescription) return true;
        if (LType !== EType) return true;
        if ((LRequired || false) !== ERequired) return true;
        if ((LChoices?.length || 0) !== (EChoices?.length || 0)) return true;
        if (areChoicesDifferent(EChoices || [], LChoices || [])) return true;
    }

    return false;
}

// TODO: verify the logic
function areCommandsDifferent(existingCommand, localCommand) {
    if (existingCommand.description !== localCommand.description) return true;
    if (existingCommand.options?.length !== (localCommand.options?.length || 0)) return true;
    if (areOptionsDifferent(existingCommand.options, localCommand.options || [])) return true;

    return false;
}

module.exports = areCommandsDifferent;
