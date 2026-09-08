/* ============ AI 增强模块（DeepSeek 前端直连） ============
 * 保持纯静态零后端：浏览器直接 fetch DeepSeek 开放 API。
 * API Key 仅保存在本机浏览器 localStorage，不随作品上传、不外发。
 * 未配置 Key 时，各模块自动回退到内置统编版知识库。
 */
App.AI = (function () {
  var KEY_STORE = 'sjzs_ai_deepseek_key';

  /* ---- 轻量页内提示（避免原生 alert 阻断交互） ---- */
  var _toastTimer = null;
  function toast(msg, type) {
    var el = document.getElementById('aiToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'aiToast';
      el.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:9999;padding:12px 22px;border-radius:8px;font-family:var(--sans);font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,.18);transition:opacity .3s;max-width:82%;text-align:center';
      document.body.appendChild(el);
    }
    el.style.opacity = '1';
    el.style.background = (type === 'err' ? '#c0392b' : '#2f4a4e');
    el.style.color = '#fff';
    el.textContent = msg;
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 3800);
  }
  function toastOk(msg) { toast(msg, 'ok'); }
  function toastErr(msg) { toast(msg, 'err'); }
  var ENDPOINT = 'https://api.deepseek.com/chat/completions';
  var MODEL = 'deepseek-chat';

  function getKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } }
  function setKey(k) { try { localStorage.setItem(KEY_STORE, k); } catch (e) { } }
  function hasKey() { return !!getKey(); }

  /* ---- 设置面板 ---- */
  function settingsCard() {
    var on = hasKey();
    return '<div class="card ai-card">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
      '<span><b>🤖 AI 增强 · 任意课目自由生成</b> <span id="aiStatus" class="tag ' + (on ? 'tag-basic' : 'tag-lite') + '" style="margin-left:6px">' + (on ? '已接入 DeepSeek' : '未配置 Key') + '</span></span>' +
      '<button class="btn btn-sm btn-outline" onclick="App.AI.toggleSettings(this)">⚙ ' + (on ? '查看 / 更换 Key' : '配置 API Key') + '</button>' +
      '</div>' +
      '<div id="aiSettings" style="display:none;margin-top:12px">' +
      '<label class="fld">DeepSeek API Key（仅保存在本机浏览器，不上传作品）</label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<input type="password" id="aiKeyInput" placeholder="sk-…" style="flex:1;min-width:220px" value="' + (on ? getKey() : '') + '">' +
      '<button class="btn btn-green" onclick="App.AI.saveKey()">保存 Key</button>' +
      '<button class="btn btn-outline" onclick="App.AI.clearKey()">清除</button>' +
      '</div>' +
      '<p class="muted" style="margin-top:8px;line-height:1.7">' +
      '· 到 <a href="https://platform.deepseek.com" target="_blank" rel="noopener">DeepSeek 开放平台</a> 注册并申请 API Key（官方提供免费额度）<br>' +
      '· 配置后即可在下方自由输入<b>任意课目 / 知识点</b>，由 AI 生成教案或习题；未配置时自动使用内置统编版知识库（已收录课目）<br>' +
      '· Key 由 DeepSeek 计费，请按需使用；AI 生成内容仅供教学参考，请教师人工复核</p>' +
      '</div></div>';
  }
  function toggleSettings(btn) {
    var box = document.getElementById('aiSettings');
    var show = box.style.display === 'none';
    box.style.display = show ? 'block' : 'none';
    if (btn) btn.textContent = show ? '收起' : '⚙ 配置 API Key';
  }
  function saveKey() {
    var v = document.getElementById('aiKeyInput').value.trim();
    if (!v) { toastErr('请输入 API Key'); return; }
    setKey(v);
    var st = document.getElementById('aiStatus');
    if (st) { st.textContent = '已接入 DeepSeek'; st.className = 'tag tag-basic'; }
    toastOk('API Key 已保存在本机浏览器，可自由输入任意课目生成。');
  }
  function clearKey() {
    setKey('');
    var inp = document.getElementById('aiKeyInput'); if (inp) inp.value = '';
    var st = document.getElementById('aiStatus');
    if (st) { st.textContent = '未配置 Key'; st.className = 'tag tag-lite'; }
    toastOk('已清除 API Key，各模块将使用内置知识库。');
  }

  /* ---- 核心：调用 DeepSeek ---- */
  function chat(messages, onOk, onErr) {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify({ model: MODEL, messages: messages, temperature: 0.7, stream: false })
    }).then(function (res) {
      if (!res.ok) { return res.json().catch(function () { return {}; }).then(function (j) { throw new Error((j.error && j.error.message) || ('请求失败 HTTP ' + res.status)); }); }
      return res.json();
    }).then(function (data) {
      var txt = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      onOk(txt || '');
    }).catch(function (e) {
      if (onErr) onErr(e);
      else toastErr('AI 调用失败：' + e.message + '，请检查网络或 API Key。');
    });
  }

  /* ---- 从模型返回中提取 JSON（容忍 markdown 包裹 / 前后杂质） ---- */
  function extractJson(txt) {
    if (!txt) return null;
    var m = txt.match(/```json\s*([\s\S]*?)```/);
    if (m) txt = m[1];
    var start = txt.indexOf('{');
    var end = txt.lastIndexOf('}');
    if (start >= 0 && end > start) { txt = txt.slice(start, end + 1); }
    try { return JSON.parse(txt); } catch (e) { return null; }
  }

  /* ---- 智能备课：任意课目生成教案 ---- */
  function genLesson(topic, cb, errCb) {
    var sys = '你是一位资深的统编版初中历史教师与教研员，精通《义务教育历史课程标准（2022年版）》和历史学科五大核心素养（唯物史观、时空观念、史料实证、历史解释、家国情怀）。请为给定的课目设计一份结构完整、可直接用于课堂教学的教案。必须严格输出一个 JSON 对象，不要输出任何其他文字，格式如下：\n' +
      '{"name":"课目名称","book":"所属教材册次，如七年级上册","unit":"所属单元","curriculum":"对应的课标内容要求（尽量引用2022版课标原句）","goals":["素养导向教学目标1（含素养名称）","2","3","4"],"focus":"教学重点与难点","materials":[{"text":"史料原文（一句，须真实可考）","src":"史料出处，如《史记·商君列传》","level":"基础或提升或拓展","hint":"使用建议"}],"questionChain":["层层递进的问题1","2","3","4"],"homework":{"basic":"基础作业","mid":"提升作业","adv":"拓展作业"}}';
    var user = '课目：' + topic + '\n请按要求输出该课目的完整教案 JSON。史料请尽量使用真实、有据可考的文献原文并注明出处，若不确定出处请标注"待核验"。';
    chat([{ role: 'system', content: sys }, { role: 'user', content: user }], function (txt) {
      var obj = extractJson(txt);
      if (obj && obj.name) { cb(obj); }
      else { if (errCb) errCb('未能解析 AI 返回的教案（请重试）'); else toastErr('未能解析 AI 返回的教案，请重试。'); }
    }, errCb);
  }

  /* ---- 习题生成：任意课目 / 知识点生成习题 ---- */
  function genExam(topic, cb, errCb) {
    var sys = '你是一位初中历史命题专家。请根据给定的课目或知识点，命制一套覆盖"基础—提升—拓展"三个层级的分层练习题。必须严格输出一个 JSON 数组，不要输出任何其他文字，每道题格式如下：\n' +
      '[{"level":"basic或mid或adv","type":"选择或材料","liter":"核心素养，如史料实证","stem":"题目干","opts":["A选项","B选项","C选项","D选项"],"ans":"参考答案","points":["判分点1","判分点2"],"analysis":"解析","wrong":"高频错因标签"}]';
    var user = '知识点：' + topic + '\n请命制 6 道题（基础2道、提升2道、拓展2道），其中至少含 1 道材料分析题，输出 JSON 数组。';
    chat([{ role: 'system', content: sys }, { role: 'user', content: user }], function (txt) {
      var arr = extractJson(txt);
      if (Array.isArray(arr) && arr.length) { cb(arr); }
      else { if (errCb) errCb('未能解析 AI 返回的习题（请重试）'); else toastErr('未能解析 AI 返回的习题，请重试。'); }
    }, errCb);
  }

  /* ---- 生成结果渲染工具 ---- */
  function renderLesson(obj) {
    var mHtml = (obj.materials || []).map(function (m) {
      var lv = m.level === '提升' ? 'tag-mid' : (m.level === '拓展' ? 'tag-adv' : 'tag-basic');
      return '<div class="verdict"><b>「' + m.text + '」</b><br><span class="muted">出处：' + (m.src || '待核验') + ' · <span class="tag ' + lv + '">' + (m.level || '基础') + '</span>' + (m.hint ? ' 使用建议：' + m.hint : '') + '</span></div>';
    }).join('');
    var gHtml = (obj.goals || []).map(function (g) { return '<li style="margin:4px 0">' + g + '</li>'; }).join('');
    var qHtml = (obj.questionChain || []).map(function (q, i) { return '<li style="margin:4px 0">' + q + '</li>'; }).join('');
    return App.card('教案初稿 ·《' + obj.name + '》' + (obj.book ? '（' + obj.book + '）' : '') + ' <span class="tag tag-basic">AI 生成</span>',
      '<p class="kv"><b>课标依据：</b>' + (obj.curriculum || '—') + (obj.unit ? '<br><b>单元定位：</b>' + obj.unit : '') + '</p>' +
      '<div class="section-title">一、教学目标（素养导向）</div><ol style="padding-left:22px">' + gHtml + '</ol>' +
      '<div class="section-title">二、重难点</div><p>' + (obj.focus || '—') + '</p>' +
      '<div class="section-title">三、史料情境</div>' + mHtml +
      '<div class="section-title">四、问题链设计</div><ol style="padding-left:22px">' + qHtml + '</ol>' +
      '<div class="section-title">五、分层作业</div>' +
      '<p><span class="tag tag-basic">基础</span>' + (obj.homework ? obj.homework.basic : '—') + '</p>' +
      '<p><span class="tag tag-mid">提升</span>' + (obj.homework ? obj.homework.mid : '—') + '</p>' +
      '<p><span class="tag tag-adv">拓展</span>' + (obj.homework ? obj.homework.adv : '—') + '</p>' +
      '<div class="muted" style="margin-top:8px">⚠ AI 生成内容仅供参考，请教师依据教材与课标人工复核后使用。</div>'
    );
  }
  function renderExam(arr, topic) {
    var html = '';
    arr.forEach(function (q) {
      var lv = q.level === 'mid' ? 'tag-mid' : (q.level === 'adv' ? 'tag-adv' : 'tag-basic');
      html += '<div class="card"><p><span class="tag ' + lv + '">' + (q.level === 'mid' ? '提升' : q.level === 'adv' ? '拓展' : '基础') + '</span>' +
        '<span class="tag tag-lite">' + (q.type || '选择') + '</span><span class="tag tag-lite">素养：' + (q.liter || '历史解释') + '</span></p>' +
        '<p style="margin:8px 0"><b>' + q.stem + '</b></p>';
      if (q.opts && q.opts.length) {
        html += '<p style="font-family:var(--sans);font-size:13.5px">' + q.opts.map(function (o, j) { return String.fromCharCode(65 + j) + '. ' + o; }).join('　　') + '</p>';
      }
      html += '<details style="margin-top:6px"><summary style="cursor:pointer;font-family:var(--sans);font-size:13px;color:var(--green)">查看判分点 / 答案 / 解析</summary>' +
        '<div class="verdict ok" style="margin-top:8px"><b>参考答案：</b>' + q.ans + '<br><b>判分点：</b><ul style="padding-left:18px">' + (q.points || []).map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<b>解析：</b>' + q.analysis + (q.wrong ? '<br><b>高频错因标签：</b>' + q.wrong : '') + '</div></details></div>';
    });
    return App.card('AI 生成习题 ·「' + topic + '」 <span class="tag tag-basic">AI 生成</span>', html);
  }

  return {
    toastOk: toastOk,
    toastErr: toastErr,
    hasKey: hasKey,
    settingsCard: settingsCard,
    toggleSettings: toggleSettings,
    saveKey: saveKey,
    clearKey: clearKey,
    genLesson: genLesson,
    genExam: genExam,
    renderLesson: renderLesson,
    renderExam: renderExam
  };
})();
