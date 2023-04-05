var newColormap;

document.getElementById('color1').value = getRandomColor();
document.getElementById('color2').value = getRandomColor();
window.addEventListener('DOMContentLoaded', () => {
    const colorForm = document.getElementById('colorForm');
    onClick();
});

const colorInputs = document.querySelectorAll('#color1, #color2');
const numStepsInput = document.querySelector('#numSteps');
const colorSpaceRadios = document.querySelectorAll('input[name="colorSpace"]');
const interpolationRadios = document.querySelectorAll('input[name="interpolation"]');
const outputStyleRadios = document.querySelectorAll('input[name="outputStyle"]');
const pinpongRadios = document.querySelectorAll('input[name="pingPong"]');
const randomizeButton = document.querySelector('#randomizeButton');
const swapColorsButton = document.querySelector('#swapColorsButton');
const numStepsSlider = document.getElementById("numStepsSlider");

numSteps.addEventListener('input', () => {
    numStepsSlider.value = numSteps.value;
    onClick();
});

numStepsSlider.addEventListener('input', () => {
    numSteps.value = numStepsSlider.value;
    onClick();
});

colorInputs.forEach(input => {
    input.addEventListener('change', onClick);
});

numStepsInput.addEventListener('change', onClick);

colorSpaceRadios.forEach(radio => {
    radio.addEventListener('change', onClick);
});

pinpongRadios.forEach(radio => {
    radio.addEventListener('change', onClick);
});

interpolationRadios.forEach(radio => {
    radio.addEventListener('change', onClick);
});

outputStyleRadios.forEach(radio => {
    radio.addEventListener('change', onClick);
});

randomizeButton.addEventListener('click', () => {
    document.getElementById("color1").value = getRandomColor();
    document.getElementById("color2").value = getRandomColor();
    onClick();
});

document.getElementById("swapColorsButton").addEventListener("click", swapColors);
document.getElementById("copyButton").addEventListener("click", function () {
    const outputTextArea = document.getElementById("outputTextArea");
    outputTextArea.select();
    document.execCommand("copy");
    alert("Copied the text: " + outputTextArea.value);
});

// update and display
function onClick() {
    const color1 = document.getElementById("color1").value;
    const color2 = document.getElementById("color2").value;
    const numSteps = parseInt(document.getElementById("numSteps").value);
    const outputStyle = document.querySelector('input[name="outputStyle"]:checked').value;
    const colorSpace = document.querySelector('input[name="colorSpace"]:checked').value;
    const interpMethod = document.querySelector('input[name="interpolation"]:checked').value;
    const pingPong = document.getElementById("pingPongOn").checked;


    const colorMapDiv = document.getElementById("colorMap");
    const grayScaleMapDiv = document.getElementById("grayScaleMap");
    const lightnessMapDiv = document.getElementById("lightnessMap");

    colorMapDiv.innerHTML = "";
    grayScaleMapDiv.innerHTML = "";
    lightnessMapDiv.innerHTML = "";

    const colors = [];
    for (let i = 0; i < numSteps; i++) {
        const color = interpolateColors(color1, color2, i / (numSteps - 1), colorSpace, interpMethod, pingPong);
        colors.push(color);

        const [r, g, b] = hexToRgb(color);
        const [, , l] = rgbToHsl(color);

        const grayValue = Math.round((r + g + b) / 3);
        const grayColor = rgbToHex(grayValue, grayValue, grayValue);

        const lightnessValue = Math.round(l * 255);
        const lightnessColor = rgbToHex(lightnessValue, lightnessValue, lightnessValue);

        const colorBox = document.createElement("div");
        const grayScaleBox = document.createElement("div");
        const lightnessBox = document.createElement("div");

        colorBox.className = grayScaleBox.className = lightnessBox.className = "colorBox";

        colorBox.style.backgroundColor = color;
        grayScaleBox.style.backgroundColor = grayColor;
        lightnessBox.style.backgroundColor = lightnessColor;

        colorMapDiv.appendChild(colorBox);
        grayScaleMapDiv.appendChild(grayScaleBox);
        lightnessMapDiv.appendChild(lightnessBox);
    }

    displayOutput(colors, outputStyle);
}

// create a random color
function getRandomColor() {
    const letters = '0000111223456789ABCDDEEEFFFF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 28)];
    }
    return color;
}

// swap colors
function swapColors() {
    const color1Input = document.getElementById("color1");
    const color2Input = document.getElementById("color2");
    const tempColor = color1Input.value;
    color1Input.value = color2Input.value;
    color2Input.value = tempColor;
    onClick();
}

// data interpolation 
function interpolateColors(color1, color2, factor, colorSpace, interpMethod, pingPong) {
    let c1, c2, interpolated;

    switch (colorSpace) {
        case "hsv":
            c1 = rgbToHsv(color1);
            c2 = rgbToHsv(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return hsvToRgb(interpolated);
        case "hsl":
            c1 = rgbToHsl(color1);
            c2 = rgbToHsl(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return hslToRgb(interpolated);
        case "lab":
            c1 = rgbToLab(color1);
            c2 = rgbToLab(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return labToRgb(interpolated);
        case "xyz":
            c1 = rgbToXyz(color1);
            c2 = rgbToXyz(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return xyzToRgb(interpolated);
        case "lch":
            c1 = rgbToLch(color1);
            c2 = rgbToLch(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return lchToRgb(interpolated);
        case "cmyk":
            c1 = rgbToCmyk(color1);
            c2 = rgbToCmyk(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return cmykToRgb(interpolated);
        default:
            c1 = hexToRgb(color1);
            c2 = hexToRgb(color2);
            interpolated = interpolateValues(c1, c2, factor, interpMethod, pingPong);
            return rgbToHex(interpolated[0], interpolated[1], interpolated[2]);; // Return RGB values directly
    }
}

// Interpolates between two values using the specified method
function interpolateValues(values1, values2, factor, method, pingPong) {
    if (pingPong) {
        factor = factor < 0.5 ? factor * 2 : 2 - factor * 2;
    }

    switch (method) {
        case 'linear':
            return values1.map((value, index) => value + factor * (values2[index] - value));
        case 'cubic':
            return values1.map((value, index) => {
                const scaledFactor = factor * 2 - 1;
                const adjustedFactor = scaledFactor ** 3 * 0.5 + 0.5;
                return value + adjustedFactor * (values2[index] - value);
            });
        case 'sin':
            return values1.map((value, index) => {
                const adjustedFactor = 0.5 - Math.cos(Math.PI * factor) * 0.5;
                return value + adjustedFactor * (values2[index] - value);
            });
        default:
            return values1.map((value, index) => value + factor * (values2[index] - value));
    }
}

// Convert a hex color string to an RGB array
function displayOutput(colors, outputStyle) {
    const expandedColors = expandColors(colors, 256);
    const outputTextArea = document.getElementById("outputTextArea");
    if (outputStyle === "python") {
        const pythonColors = expandedColors.map(color => `(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)})`);
        outputTextArea.value = `[${pythonColors.join(', ')}]`;
    }

    else if (outputStyle === "matlab") {
        const matlabColors = expandedColors.map(color => `[${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}]`);
        outputTextArea.value = matlabColors.join('; ');
    }
}

// Expand an array of colors to a target length
function expandColors(colors, targetLength) {
    const expandedColors = [];
    const inputLength = colors.length;

    for (let i = 0; i < targetLength; i++) {
        const inputIndex = Math.round((i / (targetLength - 1)) * (inputLength - 1));
        expandedColors.push(colors[inputIndex]);
    }

    return expandedColors;
}

// Convert an RGB array to a HEX string
function rgbToHex(r, g, b) {
    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

// Convert a HEX string to an RGB array
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
        : null;
}

// RGB to HSV conversion
function rgbToHsv(color) {
    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;

    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    }

    else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, v];
}

// HSV to RGB conversion
function hsvToRgb(hsv) {
    let h = hsv[0], s = hsv[1], v = hsv[2];
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    return `#${Math.round(r * 255).toString(16).padStart(2, "0")}${Math.round(g * 255).toString(16).padStart(2, "0")}${Math.round(b * 255).toString(16).padStart(2, "0")}`;
}

// RGB to HSL conversion
function rgbToHsl(color) {
    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    }

    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, l];
}

// HSL to RGB conversion
function hslToRgb(hsl) {
    let h = hsl[0], s = hsl[1], l = hsl[2];
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    }

    else {
        let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return `#${Math.round(r * 255).toString(16).padStart(2, "0")}${Math.round(g * 255).toString(16).padStart(2, "0")}${Math.round(b * 255).toString(16).padStart(2, "0")}`;
}

// RGB to LAB conversion
function rgbToLab(color) {
    const xyz = rgbToXyz(color);
    return xyzToLab(xyz);
}

// LAB to RGB conversion
function labToRgb(lab) {
    const xyz = labToXyz(lab);
    const rgb = xyzToRgb(xyz);
    return rgb;
}

// RGB to XYZ conversion
function rgbToXyz(color) {
    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;

    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return [x, y, z];
}


// XYZ to LAB conversion
function xyzToLab(xyz) {
    let [x, y, z] = xyz;
    x /= 95.047;
    y /= 100.0;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : (903.3 * x + 16) / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : (903.3 * y + 16) / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : (903.3 * z + 16) / 116;

    let L = 116 * y - 16;
    let a = 500 * (x - y);
    let b = 200 * (y - z);

    return [L, a, b];
}

// LAB to XYZ conversion
function labToXyz(lab) {
    let [L, a, b] = lab;
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    let x3 = x * x * x;
    let y3 = y * y * y;
    let z3 = z * z * z;

    x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
    y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
    z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

    x *= 95.047;
    y *= 100.0;
    z *= 108.883;

    return [x, y, z];
}

// XYZ to RGB conversion
function xyzToRgb(xyz) {
    let [x, y, z] = xyz;
    x /= 100;
    y /= 100;
    z /= 100;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);

    return `#${Math.round(r * 255).toString(16).padStart(2, "0")}${Math.round(g * 255).toString(16).padStart(2, "0")}${Math.round(b * 255).toString(16).padStart(2, "0")}`;
}

// RGB to LCH conversion
function rgbToLch(color) {
    const lab = rgbToLab(color);
    return labToLch(lab);
}

// LCH to RGB conversion
function lchToRgb(lch) {
    const lab = lchToLab(lch);
    return labToRgb(lab);
}

// RGB to CMYK conversion
function rgbToCmyk(color) {
    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    let k = Math.min(1 - r, 1 - g, 1 - b);
    let c = (1 - r - k) / (1 - k);
    let m = (1 - g - k) / (1 - k);
    let y = (1 - b - k) / (1 - k);

    return [c, m, y, k];
}

// CMYK to RGB conversion
function cmykToRgb(cmyk) {
    let [c, m, y, k] = cmyk;

    let r = 255 * (1 - c) * (1 - k);
    let g = 255 * (1 - m) * (1 - k);
    let b = 255 * (1 - y) * (1 - k);

    return rgbToHex(r, g, b);
}

// LAB to LCH conversion
function labToLch(lab) {
    let [l, a, b] = lab;
    let c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) h += 360;
    return [l, c, h];
}

// LCH to LAB conversion
function lchToLab(lch) {
    let [l, c, h] = lch;
    h = (h * Math.PI) / 180;
    let a = c * Math.cos(h);
    let b = c * Math.sin(h);
    return [l, a, b];
}
