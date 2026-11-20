function oklabToRgb(l: number, a_param: number, b_param: number): [number, number, number] {
  // Convert OKLAB to LMS
  const l_ = l + 0.3963377774 * a_param + 0.2158037573 * b_param;
  const m_ = l - 0.1055613458 * a_param - 0.0638541728 * b_param;
  const s_ = l - 0.0894841775 * a_param - 1.2914855480 * b_param;
  
  // Cube LMS to linear light LMS
  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;
  
  // Convert LMS to Linear RGB
  const r_lin = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const g_lin = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const b_lin = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;
  
  // Convert Linear RGB to sRGB with gamma correction
  const toSRGB = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };
  
  const r = Math.round(toSRGB(r_lin) * 255);
  const g = Math.round(toSRGB(g_lin) * 255);
  const b = Math.round(toSRGB(b_lin) * 255);
  
  return [r, g, b];
}

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // Convert h from degrees to radians
  const hRad = (h * Math.PI) / 180;
  
  // Convert OKLCH to OKLAB
  const a_coord = c * Math.cos(hRad);
  const b_coord = c * Math.sin(hRad);
  
  return oklabToRgb(l, a_coord, b_coord);
}

function parseAngle(str: string): number {
  const val = parseFloat(str);
  if (isNaN(val)) return 0;
  if (str.endsWith('rad')) {
    return (val * 180) / Math.PI;
  }
  if (str.endsWith('turn')) {
    return val * 360;
  }
  if (str.endsWith('grad')) {
    return (val * 180) / 200;
  }
  return val;
}

function parsePercentage(str: string, max: number): number {
  const val = parseFloat(str);
  if (isNaN(val)) return 0;
  if (str.endsWith('%')) {
    return (val / 100) * max;
  }
  return val;
}

function convertOklchToRgbString(match: string, content: string): string {
  try {
    const normalized = content.replace(/[\/,]/g, ' ').trim();
    const parts = normalized.split(/\s+/);
    if (parts.length < 3) return match;
    
    const l = parsePercentage(parts[0], 1);
    const c = parseFloat(parts[1]);
    const h = parseAngle(parts[2]);
    
    if (isNaN(l) || isNaN(c) || isNaN(h)) return match;
    
    let alpha = 1;
    if (parts.length >= 4) {
      const rawAlpha = parts[3];
      if (rawAlpha.endsWith('%')) {
        alpha = parseFloat(rawAlpha) / 100;
      } else {
        alpha = parseFloat(rawAlpha);
      }
      if (isNaN(alpha)) alpha = 1;
    }
    
    const rgb = oklchToRgb(l, c, h);
    if (alpha === 1) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    } else {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
  } catch (e) {
    console.error('Error parsing oklch color:', e);
    return match;
  }
}

function convertOklabToRgbString(match: string, content: string): string {
  try {
    const normalized = content.replace(/[\/,]/g, ' ').trim();
    const parts = normalized.split(/\s+/);
    if (parts.length < 3) return match;
    
    const l = parsePercentage(parts[0], 1);
    const a = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    
    if (isNaN(l) || isNaN(a) || isNaN(b)) return match;
    
    let alpha = 1;
    if (parts.length >= 4) {
      const rawAlpha = parts[3];
      if (rawAlpha.endsWith('%')) {
        alpha = parseFloat(rawAlpha) / 100;
      } else {
        alpha = parseFloat(rawAlpha);
      }
      if (isNaN(alpha)) alpha = 1;
    }
    
    const rgb = oklabToRgb(l, a, b);
    if (alpha === 1) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    } else {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
  } catch (e) {
    console.error('Error parsing oklab color:', e);
    return match;
  }
}

export async function runWithOklchCleanedStyles(callback: () => Promise<void>): Promise<void> {
  const originalGetComputedStyle = window.getComputedStyle;
  const originalDisables: { sheet: CSSStyleSheet; disabled: boolean }[] = [];
  let cssText = '';
  
  // Override window.getComputedStyle to intercept html2canvas style reading
  window.getComputedStyle = function(elt: Element, pseudoElt?: string | null) {
    const style = originalGetComputedStyle(elt, pseudoElt);
    return new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return function(propertyName: string) {
            const value = target.getPropertyValue(propertyName);
            if (typeof value === 'string') {
              if (value.includes('oklch(')) {
                return value.replace(/oklch\(([^)]+)\)/gi, (match, content) => {
                  return convertOklchToRgbString(match, content);
                });
              }
              if (value.includes('oklab(')) {
                return value.replace(/oklab\(([^)]+)\)/gi, (match, content) => {
                  return convertOklabToRgbString(match, content);
                });
              }
            }
            return value;
          };
        }
        
        const value = (target as any)[prop];
        if (typeof value === 'function') {
          return value.bind(target);
        }
        if (typeof value === 'string') {
          if (value.includes('oklch(')) {
            return value.replace(/oklch\(([^)]+)\)/gi, (match, content) => {
              return convertOklchToRgbString(match, content);
            });
          }
          if (value.includes('oklab(')) {
            return value.replace(/oklab\(([^)]+)\)/gi, (match, content) => {
              return convertOklabToRgbString(match, content);
            });
          }
        }
        return value;
      }
    });
  };

  // Traverse all stylesheets and extract CSS rules
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    try {
      if (sheet.cssRules) {
        let sheetText = '';
        for (let j = 0; j < sheet.cssRules.length; j++) {
          sheetText += sheet.cssRules[j].cssText + '\n';
        }
        cssText += sheetText;
        originalDisables.push({ sheet, disabled: sheet.disabled });
        sheet.disabled = true;
      }
    } catch (e) {
      console.warn('Could not read cssRules from stylesheet:', sheet.href, e);
    }
  }
  
  // Clean oklch/oklab and inject sanitized styles
  const cleanStyleTag = document.createElement('style');
  cleanStyleTag.id = 'pdf-clean-tailwind-style';
  
  let cleanedCssText = cssText.replace(/oklch\(([^)]+)\)/gi, (match, content) => {
    return convertOklchToRgbString(match, content);
  });
  
  cleanedCssText = cleanedCssText.replace(/oklab\(([^)]+)\)/gi, (match, content) => {
    return convertOklabToRgbString(match, content);
  });
  
  cleanStyleTag.textContent = cleanedCssText;
  document.head.appendChild(cleanStyleTag);
  
  try {
    await callback();
  } finally {
    // Restore original window.getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
    
    // Restore original stylesheets
    cleanStyleTag.remove();
    originalDisables.forEach(({ sheet, disabled }) => {
      sheet.disabled = disabled;
    });
  }
}
