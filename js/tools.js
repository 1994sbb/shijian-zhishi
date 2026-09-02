/* ============ 插件：时间轴 + 家校沟通 ============ */

/* ---------------- 历史时间轴插件 ---------------- */
App.pages.timeline = {
  state: { mode: 'ancient', sel: -1 },
  render: function (main) {
    var s = this.state;
    var data = KB.timeline[s.mode];
    var nodes = data.map(function (d, i) {
      return '<div class="tl-node ' + (s.sel === i ? 'sel' : '') + '" onclick="App.pages.timeline.sel(' + i + ')">' +
        '<div class="nm">' + d.name + '</div><div class="yr">' + d.year + '</div><div class="dot"></div></div>';
    }).join('');
    var detail = '';
    if (s.sel >= 0) {
      var d = data[s.sel];
      detail = App.card('【' + d.name + '】（' + d.year + '）',
        '<p class="kv"><b>统编教材定位：</b><span class="tag tag-ochre">' + d.book + '</span></p>' +
        '<div class="section-title" style="font-size:16px">关联大事</div>' +
        '<ul style="padding-left:22px">' + d.events.map(function (e) { return '<li style="margin:4px 0">' + e + '</li>'; }).join('') + '</ul>' +
        '<p class="muted">✓ 已同步至时间轴记忆卡：按朝代顺序每日滚动复习 5 张。</p>');
    } else {
      detail = '<div class="card"><p class="muted">点击任一朝代 / 事件，查看大事与教材定位。时间轴是治疗"时序错乱"的第一味药。</p></div>';
    }
    main.innerHTML =
      App.pageHead('历史时间轴插件', '朝代轴 + 近代大事轴双模式，直击"时序错乱"类错因（占班级失分归因的 15%）', '插件') +
      App.card('模式切换',
        '<button class="btn ' + (s.mode === 'ancient' ? '' : 'btn-outline') + ' btn-sm" onclick="App.pages.timeline.switch(\'ancient\')">古代朝代轴（七年级）</button> ' +
        '<button class="btn ' + (s.mode === 'modern' ? '' : 'btn-outline') + ' btn-sm" onclick="App.pages.timeline.switch(\'modern\')">中国近代大事轴（八年级）</button>') +
      '<div class="card"><div class="tl-track"><div class="tl-line"></div><div class="tl-items">' + nodes + '</div></div></div>' +
      '<div id="tlDetail">' + detail + '</div>';
  },
  switch: function (mode) { this.state = { mode: mode, sel: -1 }; this.render(document.getElementById('app')); },
  sel: function (i) { this.state.sel = i; this.render(document.getElementById('app')); }
};

/* ---------------- 家校沟通插件 ---------------- */
App.pages.family = {
  render: function (main) {
    var tpls = KB.familyTemplates;
    var cards = tpls.map(function (t, i) {
      return '<div class="card role-card" style="text-align:left" onclick="App.pages.family.pick(' + i + ')">' +
        '<h4>' + t.name + '</h4><p class="muted">' + t.desc + '</p></div>';
    }).join('');
    main.innerHTML =
      App.pageHead('家校沟通插件', '把学情数据转写成家长听得懂的话：三档模板自动生成，一键复制到班级群', '插件') +
      '<div class="grid grid-3">' + cards + '</div>' +
      '<div class="card" id="familyEditor">' +
      '<h3>生成文案</h3>' +
      '<div class="grid grid-3">' +
      '<div><label class="fld">班级</label><input type="text" id="fClazz" value="八年级（3）班" style="width:100%"></div>' +
      '<div><label class="fld">落款教师</label><input type="text" id="fTeacher" value="李老师" style="width:100%"></div>' +
      '<div><label class="fld">日期</label><input type="text" id="fDate" value="2026 年 9 月" style="width:100%"></div>' +
      '</div>' +
      '<div style="margin:14px 0 8px"><label class="fld">模板</label><select id="fTpl" style="width:100%">' +
      tpls.map(function (t, i) { return '<option value="' + i + '">' + t.name + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn" onclick="App.pages.family.gen()">生成文案</button> ' +
      '<button class="btn btn-outline" onclick="App.pages.family.copy()">复制全文</button>' +
      '<p class="muted" style="margin-top:10px">提示：文案中的学情表述来自"学情分析"页的汇总数据（个体明细已脱敏），符合未成年人隐私保护要求。</p>' +
      '<textarea id="fOut" style="width:100%;min-height:280px;margin-top:10px;font-size:13.5px" placeholder="点击"生成文案"…"></textarea>' +
      '</div>';
    this.gen();
  },
  pick: function (i) { document.getElementById('fTpl').value = String(i); this.gen(); },
  vals: function () {
    return { clazz: document.getElementById('fClazz').value, teacher: document.getElementById('fTeacher').value, date: document.getElementById('fDate').value };
  },
  gen: function () {
    var i = parseInt(document.getElementById('fTpl').value, 10);
    var text = KB.familyTemplates[i].build(this.vals());
    document.getElementById('fOut').value = text;
  },
  copy: function () {
    var out = document.getElementById('fOut');
    if (!out.value) { out.placeholder = '请先生成文案'; return; }
    var btn = event && event.target;
    App.copyText(out.value, btn);
  }
};
