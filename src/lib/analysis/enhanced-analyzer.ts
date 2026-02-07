// Enhanced Analyzer with Goals Support
// This extends the base analyzer with priority-weighted goal-based scoring

import { AnalysisResult, analyzeIngredients } from './analyzer';
import {
    INGREDIENT_KNOWLEDGE,
    getIngredientBenefit,
    getRecommendedIngredients
} from './ingredient-knowledge';

export interface GoalEffectiveness {
    goal: string;
    priority: number;
    score: number; // 0-100
    matchingIngredients: Array<{
        name: string;
        effectiveness: number;
        reason: string;
    }>;
}

export interface PersonalizedInsight {
    ingredient: string;
    benefit: string;
    isPositive: boolean;
}

export interface ProductRecommendation {
    type: 'great' | 'consider' | 'missing';
    title: string;
    description: string;
    ingredients?: string[];
}

export interface EnhancedAnalysisResult extends AnalysisResult {
    extractedIngredients: string[];
    personalizedInsights: PersonalizedInsight[];
    goalEffectiveness?: GoalEffectiveness[];
    recommendations: ProductRecommendation[];
}

export interface UserGoal {
    goal_name: string;
    priority: number;
}

export const analyzeIngredientsWithGoals = (
    ingredients: string,
    userProfile: any,
    allergies: string[],
    history: any[],
    userGoals: UserGoal[],
    priorityMode: boolean
): EnhancedAnalysisResult => {
    // Get base analysis first
    const baseAnalysis = analyzeIngredients(ingredients, userProfile, allergies, history);

    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    const extractedIngredients = ingredientList;

    // Generate personalized insights
    const personalizedInsights = generatePersonalizedInsights(
        ingredientList,
        userProfile
    );

    // Calculate goal effectiveness if goals are set
    let goalEffectiveness: GoalEffectiveness[] | undefined;
    let finalScore = baseAnalysis.score;

    if (userGoals.length > 0) {
        goalEffectiveness = userGoals.map(goal => calculateGoalEffectiveness(
            goal,
            ingredientList,
            userProfile?.skin_type
        ));

        // Recalculate score based on priority weighting if in priority mode
        if (priorityMode && goalEffectiveness.length > 0) {
            finalScore = calculatePriorityWeightedScore(
                goalEffectiveness,
                baseAnalysis.score
            );
        } else {
            // Simple mode: just use the first goal's effectiveness
            finalScore = goalEffectiveness[0]?.score || baseAnalysis.score;
        }
    }

    // Generate recommendations
    const recommendations = generateRecommendations(
        ingredientList,
        userGoals,
        goalEffectiveness
    );

    return {
        ...baseAnalysis,
        score: finalScore,
        extractedIngredients,
        personalizedInsights,
        goalEffectiveness,
        recommendations
    };
};

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
    goalEffectiveness: GoalEffectiveness[],
    baseScore: number
): number {
    // Priority weights based on user specifications
    // P1 = 50%, P2 = 37%, P3 = 13%
    const weights = { 1: 0.50, 2: 0.37, 3: 0.13 };

    let weightedSum = 0;

    // Calculate weighted sum: sum(score × weight) for each priority
    goalEffectiveness.forEach(ge => {
        const weight = weights[ge.priority as keyof typeof weights] || 0;
        weightedSum += ge.score * weight;
    });

    // The weighted sum IS the final score (no division needed in weighted average)
    // Example: P1=100 (×0.50) + P2=20 (×0.37) + P3=19 (×0.13) = 50 + 7.4 + 2.47 = 59.87
    const goalScore = Math.round(weightedSum);

    // Blend goal score (80%) with base compatibility score (20%) for safety checks
    const finalScore = Math.round((goalScore * 0.8) + (baseScore * 0.2));

    return Math.max(0, Math.min(100, finalScore));
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
