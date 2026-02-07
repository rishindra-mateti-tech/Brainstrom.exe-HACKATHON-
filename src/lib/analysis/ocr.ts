import { createWorker } from 'tesseract.js';

export const extractIngredients = async (imageFile: File): Promise<string> => {
    const worker = await createWorker('eng');

    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();

    // Extract only ingredients section
    const cleanedText = text.toLowerCase();

    // Find ingredients section (look for common headers)
    const ingredientMarkers = ['ingredients:', 'ingredient:', 'contains:', 'composition:'];
    let ingredientsSection = '';

    for (const marker of ingredientMarkers) {
        const markerIndex = cleanedText.indexOf(marker);
        if (markerIndex !== -1) {
            // Extract from marker onwards
            let startIndex = markerIndex + marker.length;
            let endText = cleanedText.substring(startIndex);

            // Find where ingredients section ends (common stop words)
            const stopMarkers = [
                'directions:', 'direction:', 'how to use:', 'usage:', 'use:',
                'warning:', 'caution:', 'keep out', 'address:', 'made in',
                'manufactured', 'distributed', 'net wt', 'net weight',
                'storage:', 'store', 'expiry', 'exp date', 'best before'
            ];

            let endIndex = endText.length;
            for (const stop of stopMarkers) {
                const stopIndex = endText.indexOf(stop);
                if (stopIndex !== -1 && stopIndex < endIndex) {
                    endIndex = stopIndex;
                }
            }

            ingredientsSection = endText.substring(0, endIndex);
            break;
        }
    }

    // If no marker found, try to extract likely ingredients (comma-separated words)
    if (!ingredientsSection) {
        const lines = cleanedText.split('\n');
        for (const line of lines) {
            // Check if line looks like ingredients (has multiple commas)
            if ((line.match(/,/g) || []).length >= 3) {
                ingredientsSection = line;
                break;
            }
        }
    }

    // Clean and return
    return ingredientsSection
        .replace(/\n/g, ' ')
        .replace(/[^\w\s,()]/g, '')
        .trim();
};
