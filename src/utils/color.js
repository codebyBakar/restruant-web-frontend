export function tagTone(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { bg: "rgba(227,160,8,.16)", text: "#8a5f02" };
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  const hue = Math.round(h);
  return {
    bg: `hsl(${hue}, 55%, 88%)`,
    text: `hsl(${hue}, 65%, 36%)`,
  };
}
