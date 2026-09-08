/* ============ 史鉴智师 · 路由与公共工具 ============ */
var App = {};
App.pages = {};

App.navGroups = [
  { label: '首页', route: 'home' },
  { group: '教学辅助', items: [
    { label: '智能备课', route: 'prep' },
    { label: '习题生成', route: 'exam' },
    { label: '家校沟通', route: 'family' }
  ]}
];

App.renderNav = function (active) {
  var html = '';
  App.navGroups.forEach(function (g) {
    if (g.route) {
      html += '<a href="#/' + g.route + '" class="' + (active === g.route ? 'active' : '') + '">' + g.label + '</a>';
    } else {
      html += '<div class="nav-group"><span class="nav-group-label">' + g.group + '</span>';
      g.items.forEach(function (it) {
        html += '<a href="#/' + it.route + '" class="' + (active === it.route ? 'active' : '') + '">' + it.label + '</a>';
      });
      html += '</div>';
    }
  });
  document.getElementById('navLinks').innerHTML = html;
};

App.go = function (route) { location.hash = '#/' + route; };

App.route = function () {
  var hash = location.hash.replace(/^#\/?/, '') || 'home';
  var route = hash.split('?')[0];
  var page = App.pages[route] || App.pages['home'];
  App.renderNav(route);
  var main = document.getElementById('app');
  main.innerHTML = '';
  window.scrollTo(0, 0);
  try {
    page.render(main);
  } catch (e) {
    main.innerHTML = '<div class="card"><h3>页面加载出错</h3><p class="muted">' + (e && e.message ? e.message : e) + '</p></div>';
  }
};

/* ---------- 公共片段 ---------- */
App.pageHead = function (title, desc, crumbRole) {
  return '<div class="page-head fade-in"><div class="crumb"><b>' + crumbRole + '</b> · 史鉴智师</div>' +
    '<h1>' + title + '</h1><p>' + desc + '</p></div>';
};
App.card = function (title, inner, num) {
  return '<div class="card fade-in"><h3>' + (num ? '<span class="num">' + num + '</span>' : '') + title + '</h3>' + inner + '</div>';
};
App.thinking = function (id, text) {
  return '<div class="thinking" id="' + id + '"><span class="dots"><i></i><i></i><i></i></span><span>' + text + '</span></div>';
};
App.showThinking = function (id, ms, steps, done) {
  var el = document.getElementById(id);
  if (!el) { done(); return; }
  el.classList.add('show');
  var txt = el.querySelector('span:last-child');
  var i = 0;
  var timer = setInterval(function () {
    if (i < steps.length) { txt.textContent = steps[i]; i++; }
  }, ms / Math.max(steps.length, 1));
  setTimeout(function () {
    clearInterval(timer);
    el.classList.remove('show');
    done();
  }, ms);
};
App.flowSteps = function (id, steps) {
  var html = '<div class="flow-steps" id="' + id + '">';
  steps.forEach(function (s, i) {
    html += '<span class="flow-step" data-i="' + i + '">' + (i + 1) + '. ' + s + '</span>';
  });
  return html + '</div>';
};
App.markSteps = function (id, upto) {
  var box = document.getElementById(id);
  if (!box) return;
  var steps = box.querySelectorAll('.flow-step');
  steps.forEach(function (el, i) {
    el.className = 'flow-step' + (i < upto ? ' done' : (i === upto ? ' on' : ''));
  });
};
App.knowledgeTag = function (lessonId) {
  var l = KB.lessonById(lessonId);
  return l ? '<span class="tag tag-lite">' + l.book + '</span><span class="tag tag-ochre">' + l.name + '</span>' : '';
};

/* ---------- Word 导出（浏览器本地生成） ---------- */
App.exportWord = function (filename, title, bodyHtml) {
  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="zh-CN">' +
    '<head><meta charset="utf-8"><title>' + title + '</title>' +
    '<style>body{font-family:"宋体",serif;line-height:1.8;font-size:12pt;color:#222}' +
    'h1{font-family:"黑体";font-size:18pt;color:#8C4A2F}h2{font-family:"黑体";font-size:14pt;color:#5E2F1B}' +
    'table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;font-size:10.5pt}' +
    'th{background:#F2E6D4}.tip{color:#666;font-size:10pt}</style></head><body>' +
    '<h1>' + title + '</h1><p class="tip">史鉴智师 · 初中历史教学智能体生成 · ' + new Date().toLocaleDateString('zh-CN') + '</p><hr>' + bodyHtml + '</body></html>';
  var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};
App.copyText = function (text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  if (btn) {
    var old = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(function () { btn.textContent = old; }, 1600);
  }
};

window.addEventListener('hashchange', App.route);
window.addEventListener('DOMContentLoaded', App.route);
