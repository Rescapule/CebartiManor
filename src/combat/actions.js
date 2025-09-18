export const ACTION_SEQUENCES = {
  angerCore: ["strike", "grapple", "throw"],
  fearCore: ["guard", "brace", "counter"],
  joyCore: ["spark", "festivalLight", "elation"],
  sadnessCore: ["burden", "wither", "breakthrough"],
};

export function createCoreContribution(chainKey, weightPerAction) {
  const actions = ACTION_SEQUENCES[chainKey] || [];
  const totalWeight = weightPerAction * actions.length;
  return createMultiCoreContribution([chainKey], totalWeight);
}

export function createMultiCoreContribution(chainKeys, totalWeight) {
  const contributions = [];
  const totalActions = chainKeys.reduce(
    (sum, key) => sum + (ACTION_SEQUENCES[key]?.length || 0),
    0
  );
  if (totalActions <= 0 || totalWeight <= 0) {
    return contributions;
  }
  const weightPerAction = totalWeight / totalActions;
  chainKeys.forEach((key) => {
    const actions = ACTION_SEQUENCES[key] || [];
    actions.forEach((actionKey) => {
      contributions.push({ action: actionKey, weight: weightPerAction });
    });
  });
  return contributions;
}
