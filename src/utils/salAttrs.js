/**
 * Sal.js fade attributes.
 * @param {boolean} [repeat] — fade in/out on scroll (data-sal-repeat); default one-time fade-in.
 */
export function salFadeAttrs(delay = 0, duration = 750, { repeat = false } = {}) {
  const attrs = {
    'data-sal': 'fade',
    'data-sal-duration': String(duration),
    'data-sal-delay': String(delay),
    'data-sal-easing': 'ease-out-cubic',
  }
  if (repeat) {
    attrs['data-sal-repeat'] = ''
    attrs['data-sal-threshold'] = '0.12'
  }
  return attrs
}
