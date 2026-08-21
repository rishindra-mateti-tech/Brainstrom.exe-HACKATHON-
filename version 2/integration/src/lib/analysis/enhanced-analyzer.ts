// Enhanced Analyzer with Goals Support
// This extends the base analyzer with priority-weighted goal-based scoring

import { AnalysisResult, analyzeIngredients } from './analyzer';
import {
    INGREDIENT_KNOWLEDGE,
    getIngredientBenefit,
    getRecommendedIngredients
} from './ingredient-knowledge';

import {
    MLAnalysisResult,
    analyzeProductML,
    getSafeAlternatives,
    analyzeUnknownIngredientML,
    UnknownIngredientAnalysisResult,
    UnknownIngredientUserContext
} from '../ml-api';

export interface GoalEffectiveness {
    goal: string;
    priority: number;
    score: number; // 0-100
    matchingIngredients: Array<{
        name: string;
        effectiveness: number;
        reason: string;
        source?: 'verified' | 'ai_estimate' | 'ml-classifier';
    }>;
}

export interface PersonalizedInsight {
    ingredient: string;
    benefit: string;
    isPositive: boolean;
}

export interface ProductRecommendation {
    type: 'great' | 'consider' | 'missing' | 'warning' | 'ml-insight';
    title: string;
    description: string;
    ingredients?: string[];
}

export interface EnhancedAnalysisResult extends AnalysisResult {
    extractedIngredients: string[];
    personalizedInsights: PersonalizedInsight[];
    goalEffectiveness?: GoalEffectiveness[];
    recommendations: ProductRecommendation[];
    suitabilityScore: number;
    suitabilityExplanation: string;
    goalScore: number;
    mlPredictions?: MLAnalysisResult[];
    isV2?: boolean;
    averageConfidence?: number;
    productTypeWarning?: string;
}

export interface UserGoal {
    goal_name: string;
    priority: number;
}

export const analyzeIngredientsWithGoals = async (
    ingredients: string,
    userProfile: any,
    allergies: string[],
    history: any[],
    userGoals: UserGoal[],
    priorityMode: boolean,
    isV2: boolean = false
): Promise<EnhancedAnalysisResult> => {
    // Get base analysis first
    const baseAnalysis = analyzeIngredients(ingredients, userProfile, allergies, history);

    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    const extractedIngredients = ingredientList;

    // Generate personalized insights
    const personalizedInsights = generatePersonalizedInsights(
        ingredientList,
        userProfile
    );

    let goalEffectiveness: GoalEffectiveness[] | undefined;
    let goalScore = 0;
    let mlPredictions: MLAnalysisResult[] | undefined;
    let averageConfidence: number | undefined;
    let productTypeWarning: string | undefined;

    if (isV2) {
        mlPredictions = await analyzeProductML(ingredientList);

        if (mlPredictions.length > 0) {
            averageConfidence = mlPredictions.reduce((sum: number, p: MLAnalysisResult) => sum + p.confidence_score, 0) / mlPredictions.length;

            // Check for product type warning (e.g. shampoo used on face)
            productTypeWarning = detectNonSkinProduct(mlPredictions);

            if (productTypeWarning) {
                // Reduce suitability slightly instead of halving it, as cleansers share surfactant functions
                baseAnalysis.score = Math.max(0, baseAnalysis.score - 15);
                baseAnalysis.explanation += ` WARNING: ${productTypeWarning}`;
            }

            // The ML classifier signals "no confident prediction" for an ingredient by
            // returning predicted_functions === ['UNKNOWN']. For those, fall back to the
            // Gemini-backed unknown-ingredient route (verified/AI-estimate) so we still
            // get a usable effectiveness signal instead of silently dropping them.
            const unknownIngredientPredictions = mlPredictions.filter(
                p => p.predicted_functions.length === 1 && p.predicted_functions[0] === 'UNKNOWN'
            );

            let unknownIngredientResults: UnknownIngredientAnalysisResult[] = [];
            if (unknownIngredientPredictions.length > 0) {
                const userContext: UnknownIngredientUserContext = {
                    skin_type: userProfile?.skin_type ?? null,
                    goals: userGoals.map(g => ({ goal_name: g.goal_name, priority: g.priority })),
                    allergies: allergies || [],
                    history: (history || []).map((h: any) => ({
                        ingredient_name: h.ingredient_name,
                        reaction: h.reaction
                    })),
                };

                const results = await Promise.all(
                    unknownIngredientPredictions.map(p =>
                        analyzeUnknownIngredientML(p.inci_name, '', userContext)
                    )
                );
                unknownIngredientResults = results.filter(
                    (r): r is UnknownIngredientAnalysisResult => r !== null
                );
            }

            // --- STRICT ML GOAL SCORING (NO FAKING) ---
            if (userGoals.length > 0) {
                goalEffectiveness = userGoals.map(goal => calculateMLGoalEffectiveness(
                    goal,
                    mlPredictions!,
                    unknownIngredientResults
                ));

                // Calculate ML goal-specific score based on priority weighting
                if (priorityMode && goalEffectiveness.length > 0) {
                    goalScore = calculatePriorityWeightedScore(goalEffectiveness);
                } else if (goalEffectiveness.length > 0) {
                    goalScore = Math.round(goalEffectiveness.reduce((sum: number, g: GoalEffectiveness) => sum + g.score, 0) / goalEffectiveness.length);
                }
            }
        }
    } else {
        // --- V1 RULE-BASED GOAL SCORING ---
        if (userGoals.length > 0) {
            goalEffectiveness = userGoals.map(goal => calculateGoalEffectiveness(
                goal,
                ingredientList,
                userProfile?.skin_type
            ));

            if (priorityMode && goalEffectiveness.length > 0) {
                goalScore = calculatePriorityWeightedScore(goalEffectiveness);
            } else if (goalEffectiveness.length > 0) {
                goalScore = Math.round(goalEffectiveness.reduce((sum: number, g: GoalEffectiveness) => sum + g.score, 0) / goalEffectiveness.length);
            }
        }
    }

    // Generate recommendations (combine ML + Goal recommendations)
    const recommendationsList = generateRecommendations(
        ingredientList,
        userGoals,
        goalEffectiveness
    );

    if (isV2 && mlPredictions && mlPredictions.length > 0) {
        generateMLRecommendations(mlPredictions, recommendationsList);
    }

    // Generate goal-specific explanation
    const getGoalVerdict = (score: number) => {
        if (score >= 80) return "excellent for your goals";
        if (score >= 60) return "good for your goals";
        if (score >= 40) return "okay for your goals";
        return "not very effective for your goals";
    };

    const getSuitabilityVerdict = (score: number) => {
        if (score >= 80) return "perfect for your skin";
        if (score >= 60) return "safe for your skin";
        if (score >= 40) return "tolerable for your skin";
        return "risky for your skin";
    };

    const holisticExplanation = `Your product suitability score is ${baseAnalysis.score} (${getSuitabilityVerdict(baseAnalysis.score)}) and your overall goal-based score is ${goalScore} (${getGoalVerdict(goalScore)}).`;

    return {
        ...baseAnalysis,
        score: goalScore,
        suitabilityScore: baseAnalysis.score,
        suitabilityExplanation: baseAnalysis.explanation,
        goalScore: goalScore,
        explanation: holisticExplanation, // This is now the combined holistic verdict
        extractedIngredients,
        personalizedInsights,
        goalEffectiveness,
        recommendations: recommendationsList,
        isV2,
        mlPredictions,
        averageConfidence,
        productTypeWarning
    };
};

function generateMLRecommendations(
    predictions: MLAnalysisResult[],
    recommendations: ProductRecommendation[]
) {
    // 1. Check for restricted/prohibited ingredients
    const hazardous = predictions.filter(p => p.is_prohibited || p.is_restricted);

    if (hazardous.length > 0) {
        hazardous.forEach(h => {
            const hazardType = h.is_prohibited ? 'PROHIBITED' : 'RESTRICTED';
            const details = h.is_prohibited ? h.prohibited_details : h.restriction_details;

            // Get alternatives based on its predicted functions
            const alternatives = getSafeAlternatives(h.predicted_functions);
            let altText = '';
            if (alternatives.length > 0) {
                altText = ` Consider looking for products with ${alternatives.join(' or ')} instead.`;
            }

            recommendations.push({
                type: 'warning',
                title: `${hazardType} Ingredient Detected`,
                description: `${h.inci_name} is flagged by ML regulatory check. ${details}${altText}`,
                ingredients: [h.inci_name]
            });
        });
    }

    // 2. High confidence beneficial ingredients
    const topPerformers = predictions.filter(p => !p.is_prohibited && !p.is_restricted && p.confidence_score > 0.85).slice(0, 3);

    if (topPerformers.length > 0) {
        recommendations.push({
            type: 'ml-insight',
            title: 'ML High Confidence Highlights',
            description: `Our ML model is highly confident (>85%) about the functions of these ingredients: ${topPerformers.map(p => `${p.inci_name} (${p.predicted_functions.slice(0, 2).join(', ')})`).join('; ')}`,
            ingredients: topPerformers.map(p => p.inci_name)
        });
    }
}

function detectNonSkinProduct(predictions: MLAnalysisResult[]): string | undefined {
    let hairCareCount = 0;

    predictions.forEach(p => {
        const hasHairFunc = p.predicted_functions.some(f =>
            f.toUpperCase().includes('HAIR') ||
            f.toUpperCase().includes('ANTIDANDRUFF')
        );
        if (hasHairFunc) hairCareCount++;
    });

    // If more than 40% of ingredients are strictly hair-focused, flag it
    // Note: removed SURFACTANT from trigger as facial cleansers have it.
    if (predictions.length > 0 && (hairCareCount / predictions.length) > 0.4) {
        return "This ingredient profile resembles a hair care product (like shampoo/conditioner). Hair care ingredients may cause breakouts if used on facial skin.";
    }

    return undefined;
}

function generatePersonalizedInsights(
    ingredientList: string[],
    userProfile: any
): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const skinType = userProfile?.skin_type || 'normal';

    ingredientList.forEach(ingredient => {
        // Check against known ingredients
        const ingredientKey = Object.keys(INGREDIENT_KNOWLEDGE).find(
            key => ingredient.includes(key.toLowerCase())
        );

        if (!ingredientKey) return;

        const ingredientData = INGREDIENT_KNOWLEDGE[ingredientKey];
        const goals = Object.keys(ingredientData);

        if (goals.length > 0) {
            const primaryGoal = goals[0];
            const benefit = ingredientData[primaryGoal];

            let insight = `${ingredientKey} ${benefit.reason.toLowerCase()}`;

            // Add skin type specific note
            if (benefit.compatibility) {
                const compatScore = benefit.compatibility[skinType as keyof typeof benefit.compatibility];
                if (compatScore && compatScore < 60) {
                    insight += ` (may not be ideal for ${skinType} skin)`;
                    insights.push({
                        ingredient: ingredientKey,
                        benefit: insight,
                        isPositive: false
                    });
                    return;
                }
            }

            insights.push({
                ingredient: ingredientKey,
                benefit: insight,
                isPositive: true
            });
        }
    });

    return insights;
}

function calculateGoalEffectiveness(
    goal: UserGoal,
    ingredientList: string[],
    skinType?: string
): GoalEffectiveness {
    const matchingIngredients: Array<{
        name: string;
        effectiveness: number;
        reason: string;
    }> = [];

    let totalEffectiveness = 0;
    let count = 0;

    ingredientList.forEach(ingredient => {
        const benefit = getIngredientBenefit(ingredient, goal.goal_name, skinType);

        if (benefit) {
            matchingIngredients.push({
                name: ingredient,
                effectiveness: benefit.effectiveness,
                reason: benefit.reason
            });
            totalEffectiveness += benefit.effectiveness;
            count++;
        }
    });

    const score = count > 0 ? Math.round(totalEffectiveness / count) : 0;

    return {
        goal: goal.goal_name,
        priority: goal.priority,
        score,
        matchingIngredients
    };
}


function calculatePriorityWeightedScore(
    goalEffectiveness: GoalEffectiveness[]
): number {
    // Dynamic priority weights based on how many priorities are set
    // 3 priorities: P1=50%, P2=37%, P3=13% (shared)
    // 2 priorities: Top=60%, Bottom=40%
    // 1 priority: 100%

    // Get unique priority levels present
    const priorities = [...new Set(goalEffectiveness.map(g => g.priority))].sort();
    const numPriorities = priorities.length;

    if (numPriorities === 0) return 0;

    let weightedSum = 0;

    if (numPriorities === 3) {
        // P1=50, P2=37, P3=13
        const p1Goals = goalEffectiveness.filter(g => g.priority === 1);
        const p1AvgScore = p1Goals.length > 0 ? p1Goals.reduce((sum, g) => sum + g.score, 0) / p1Goals.length : 0;

        const p2Goals = goalEffectiveness.filter(g => g.priority === 2);
        const p2AvgScore = p2Goals.length > 0 ? p2Goals.reduce((sum, g) => sum + g.score, 0) / p2Goals.length : 0;

        const p3Goals = goalEffectiveness.filter(g => g.priority === 3);
        const p3AvgScore = p3Goals.length > 0
            ? p3Goals.reduce((sum, g) => sum + g.score, 0) / p3Goals.length
            : 0;

        weightedSum = (p1AvgScore * 0.50) + (p2AvgScore * 0.37) + (p3AvgScore * 0.13);
    }
    else if (numPriorities === 2) {
        // Highest priority gets 60%, lowest gets 40%
        const highP = priorities[0];
        const highGoals = goalEffectiveness.filter(g => g.priority === highP);
        const highAvg = highGoals.reduce((sum, g) => sum + g.score, 0) / highGoals.length;

        const lowP = priorities[1];
        const lowGoals = goalEffectiveness.filter(g => g.priority === lowP);
        const lowAvg = lowGoals.reduce((sum, g) => sum + g.score, 0) / lowGoals.length;

        weightedSum = (highAvg * 0.60) + (lowAvg * 0.40);
    }
    else {
        // Only 1 priority level present (could be level 1, 2, or 3)
        weightedSum = goalEffectiveness.reduce((sum, g) => sum + g.score, 0) / goalEffectiveness.length;
    }

    return Math.round(weightedSum);
}

function generateRecommendations(
    ingredientList: string[],
    userGoals: UserGoal[],
    goalEffectiveness?: GoalEffectiveness[]
): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    if (!userGoals.length || !goalEffectiveness) return recommendations;

    // Find great ingredients
    const greatIngredients = goalEffectiveness
        .flatMap(ge => ge.matchingIngredients.filter(i => i.effectiveness >= 85))
        .slice(0, 3);

    if (greatIngredients.length > 0) {
        recommendations.push({
            type: 'great',
            title: 'Excellent Ingredients Found',
            description: `Your product contains ${greatIngredients.map(i => i.name).join(', ')} - highly effective for ${userGoals[0].goal_name}!`,
            ingredients: greatIngredients.map(i => i.name)
        });
    }

    // Find recommended complementary ingredients (Priority 1 goal only)
    if (userGoals.length > 0) {
        const recommended = getRecommendedIngredients(
            userGoals[0].goal_name,
            ingredientList
        ).slice(0, 3);

        if (recommended.length > 0) {
            recommendations.push({
                type: 'consider',
                title: 'Consider Pairing With',
                description: `For maximum ${userGoals[0].goal_name.toLowerCase()} results, look for products with: ${recommended.map(r => `${r.ingredient} (${r.benefit.reason})`).join('; ')}`,
                ingredients: recommended.map(r => r.ingredient)
            });
        }
    }

    // Check if missing key ingredients for Priority 1 goal
    const priority1 = goalEffectiveness.find(ge => ge.priority === 1);
    if (priority1 && priority1.score < 70) {
        const topMissing = getRecommendedIngredients(
            priority1.goal,
            ingredientList
        ).slice(0, 2);

        if (topMissing.length > 0) {
            recommendations.push({
                type: 'missing',
                title: 'Missing Key Ingredients',
                description: `For better ${priority1.goal.toLowerCase()} results, this product would benefit from: ${topMissing.map(m => m.ingredient).join(' or ')}`,
                ingredients: topMissing.map(m => m.ingredient)
            });
        }
    }

    return recommendations;
}

// --- PURE ML BASED GOAL SCORING ---
// Maps Kaggle CosIng dataset functions to user goals
const ML_GOAL_MAPPING: Record<string, string[]> = {
    'Acne': ['ANTIMICROBIAL', 'SEBUM RESTORING', 'ASTRINGENT', 'SOOTHING', 'KERATOLYTIC', 'CLEANSING'],
    'Anti-Aging': ['ANTIOXIDANT', 'SKIN PROTECTING', 'SKIN CONDITIONING', 'CELL REGENERATING'],
    'Glowing Skin': ['SKIN CONDITIONING', 'KERATOLYTIC', 'EMOLLIENT', 'ANTIOXIDANT'],
    'Hydration': ['HUMECTANT', 'EMOLLIENT', 'SKIN CONDITIONING', 'MOISTURISING'],
    'Reduce Redness': ['SOOTHING', 'SKIN PROTECTING', 'SKIN CONDITIONING'],
    'Texture/Pores': ['ASTRINGENT', 'KERATOLYTIC', 'CLEANSING', 'SMOOTHING'],
    'Sun Protection': ['UV ABSORBER', 'UV FILTER', 'SKIN PROTECTING']
};

function calculateMLGoalEffectiveness(
    goal: UserGoal,
    mlPredictions: MLAnalysisResult[],
    unknownIngredientResults: UnknownIngredientAnalysisResult[] = []
): GoalEffectiveness {
    const matchingIngredients: Array<{
        name: string;
        effectiveness: number;
        reason: string;
        source?: 'verified' | 'ai_estimate' | 'ml-classifier';
    }> = [];

    // Find what dataset functions satisfy this specific user goal
    const targetFunctions = ML_GOAL_MAPPING[goal.goal_name] || ['SKIN CONDITIONING'];

    let totalScore = 0;
    let count = 0;

    mlPredictions.forEach(pred => {
        // Find if this ingredient predicts any of the functions we mapped to the goal
        const matchedFunctions = pred.predicted_functions.filter(f =>
            targetFunctions.includes(f.toUpperCase())
        );

        if (matchedFunctions.length > 0) {
            // Confidence determines the effectiveness score (0-100)
            const effectiveness = Math.round(pred.confidence_score * 100);

            matchingIngredients.push({
                name: pred.inci_name,
                effectiveness: effectiveness,
                reason: `Dataset mapped ML Function(s): ${matchedFunctions.join(', ')}`,
                source: pred.source || 'ml-classifier'
            });

            totalScore += effectiveness;
            count++;
        }
    });

    // Fold in ingredients the classifier couldn't confidently place (predicted_functions
    // === ['UNKNOWN']) that were resolved via the Gemini-backed unknown-ingredient route.
    // These flow through the exact same averaging/curve below as classifier matches.
    unknownIngredientResults.forEach(result => {
        matchingIngredients.push({
            name: result.inci_name,
            effectiveness: result.effectiveness,
            reason: result.reason,
            source: result.source
        });

        totalScore += result.effectiveness;
        count++;
    });

    // Score is average confidence of contributing ingredients
    // Add a curve so a product with at least some good ingredients gets a decent score
    let baseScore = count > 0 ? (totalScore / count) : 0;

    // Boost score slightly if there are multiple active ingredients doing the job
    let finalScore = count > 0 ? Math.min(100, Math.round(baseScore + (count * 5))) : 0;

    return {
        goal: goal.goal_name,
        priority: goal.priority,
        score: finalScore,
        matchingIngredients
    };
}
