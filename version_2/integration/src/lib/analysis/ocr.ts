import { createWorker } from 'tesseract.js';

// Heading may appear as a bare section title ("INGREDIENTS" on its own line, no
// colon) or inline ("Ingredients: Aqua, Glycerin..."). Matching per-line (rather
// than requiring a colon or a single comma-dense line) handles both, plus labels
// whose ingredient list is wrapped across many narrow lines with 1-2 commas each.
const INGREDIENT_MARKERS = ['ingredients', 'ingredient', 'contains', 'composition'];
const STOP_MARKERS = [
    'directions', 'direction', 'how to use', 'usage',
    'warning', 'caution', 'keep out', 'address', 'made in',
    'manufactured', 'distributed', 'net wt', 'net weight',
    'storage', 'store', 'expiry', 'exp date', 'best before', 'effect'
];

export const extractIngredients = async (imageFile: File): Promise<string> => {
    const worker = await createWorker('eng');

    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();

    const lines = text.toLowerCase().split('\n').map(l => l.trim()).filter(Boolean);

    let headingLineIndex = -1;
    let inlineRemainder = '';
    outer: for (let i = 0; i < lines.length; i++) {
        for (const marker of INGREDIENT_MARKERS) {
            const idx = lines[i].indexOf(marker);
            if (idx !== -1) {
                headingLineIndex = i;
                inlineRemainder = lines[i].slice(idx + marker.length).replace(/^[:\s]+/, '');
                break outer;
            }
        }
    }

    let ingredientLines: string[];
    if (headingLineIndex !== -1) {
        ingredientLines = inlineRemainder ? [inlineRemainder] : [];
        for (let i = headingLineIndex + 1; i < lines.length; i++) {
            if (STOP_MARKERS.some(stop => lines[i].includes(stop))) break;
            ingredientLines.push(lines[i]);
        }
    } else {
        // No heading found: fall back to the longest run of consecutive
        // comma-containing lines (handles narrow-column wrapped labels).
        let bestRun: string[] = [];
        let currentRun: string[] = [];
        for (const line of lines) {
            if (line.includes(',')) {
                currentRun.push(line);
            } else {
                if (currentRun.length > bestRun.length) bestRun = currentRun;
                currentRun = [];
            }
        }
        if (currentRun.length > bestRun.length) bestRun = currentRun;
        ingredientLines = bestRun;
    }

    return ingredientLines
        .join(' ')
        .replace(/[^\w\s,()]/g, '')
        .trim();
};
