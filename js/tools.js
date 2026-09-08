/* ============ 插件：家校沟通（内置模板 + AI 增强） ============ */

/* ---------------- 家校沟通插件 ---------------- */
App.pages.family = {
  render: function (main) {
    var tpls = KB.familyTemplates;
    var cards = tpls.map(function (t, i) {
      return '<div class="card role-card" style="text-align:left" onclick="App.pages.family.pick(' + i + ')">' +
        '<h4>' + t.name + '</h4><p class="muted">' + t.desc + '</p></div>';
    }).join('');
    main.innerHTML =
      App.pageHead('家校沟通插件', '内置三大场景模板 + AI 任意文案生成：一键生成、自动脱敏、复制到班级群', '插件') +
      App.AI.settingsCard() +
      App.card('AI 自由文案生成（任意需求）',
        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
        '<div style="flex:1;min-width:260px"><label class="fld">输入你想发的通知 / 文案内容</label>' +
        '<input id="famAiReq" placeholder="如：下周举行历史知识竞赛，通知家长报名和注意事项 / 期末考试临近，提醒家长督促复习 / 运动会需要家长志愿者…" style="width:100%"></div>' +
        '<button class="btn btn-green" onclick="App.pages.family.aiGen()">🤖 AI 生成文案</button>' +
        '</div>' +
        (App.AI.hasKey()
          ? '<div class="muted" style="margin-top:10px">已接入 DeepSeek：将按你的需求生成规范、得体、脱敏的家长文案（约 10–20 秒）。</div>'
          : '<div class="muted" style="margin-top:10px"><b>未配置 API Key：</b>请在顶部「AI 增强」中填入 DeepSeek Key，或使用下方内置三大场景模板。</div>')
      ) +
      '<div class="grid grid-3" id="famTplCards">' + cards + '</div>' +
      '<div class="card" id="familyEditor">' +
      '<h3>生成文案</h3>' +
      '<div class="grid grid-3">' +
      '<div><label class="fld">班级</label><input type="text" id="fClazz" value="八年级（3）班" style="width:100%"></div>' +
      '<div><label class="fld">落款教师</label><input type="text" id="fTeacher" value="李老师" style="width:100%"></div>' +
      '<div><label class="fld">日期</label><input type="text" id="fDate" value="2026 年 9 月" style="width:100%"></div>' +
      '</div>' +
      '<div style="margin:14px 0 8px"><label class="fld">内置模板</label><select id="fTpl" style="width:100%">' +
      tpls.map(function (t, i) { return '<option value="' + i + '">' + t.name + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn" onclick="App.pages.family.gen()">生成文案</button> ' +
      '<button class="btn btn-outline" onclick="App.pages.family.copy()">复制全文</button>' +
      '<p class="muted" style="margin-top:10px">提示：模板文案中的学情表述已做个体脱敏处理；AI 生成文案不出现学生姓名，符合未成年人隐私保护要求。</p>' +
      '<textarea id="fOut" style="width:100%;min-height:300px;margin-top:10px;font-size:13.5px" placeholder="点击「生成文案」…"></textarea>' +
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
  aiGen: function () {
    var req = (document.getElementById('famAiReq').value || '').trim();
    if (!req) { App.AI.toastErr('请先输入想发的通知内容。'); return; }
    if (!App.AI.hasKey()) {
      App.AI.toastErr('尚未配置 DeepSeek API Key，请先在「AI 增强」中填入 Key，或使用下方内置模板。');
      return;
    }
    var out = document.getElementById('fOut');
    out.value = '⏳ AI 正在生成文案，约 10–20 秒…';
    App.AI.genFamily(req, this.vals(), function (text) {
      out.value = text;
      App.AI.toastOk('AI 文案已生成，可点击「复制全文」发送到班级群。');
      document.getElementById('famAiReq').value = '';
    }, function (e) {
      out.value = '';
      App.AI.toastErr('AI 生成失败：' + e.message + '，请重试。');
    });
  },
  copy: function () {
    var out = document.getElementById('fOut');
    if (!out.value || out.value.indexOf('⏳') === 0) { App.AI.toastErr('请先生成文案。'); return; }
    var btn = event && event.target;
    App.copyText(out.value, btn);
  }
};
