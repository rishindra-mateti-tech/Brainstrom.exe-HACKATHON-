// Ingredient-to-Benefit Knowledge Base
// Maps specific ingredients to skincare goals with effectiveness scores and explanations

export interface IngredientBenefit {
    effectiveness: number; // 0-100 score
    reason: string; // Why this ingredient helps with this goal
    compatibility?: {
        oily?: number;
        dry?: number;
        combination?: number;
        sensitive?: number;
        normal?: number;
    };
}

export interface IngredientKnowledge {
    [ingredient: string]: {
        [goal: string]: IngredientBenefit;
    };
}

export const INGREDIENT_KNOWLEDGE: IngredientKnowledge = {
    // NIACINAMIDE - Multi-purpose powerhouse
    'Niacinamide': {
        'Reduce Acne': {
            effectiveness: 90,
            reason: 'Reduces inflammation, regulates sebum production, and minimizes pores',
            compatibility: { oily: 95, combination: 90, normal: 85, sensitive: 80, dry: 75 }
        },
        'Skin Brightening': {
            effectiveness: 85,
            reason: 'Inhibits melanin transfer to skin cells, fading dark spots and hyperpigmentation',
            compatibility: { oily: 90, combination: 90, normal: 90, sensitive: 85, dry: 85 }
        },
        'Oil Control': {
            effectiveness: 88,
            reason: 'Regulates sebum production without over-drying',
            compatibility: { oily: 95, combination: 90, normal: 70, sensitive: 75, dry: 40 }
        },
        'Anti-Aging': {
            effectiveness: 75,
            reason: 'Stimulates collagen production and improves skin elasticity',
            compatibility: { oily: 80, combination: 85, normal: 85, sensitive: 80, dry: 85 }
        }
    },

    // SALICYLIC ACID - Acne fighter
    'Salicylic Acid': {
        'Reduce Acne': {
            effectiveness: 95,
            reason: 'Penetrates pores to unclog them, kills acne-causing bacteria',
            compatibility: { oily: 98, combination: 92, normal: 75, sensitive: 50, dry: 40 }
        },
        'Oil Control': {
            effectiveness: 92,
            reason: 'Exfoliates inside pores and reduces excess oil',
            compatibility: { oily: 95, combination: 88, normal: 65, sensitive: 45, dry: 35 }
        },
        'Reduce Scars': {
            effectiveness: 70,
            reason: 'Promotes cell turnover to fade acne marks over time',
            compatibility: { oily: 80, combination: 75, normal: 65, sensitive: 55, dry: 50 }
        }
    },

    // HYALURONIC ACID - Hydration hero
    'Hyaluronic Acid': {
        'Hydration': {
            effectiveness: 98,
            reason: 'Holds up to 1000x its weight in water, provides intense hydration',
            compatibility: { oily: 90, combination: 95, normal: 98, sensitive: 92, dry: 100 }
        },
        'Anti-Aging': {
            effectiveness: 82,
            reason: 'Plumps fine lines and improves skin texture',
            compatibility: { oily: 85, combination: 88, normal: 90, sensitive: 85, dry: 95 }
        }
    },

    // VITAMIN C (Ascorbic Acid) - Brightening + Antioxidant
    'Vitamin C': {
        'Skin Brightening': {
            effectiveness: 92,
            reason: 'Inhibits tyrosinase enzyme, reduces melanin production',
            compatibility: { oily: 90, combination: 90, normal: 92, sensitive: 70, dry: 85 }
        },
        'Anti-Aging': {
            effectiveness: 88,
            reason: 'Boosts collagen synthesis and protects from UV damage',
            compatibility: { oily: 85, combination: 90, normal: 90, sensitive: 75, dry: 88 }
        },
        'Reduce Scars': {
            effectiveness: 75,
            reason: 'Fades post-inflammatory hyperpigmentation',
            compatibility: { oily: 80, combination: 80, normal: 78, sensitive: 65, dry: 75 }
        }
    },

    // RETINOL - Anti-aging gold standard
    'Retinol': {
        'Anti-Aging': {
            effectiveness: 95,
            reason: 'Increases cell turnover, boosts collagen, reduces fine lines',
            compatibility: { oily: 92, combination: 90, normal: 88, sensitive: 60, dry: 70 }
        },
        'Reduce Acne': {
            effectiveness: 85,
            reason: 'Prevents clogged pores and accelerates skin renewal',
            compatibility: { oily: 90, combination: 85, normal: 75, sensitive: 50, dry: 60 }
        },
        'Reduce Scars': {
            effectiveness: 80,
            reason: 'Promotes collagen production and fades hyperpigmentation',
            compatibility: { oily: 85, combination: 82, normal: 78, sensitive: 55, dry: 65 }
        }
    },

    // GLYCERIN - Universal moisturizer
    'Glycerin': {
        'Hydration': {
            effectiveness: 90,
            reason: 'Draws moisture into skin, maintains skin barrier',
            compatibility: { oily: 88, combination: 92, normal: 95, sensitive: 90, dry: 98 }
        }
    },

    // PANTHENOL (Pro-Vitamin B5)
    'Panthenol': {
        'Hydration': {
            effectiveness: 85,
            reason: 'Attracts and retains moisture, soothes irritation',
            compatibility: { oily: 85, combination: 88, normal: 90, sensitive: 95, dry: 92 }
        },
        'Reduce Acne': {
            effectiveness: 65,
            reason: 'Anti-inflammatory properties calm redness',
            compatibility: { oily: 70, combination: 70, normal: 65, sensitive: 75, dry: 60 }
        }
    },

    // AZELAIC ACID - Acne + pigmentation
    'Azelaic Acid': {
        'Reduce Acne': {
            effectiveness: 88,
            reason: 'Kills acne bacteria, reduces inflammation, unclogs pores',
            compatibility: { oily: 92, combination: 90, normal: 80, sensitive: 75, dry: 70 }
        },
        'Skin Brightening': {
            effectiveness: 85,
            reason: 'Inhibits melanin production, evens skin tone',
            compatibility: { oily: 88, combination: 88, normal: 85, sensitive: 80, dry: 78 }
        }
    },

    // BENZOYL PEROXIDE - Acne treatment
    'Benzoyl Peroxide': {
        'Reduce Acne': {
            effectiveness: 93,
            reason: 'Kills P. acnes bacteria, reduces inflammation',
            compatibility: { oily: 95, combination: 88, normal: 70, sensitive: 40, dry: 30 }
        }
    },

    // CERAMIDES - Barrier repair
    'Ceramides': {
        'Hydration': {
            effectiveness: 92,
            reason: 'Restores skin barrier, prevents moisture loss',
            compatibility: { oily: 75, combination: 88, normal: 92, sensitive: 95, dry: 98 }
        },
        'Anti-Aging': {
            effectiveness: 70,
            reason: 'Strengthens skin barrier, improves resilience',
            compatibility: { oily: 70, combination: 80, normal: 85, sensitive: 88, dry: 92 }
        }
    },

    // PEPTIDES - Collagen boosters
    'Peptides': {
        'Anti-Aging': {
            effectiveness: 85,
            reason: 'Stimulates collagen and elastin production',
            compatibility: { oily: 80, combination: 85, normal: 88, sensitive: 82, dry: 90 }
        }
    },

    // ALPHA ARBUTIN - Brightening
    'Alpha Arbutin': {
        'Skin Brightening': {
            effectiveness: 88,
            reason: 'Inhibits tyrosinase, fades hyperpigmentation gently',
            compatibility: { oily: 85, combination: 88, normal: 90, sensitive: 92, dry: 88 }
        }
    },

    // TEA TREE OIL - Natural acne fighter
    'Tea Tree Oil': {
        'Reduce Acne': {
            effectiveness: 80,
            reason: 'Natural antimicrobial, reduces acne lesions',
            compatibility: { oily: 90, combination: 80, normal: 70, sensitive: 50, dry: 40 }
        }
    }
};

/**
 * Get ingredient benefits for a specific goal
 */
export function getIngredientBenefit(
    ingredient: string,
    goal: string,
    skinType?: string
): IngredientBenefit | null {
    const normalizedIngredient = Object.keys(INGREDIENT_KNOWLEDGE).find(
        key => key.toLowerCase() === ingredient.toLowerCase()
    );

    if (!normalizedIngredient) return null;

    const ingredientData = INGREDIENT_KNOWLEDGE[normalizedIngredient];
    const benefit = ingredientData[goal];

    if (!benefit) return null;

    // Adjust effectiveness based on skin type compatibility
    if (skinType && benefit.compatibility) {
        const skinTypeKey = skinType.toLowerCase() as keyof typeof benefit.compatibility;
        const compatibilityScore = benefit.compatibility[skinTypeKey];

        if (compatibilityScore !== undefined) {
            return {
                ...benefit,
                effectiveness: Math.round((benefit.effectiveness * compatibilityScore) / 100)
            };
        }
    }

    return benefit;
}

/**
 * Get all goals an ingredient can help with
 */
export function getIngredientGoals(ingredient: string): string[] {
    const normalizedIngredient = Object.keys(INGREDIENT_KNOWLEDGE).find(
        key => key.toLowerCase() === ingredient.toLowerCase()
    );

    if (!normalizedIngredient) return [];

    return Object.keys(INGREDIENT_KNOWLEDGE[normalizedIngredient]);
}

/**
 * Find missing ingredients for a goal
 */
export function getRecommendedIngredients(
    goal: string,
    currentIngredients: string[]
): Array<{ ingredient: string; benefit: IngredientBenefit }> {
    const recommendations: Array<{ ingredient: string; benefit: IngredientBenefit }> = [];

    const currentIngredientsLower = currentIngredients.map(i => i.toLowerCase());

    for (const [ingredient, goals] of Object.entries(INGREDIENT_KNOWLEDGE)) {
        if (currentIngredientsLower.includes(ingredient.toLowerCase())) continue;

        if (goals[goal]) {
            recommendations.push({
                ingredient,
                benefit: goals[goal]
            });
        }
    }

    // Sort by effectiveness
    return recommendations.sort((a, b) => b.benefit.effectiveness - a.benefit.effectiveness);
}
