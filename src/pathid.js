// Injected into the scene page so actors without data-om-id still get a
// deterministic identifier. Derived from the behaviour of OpenMotion's
// buildElementPathIdScript; reimplemented here in original form.
export const PATH_ID_SOURCE = `
function omSegmentName(el, parent) {
  var index = 0;
  if (parent) {
    for (var i = 0; i < parent.children.length; i += 1) {
      if (parent.children[i] === el) { index = i; break; }
    }
  }
  var tag = el.tagName.toLowerCase();
  var cls = el.className && typeof el.className === 'string'
    ? el.className.trim().split(/\\s+/)[0] : '';
  return cls ? tag + '.' + cls + '@' + index : tag + '@' + index;
}

function omPathId(el) {
  if (!el) return '';
  var direct = el.getAttribute && el.getAttribute('data-om-id');
  if (direct) return direct;
  var parts = [];
  var node = el;
  while (node && !(node.classList && node.classList.contains('frame'))) {
    parts.unshift(omSegmentName(node, node.parentElement));
    node = node.parentElement;
  }
  return 'om/' + parts.join('/');
}

function omFindElementByPathId(frame, pathId) {
  var trimmed = String(pathId || '').trim();
  if (!trimmed || !frame) return null;
  if (trimmed.slice(0, 3) !== 'om/') {
    var direct = frame.querySelectorAll('[data-om-id]');
    for (var d = 0; d < direct.length; d += 1) {
      if (direct[d].getAttribute('data-om-id') === trimmed) return direct[d];
    }
    return null;
  }
  var segments = trimmed.slice(3).split('/');
  var current = frame;
  for (var s = 0; s < segments.length; s += 1) {
    var match = segments[s].match(/^(.+)@(\\d+)$/);
    if (!match) return null;
    var rawName = match[1];
    var index = Number(match[2]);
    var child = current.children.item ? current.children.item(index) : current.children[index];
    if (!child) return null;
    var dot = rawName.indexOf('.');
    var tag = dot >= 0 ? rawName.slice(0, dot) : rawName;
    var className = dot >= 0 ? rawName.slice(dot + 1) : '';
    if (child.tagName.toLowerCase() !== tag) return null;
    if (className) {
      var childClass = child.className && typeof child.className === 'string'
        ? child.className.trim().split(/\\s+/)[0] : '';
      if (childClass !== className) return null;
    }
    current = child;
  }
  return current === frame ? null : current;
}
`;

export function loadPathIdHelpers() {
  return new Function(`${PATH_ID_SOURCE}\nreturn { omSegmentName, omPathId, omFindElementByPathId };`)();
}
