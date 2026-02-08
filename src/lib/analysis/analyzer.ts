export interface AnalysisResult {
    score: number;
    explanation: string;
    warnings: string[];
    highlights: string[];
    categories: {
        name: string;
        ingredients: string[];
        color: string;
    }[];
}

export const analyzeIngredients = (
    ingredients: string,
    userProfile: any,
    allergies: string[],
    history: any[]
): AnalysisResult => {
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    let score = 85; // Base score
    const warnings: string[] = [];
    const highlights: string[] = [];

    // 1. Allergy Check
    allergies.forEach(allergy => {
        if (ingredientList.some(i => i.includes(allergy.toLowerCase()))) {
            score -= 30;
            warnings.push(`Contains ${allergy}, which you are allergic to.`);
        }
    });

    // 2. Skin Type Check
    if (userProfile?.skin_type === 'dry') {
        if (ingredientList.some(i => i.includes('alcohol'))) {
            score -= 15;
            warnings.push("Contains drying alcohols which may worsen your dry skin.");
        }
    }

    if (userProfile?.skin_type === 'oily') {
        if (ingredientList.some(i => i.includes('oil'))) {
            score -= 5;
            warnings.push("Contains oils that may contribute to congestion.");
        }
    }

    // 3. History Check (Memory)
    history.forEach(feedback => {
        if (feedback.reaction === 'irritation' && ingredientList.includes(feedback.ingredient_name.toLowerCase())) {
            score -= 40;
            warnings.push(`Contains ${feedback.ingredient_name}, which you previously reported as irritating.`);
        }
        if (feedback.reaction === 'worked_well' && ingredientList.includes(feedback.ingredient_name.toLowerCase())) {
            score += 5;
            highlights.push(`Includes ${feedback.ingredient_name}, which worked well for you before.`);
        }
    });

    // 4. Climate Logic
    if (userProfile?.current_season === 'Winter' && userProfile?.climate_type === 'Continental') {
        if (!ingredientList.some(i => i.includes('glycerin') || i.includes('hyaluronic'))) {
            score -= 10;
        }
    }

    const categories = [
        { name: 'Humectants', keywords: ['glycerin', 'hyaluronic', 'propanediol', 'panthenol'], color: 'bg-cyan-100 text-cyan-700' },
        { name: 'Soothing', keywords: ['centella', 'aloe', 'allantoin', 'bisabolol'], color: 'bg-green-100 text-green-700' },
        { name: 'Actives', keywords: ['niacinamide', 'retinol', 'vitamin c', 'salicylic'], color: 'bg-teal-100 text-teal-700' },
        { name: 'Barrier', keywords: ['ceramide', 'cholesterol', 'fatty acid', 'squalane'], color: 'bg-orange-100 text-orange-700' },
    ];

    const detectedCategories = categories.map(cat => ({
        ...cat,
        ingredients: ingredientList.filter(i => cat.keywords.some(k => i.includes(k)))
    })).filter(c => c.ingredients.length > 0);

    // Significance Penalty: If no known functional categories are found, it's likely not a good skincare match
    if (detectedCategories.length === 0) {
        score -= 60;
        warnings.push("No key functional skincare ingredients identified.");
    }

    // Final score clamping
    score = Math.max(0, Math.min(100, score));

    // Generate explanation based on final score
    let explanation = "";
    if (score >= 80) {
        explanation = "Excellent match! This product aligns very well with your skin profile.";
    } else if (score >= 60) {
        explanation = "Good choice. This product should work well for you with minor considerations.";
    } else if (score >= 40) {
        explanation = "Acceptable. This product has some ingredients you might want to monitor.";
    } else if (score >= 20) {
        explanation = "⚠️ Caution: This product has several conflicts with your skin profile or history.";
    } else {
        explanation = "❌ Not recommended. This product contains multiple problematic ingredients for your skin.";
    }

    return {
        score,
        explanation,
        warnings,
        highlights,
        categories: detectedCategories
    };
};
