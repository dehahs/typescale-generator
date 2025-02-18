// Initialize WebFont Loader
function loadFont(fontFamily) {
    WebFont.load({
        google: {
            families: [fontFamily]
        }
    });
}

// Initial font load
loadFont('Inter');

// Generate scale values
function generateScale(base, ratio) {
    const scales = [];
    let current = base;
    
    // Generate smaller sizes
    for (let i = -1; i >= -2; i--) {
        scales.unshift({
            size: current / Math.pow(ratio, Math.abs(i)),
            level: i
        });
    }
    
    // Add base size
    scales.push({
        size: base,
        level: 0
    });
    
    // Generate larger sizes
    for (let i = 1; i <= 5; i++) {
        scales.push({
            size: current * Math.pow(ratio, i),
            level: i
        });
    }
    
    return scales;
}

// Generate design tokens in W3C format
function generateDesignTokens(scales, fontFamily) {
    const typeStyles = scales.reduce((acc, scale) => {
        const name = scale.level === 0 ? "base" : 
                    scale.level < 0 ? `small-${Math.abs(scale.level)}` :
                    `large-${scale.level}`;
        
        acc[`type-scale-${name}`] = {
            "$type": "typography",
            "$value": {
                "fontFamily": fontFamily,
                "fontSize": {
                    "value": scale.size,
                    "unit": "rem"
                },
                "fontWeight": 400,
                "letterSpacing": {
                    "value": 0,
                    "unit": "px"
                },
                "lineHeight": 1.5
            }
        };
        return acc;
    }, {});

    return {
        "$schema": "https://tr.designtokens.org/format/",
        "typeStyles": typeStyles
    };
}

// Update the preview
function updatePreview() {
    const fontFamily = document.getElementById('font-family').value;
    const baseSize = parseFloat(document.getElementById('base-size').value);
    const ratio = parseFloat(document.getElementById('scale').value);
    
    // Load new font if changed
    loadFont(fontFamily);
    
    // Update CSS variables
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty('--base-size', `${baseSize}rem`);
    document.documentElement.style.setProperty('--scale-ratio', ratio);
    
    // Generate scale values
    const scales = generateScale(baseSize, ratio);
    
    // Update preview
    const typeSamples = document.getElementById('type-samples');
    typeSamples.innerHTML = scales.map(scale => {
        const label = scale.level === 0 ? "Base" : 
                     scale.level < 0 ? `Small ${Math.abs(scale.level)}` :
                     `Large ${scale.level}`;
        return `
            <div>
                <span>${label} - ${scale.size.toFixed(3)}rem</span>
                <div style="font-size: ${scale.size}rem">
                    The quick brown fox jumps over the lazy dog
                </div>
            </div>
        `;
    }).join('');
    
    // Generate and display design tokens
    const tokens = generateDesignTokens(scales, fontFamily);
    document.getElementById('design-tokens').textContent = JSON.stringify(tokens, null, 2);
}

// Copy tokens to clipboard
async function copyTokens() {
    const tokens = document.getElementById('design-tokens').textContent;
    try {
        await navigator.clipboard.writeText(tokens);
        const feedback = document.getElementById('copy-feedback');
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy tokens:', err);
    }
}

// Add event listeners
document.getElementById('font-family').addEventListener('change', updatePreview);
document.getElementById('base-size').addEventListener('input', updatePreview);
document.getElementById('scale').addEventListener('change', updatePreview);
document.getElementById('copy-tokens').addEventListener('click', copyTokens);

// Initial preview
updatePreview();
