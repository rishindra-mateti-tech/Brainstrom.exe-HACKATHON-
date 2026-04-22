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
    suitabilityScore: number;
    suitabilityExplanation: string;
    goalScore: number;
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
    let goalScore = 0;

    if (userGoals.length > 0) {
        goalEffectiveness = userGoals.map(goal => calculateGoalEffectiveness(
            goal,
            ingredientList,
            userProfile?.skin_type
        ));

        // Calculate goal-specific score based on priority weighting
        if (priorityMode && goalEffectiveness.length > 0) {
            goalScore = calculatePriorityWeightedScore(goalEffectiveness);
        } else if (goalEffectiveness.length > 0) {
            // Simple mode: average all goals equally
            goalScore = Math.round(goalEffectiveness.reduce((sum, g) => sum + g.score, 0) / goalEffectiveness.length);
        }
    }

    // Generate recommendations
    const recommendations = generateRecommendations(
        ingredientList,
        userGoals,
        goalEffectiveness
    );

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
