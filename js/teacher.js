/* ============ 首页 + 教师端 ============ */



/* ---------------- 首页 ---------------- */

App.pages.home = {

  render: function (main) {

    main.innerHTML =

      '<section class="hero fade-in">' +

      '  <h1>史鉴<span>智师</span></h1>' +

      '  <div class="slogan">以史为鉴 · 以智为师</div>' +

      '  <p class="muted" style="max-width:680px;margin:0 auto">面向统编版初中历史教材的学科教学智能体<br>知识库 · 工作流 · 插件 + AI 大模型驱动，专注智能备课、习题生成、家校沟通三大教学辅助场景</p>' +

      '</section>' +

      '<div class="role-cards fade-in">' +

      '  <div class="card role-card" onclick="App.go(\'prep\')"><div class="ic">📜</div><h4>智能备课</h4><p>内置 9 课知识库 + AI 任意课目生成<br>点击进入 WF1 智能备课工作流</p></div>' +

      '  <div class="card role-card" onclick="App.go(\'exam\')"><div class="ic">📝</div><h4>习题生成</h4><p>三维组卷 + AI 任意课目组卷<br>点击进入习题生成</p></div>' +

      '  <div class="card role-card" onclick="App.go(\'family\')"><div class="ic">✉️</div><h4>家校沟通</h4><p>三大模板 + AI 任意文案生成<br>点击生成家长版学情通报</p></div>' +

      '</div>' +

      '<div class="card fade-in"><h3>三大教学辅助模块</h3>' +

      '  <div class="grid grid-3">' +

      '    <div><p><b>智能备课</b>（WF1 工作流）</p><p class="muted">课标锚定 · 素养目标 · 史料情境 · 分层作业；可接入 DeepSeek 对任意课目生成教案并导出 Word</p></div>' +

      '    <div><p><b>习题生成</b></p><p class="muted">知识点 × 难度 × 题型三维组卷，每题附判分点与错因标签；可接入 DeepSeek 对任意课目 / 知识点 AI 组卷</p></div>' +

      '    <div><p><b>家校沟通</b>（插件）</p><p class="muted">三大场景文案模板；可接入 DeepSeek 按需求生成任意家校沟通文案，自动脱敏</p></div>' +

      '  </div>' +

      '</div>' +

      '<div class="card fade-in"><h3>AI 增强 · 任意场景自由生成</h3>' +

      '  <div class="grid grid-3">' +

      '    <div><p><b>任意课目备课</b></p><p class="muted">输入任意课目 / 知识点，DeepSeek 按课标定位—素养目标—史料—问题链—分层作业生成完整教案</p></div>' +

      '    <div><p><b>任意课目组卷</b></p><p class="muted">输入任意课目 / 知识点，AI 按基础 / 提升 / 拓展三层命制带答案与解析的分层习题</p></div>' +

      '    <div><p><b>任意文案生成</b></p><p class="muted">输入家校沟通需求，AI 生成规范、得体、脱敏的家长文案，可复制到班级群</p></div>' +

      '  </div>' +

      '</div>' +

      '<div class="arch-strip fade-in">' +

      '  <span><b>用户层</b> 教师 · 家长</span><span class="sep">｜</span>' +

      '  <span><b>核心能力</b> 备课 · 组卷 · 家校文案</span><span class="sep">｜</span>' +

      '  <span><b>知识库</b> 教材 · 课标 · 史料 · 题库</span><span class="sep">｜</span>' +

      '  <span><b>AI 增强</b> DeepSeek 前端直连（可选）</span>' +

      '</div>' +

      '<p class="muted fade-in" style="text-align:center;margin-top:18px">安全护栏：史实出处可溯 · 家校文案自动脱敏 · AI 内容仅供教学参考</p>';

  }

};



/* ---------------- WF1 智能备课 ---------------- */

App.pages.prep = {

  render: function (main) {

    var opts = KB.lessons.map(function (l) {

      return '<option value="' + l.id + '">' + l.book + ' · ' + l.name + '</option>';

    }).join('');

    main.innerHTML =

      App.pageHead('智能备课 · WF1 工作流', '内置知识库 + AI 增强：课标定位 → 学情预读 → 教案生成 → 史料匹配 → 分层作业', '教师端') +

      App.AI.settingsCard() +

      App.card('第 1 步 · 选择课目（内置知识库 · 9 课）',

        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +

        '<div style="flex:1;min-width:260px"><label class="fld">课目（统编版知识库 · 9 课已收录）</label><select id="prepLesson" style="width:100%">' + opts + '</select></div>' +

        '<button class="btn" onclick="App.pages.prep.run()">启动工作流</button>' +

        '<button class="btn btn-outline" onclick="App.pages.prep.reset()">重置</button>' +

        '</div>' +

        '<div class="muted" style="margin-top:10px">知识库命中演示：选择课目后，智能体将同时召回 ①课标条目 ②该班学情薄弱点 ③匹配史料 ④分层作业模板</div>'

      ) +

      App.card('第 2 步 · AI 自由课目（任意教材/知识点）',

        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +

        '<div style="flex:1;min-width:260px"><label class="fld">输入任意课目或知识点</label><input id="prepAiTopic" placeholder="如：春秋战国时期的社会变革 / 汉武帝巩固大一统 / 两次鸦片战争 / 洋务运动…" style="width:100%"></div>' +

        '<button class="btn btn-green" onclick="App.pages.prep.aiRun()">🤖 AI 生成教案</button>' +

        '</div>' +

        (App.AI.hasKey()

          ? '<div class="muted" style="margin-top:10px">已接入 DeepSeek：将调用大模型生成完整教案（约 30 秒）。</div>'

          : '<div class="muted" style="margin-top:10px"><b>未配置 API Key：</b>请在顶部「AI 增强」中填入 DeepSeek Key，或直接使用上方内置知识库课目。当前 AI 生成为演示引导。</div>')

      ) +

      App.flowSteps('prepFlow', ['任务解析', '课标定位', '学情预读', '教案生成', '史料匹配', '作业编排']) +

      App.thinking('prepThink', '') +

      '<div id="prepResult"></div>';

    this.reset();

  },

  reset: function () {

    App.markSteps('prepFlow', -1);

    document.getElementById('prepResult').innerHTML = '';

  },

  aiRun: function () {

    var topic = (document.getElementById('prepAiTopic').value || '').trim();

    if (!topic) { App.AI.toastErr('请先输入课目或知识点。'); return; }

    if (!App.AI.hasKey()) {

      App.AI.toastErr('尚未配置 DeepSeek API Key，请先在「AI 增强」中填入 Key，或改用上方内置课目。');

      return;

    }

    App.markSteps('prepFlow', 0);

    App.showThinking('prepThink', 800, [

      '已接收课目「' + topic + '」…',

      '调用 DeepSeek 生成教案框架（课标定位·素养目标）…',

      'AI 检索史料并标注出处…',

      '组织问题链与分层作业…',

      '正在整理输出…'

    ], function () { });

    var res = document.getElementById('prepResult');

    res.innerHTML = '<div class="card"><p class="muted">⏳ AI 正在生成《' + topic + '》教案，通常需 20–40 秒，请耐心等待…</p></div>';

    App.AI.genLesson(topic, function (obj) {

      App.markSteps('prepFlow', 6);

      res.innerHTML = App.AI.renderLesson(obj) +

        '<div class="card no-print" style="text-align:center">' +

        '<button class="btn btn-outline" onclick="window.print()">打印 / 存为 PDF</button> ' +

        '<button class="btn btn-outline" onclick="App.pages.prep.aiExport(obj)">导出 Word 教案</button>' +

        '</div>';

      document.getElementById('prepAiTopic').value = '';

    }, function (e) {

      res.innerHTML = '<div class="card"><p class="muted">AI 生成失败：' + e.message + '，请重试。</p></div>';

    });

  },

  aiExport: function (obj) {

    var html =

      '<h2>一、基本信息</h2><p>课目：《' + obj.name + '》' + (obj.book ? '｜' + obj.book : '') + (obj.unit ? '｜' + obj.unit : '') + '<br>课标依据：' + (obj.curriculum || '—') + '</p>' +

      '<h2>二、教学目标</h2><ol>' + (obj.goals || []).map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ol>' +

      '<h2>三、重难点</h2><p>' + (obj.focus || '—') + '</p>' +

      '<h2>四、史料情境</h2>' + (obj.materials || []).map(function (m) { return '<p>「' + m.text + '」——' + (m.src || '待核验') + '（' + (m.level || '') + '）</p>'; }).join('') +

      '<h2>五、问题链设计</h2><ol>' + (obj.questionChain || []).map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ol>' +

      '<h2>六、分层作业</h2><p><b>基础：</b>' + (obj.homework ? obj.homework.basic : '—') + '<br><b>提升：</b>' + (obj.homework ? obj.homework.mid : '—') + '<br><b>拓展：</b>' + (obj.homework ? obj.homework.adv : '—') + '</p>' +

      '<p style="color:#999">本教案由 AI 生成，仅供参考，请依据教材与课标人工复核。</p>';

    App.exportWord(obj.name + '-AI教案', '《' + obj.name + '》教学设计（AI 初稿）', html);

  },

  run: function () {

    var id = document.getElementById('prepLesson').value;

    var l = KB.lessonById(id);

    App.markSteps('prepFlow', 0);

    var steps = [

      '正在解析备课需求（课型：新授课）…',

      '检索课标库：《义务教育历史课程标准（2022年版）》命中条目…',

      '调取学情档案：本班上一单元薄弱点「材料信息提取」…',

      '按"情境—问题链—活动"结构生成教案框架…',

      '从史料素材库召回 2 则分级史料…',

      '组装基础 / 提升 / 拓展三层作业…'

    ];

    App.showThinking('prepThink', 2600, steps, function () {

      App.markSteps('prepFlow', 6);

      var mHtml = l.materials.map(function (m) {

        return '<div class="verdict"><b>「' + m.text + '」</b><br><span class="muted">出处：' + m.src + ' · <span class="tag ' + (m.level === '基础' ? 'tag-basic' : (m.level === '提升' ? 'tag-mid' : 'tag-adv')) + '">' + m.level + '</span> 使用建议：' + m.hint + '</span></div>';

      }).join('');

      var gHtml = l.goals.map(function (g) { return '<li style="margin:4px 0">' + g + '</li>'; }).join('');

      var qHtml = l.questionChain.map(function (q, i) { return '<li style="margin:4px 0">' + q + '</li>'; }).join('');

      document.getElementById('prepResult').innerHTML =

        App.card('教案初稿 ·《' + l.name + '》（' + l.book + '）',

          '<p class="kv"><b>课标依据：</b>' + l.curriculum + '<br><b>单元定位：</b>' + l.unit + '</p>' +

          '<div class="section-title">一、教学目标（素养导向）</div><ol style="padding-left:22px">' + gHtml + '</ol>' +

          '<div class="section-title">二、重难点</div><p>' + l.focus + '</p>' +

          '<div class="section-title">三、史料情境（出处可溯源）</div>' + mHtml +

          '<div class="section-title">四、问题链设计</div><ol style="padding-left:22px">' + qHtml + '</ol>' +

          '<div class="section-title">五、分层作业</div>' +

          '<p><span class="tag tag-basic">基础</span>' + l.homework.basic + '</p>' +

          '<p><span class="tag tag-mid">提升</span>' + l.homework.mid + '</p>' +

          '<p><span class="tag tag-adv">拓展</span>' + l.homework.adv + '</p>' +

          '<div class="muted" style="margin-top:8px">✓ 以上内容均标注知识库出处；教师可在此初稿上修改后导出。</div>'

        ) +

        '<div class="card no-print" style="text-align:center">' +

        '<button class="btn btn-green" onclick="App.pages.prep.exportDoc()">导出 Word 教案</button> ' +

        '<button class="btn btn-outline" onclick="window.print()">打印 / 存为 PDF</button> ' +

        '<button class="btn btn-outline" onclick="App.go(\'exam\')">用本课知识点生成习题 →</button>' +

        '</div>';

    });

  },

  exportDoc: function () {

    var id = document.getElementById('prepLesson').value;

    var l = KB.lessonById(id);

    var html =

      '<h2>一、基本信息</h2><p>课目：《' + l.name + '》｜' + l.book + '｜' + l.unit + '<br>课标依据：' + l.curriculum + '</p>' +

      '<h2>二、教学目标</h2><ol>' + l.goals.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ol>' +

      '<h2>三、重难点</h2><p>' + l.focus + '</p>' +

      '<h2>四、史料情境</h2>' + l.materials.map(function (m) { return '<p>「' + m.text + '」——' + m.src + '（' + m.level + '）</p>'; }).join('') +

      '<h2>五、问题链设计</h2><ol>' + l.questionChain.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ol>' +

      '<h2>六、分层作业</h2><p><b>基础：</b>' + l.homework.basic + '<br><b>提升：</b>' + l.homework.mid + '<br><b>拓展：</b>' + l.homework.adv + '</p>';

    App.exportWord(l.name + '-教案', '《' + l.name + '》教学设计（初稿）', html);

  }

};



/* ---------------- 习题生成 ---------------- */

App.pages.exam = {

  state: { lesson: 'all', level: 'all', type: 'all', aiTopic: '' },

  render: function (main) {

    var s = this.state;

    var lOpts = '<option value="all">全部课目</option>' + KB.lessons.map(function (l) {

      return '<option value="' + l.id + '"' + (s.lesson === l.id ? ' selected' : '') + '>' + l.name + '</option>';

    }).join('');

    main.innerHTML =

      App.pageHead('习题生成 · 三维组卷', '内置知识库 + AI 增强：分层题库 45 题，每题含判分点、解析与错因标签，杜绝"裸题"', '教师端') +

      App.AI.settingsCard() +

      App.card('AI 自由组卷（任意课目/知识点）',

        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +

        '<div style="flex:1;min-width:260px"><label class="fld">输入任意课目或知识点</label><input id="exAiTopic" placeholder="如：商鞅变法 / 洋务运动 / 明清君主专制强化 / 新文化运动…" style="width:100%"></div>' +

        '<button class="btn btn-green" onclick="App.pages.exam.aiRun()">🤖 AI 生成习题</button>' +

        '</div>' +

        (App.AI.hasKey()

          ? '<div class="muted" style="margin-top:10px">已接入 DeepSeek：将按基础 / 提升 / 拓展三个层级生成 6 道带答案与解析的习题（约 30 秒）。</div>'

          : '<div class="muted" style="margin-top:10px"><b>未配置 API Key：</b>请先在顶部「AI 增强」中填入 DeepSeek Key，或使用下方内置题库筛选组卷。</div>')

      ) +

      App.card('组卷条件',

        '<div class="grid grid-3">' +

        '<div><label class="fld">课目</label><select id="exLesson" style="width:100%" onchange="App.pages.exam.re()">' + lOpts + '</select></div>' +

        '<div><label class="fld">难度层级</label><select id="exLevel" style="width:100%" onchange="App.pages.exam.re()">' +

        '<option value="all"' + (s.level === 'all' ? ' selected' : '') + '>全部</option><option value="basic"' + (s.level === 'basic' ? ' selected' : '') + '>基础</option><option value="mid"' + (s.level === 'mid' ? ' selected' : '') + '>提升</option><option value="adv"' + (s.level === 'adv' ? ' selected' : '') + '>拓展</option></select></div>' +

        '<div><label class="fld">题型</label><select id="exType" style="width:100%" onchange="App.pages.exam.re()">' +

        '<option value="all"' + (s.type === 'all' ? ' selected' : '') + '>全部</option><option value="选择"' + (s.type === '选择' ? ' selected' : '') + '>选择题</option><option value="材料"' + (s.type === '材料' ? ' selected' : '') + '>材料分析题</option></select></div>' +

        '</div>') +

      '<div id="exResult"></div>';

    this.re();

  },

  re: function () {

    var lesson = document.getElementById('exLesson').value;

    var level = document.getElementById('exLevel').value;

    var type = document.getElementById('exType').value;

    this.state = { lesson: lesson, level: level, type: type, aiTopic: this.state.aiTopic };

    var list = KB.questions.filter(function (q) {

      return (lesson === 'all' || q.lesson === lesson) && (level === 'all' || q.level === level) && (type === 'all' || q.type === type);

    });

    var self = this;

    var html = '<div id="exList">';

    if (!list.length) {

      html += '<div class="card"><p class="muted">当前条件下暂无题目，请调整筛选条件。</p></div>';

    } else {

      list.forEach(function (q) {

        var l = KB.lessonById(q.lesson);

        html += '<div class="card"><p>' + App.knowledgeTag(q.lesson) +

          '<span class="tag ' + KB.levelTag[q.level] + '">' + KB.levelName[q.level] + '</span>' +

          '<span class="tag tag-lite">' + q.type + '</span><span class="tag tag-lite">素养：' + q.liter + '</span></p>' +

          '<p style="margin:8px 0"><b>' + q.stem + '</b></p>';

        if (q.opts) {

          html += '<p style="font-family:var(--sans);font-size:13.5px">' + q.opts.map(function (o, i) {

            return String.fromCharCode(65 + i) + '. ' + o;

          }).join('　　') + '</p>';

        }

        html += '<details style="margin-top:6px"><summary style="cursor:pointer;font-family:var(--sans);font-size:13px;color:var(--green)">查看判分点 / 答案 / 解析</summary>' +

          '<div class="verdict ok" style="margin-top:8px"><b>参考答案：</b>' + q.ans + '<br><b>判分点：</b><ul style="padding-left:18px">' + q.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +

          '<b>解析：</b>' + q.analysis + (q.wrong ? '<br><b>高频错因标签：</b>' + q.wrong : '') + '</div></details></div>';

      });

    }

    html += '</div>';

    if (list.length) {

      html += '<div class="card no-print" style="text-align:center"><button class="btn btn-green" onclick="App.pages.exam.exportDoc()">导出本套习题（Word）</button> ' +

        '<button class="btn btn-outline" onclick="App.go(\'prep\')">配套课目去备课 →</button></div>';

    }

    document.getElementById('exResult').innerHTML = html;

  },

  aiRun: function () {

    var topic = (document.getElementById('exAiTopic').value || '').trim();

    if (!topic) { App.AI.toastErr('请先输入课目或知识点。'); return; }

    if (!App.AI.hasKey()) {

      App.AI.toastErr('尚未配置 DeepSeek API Key，请先在「AI 增强」中填入 Key，或使用下方内置题库。');

      return;

    }

    var res = document.getElementById('exResult');

    res.innerHTML = '<div class="card"><p class="muted">⏳ AI 正在为「' + topic + '」生成分层习题（基础2 / 提升2 / 拓展2），约 20–40 秒…</p></div>';

    App.AI.genExam(topic, function (arr) {

      App.pages.exam.state.aiTopic = topic;

      res.innerHTML = App.AI.renderExam(arr, topic) +

        '<div class="card no-print" style="text-align:center"><button class="btn btn-green" onclick="App.pages.exam.aiExport(arr)">导出本套习题（Word）</button></div>';

      document.getElementById('exAiTopic').value = '';

    }, function (e) {

      res.innerHTML = '<div class="card"><p class="muted">AI 生成失败：' + e.message + '，请重试。</p></div>';

    });

  },

  aiExport: function (arr) {

    var topic = this.state.aiTopic || 'AI 习题';

    var html = '<p>AI 生成分层习题（基础2 / 提升2 / 拓展2）</p>';

    arr.forEach(function (q, i) {

      var lv = q.level === 'mid' ? '提升' : (q.level === 'adv' ? '拓展' : '基础');

      html += '<p><b>' + (i + 1) + '.（' + lv + '·' + (q.type || '选择') + '）</b>' + q.stem + '</p>';

      if (q.opts) html += '<p>' + q.opts.map(function (o, j) { return String.fromCharCode(65 + j) + '. ' + o; }).join('　') + '</p>';

    });

    html += '<h2>参考答案与判分点（教师用）</h2>';

    arr.forEach(function (q, i) {

      html += '<p><b>' + (i + 1) + '.</b> 答案：' + q.ans + '｜判分点：' + (q.points || []).join('；') + '｜错因标签：' + (q.wrong || '无') + '</p>';

    });

    App.exportWord('AI-分层习题', '初中历史 AI 分层习题卷', html);

  },

  exportDoc: function () {

    var s = this.state;

    var list = KB.questions.filter(function (q) {

      return (s.lesson === 'all' || q.lesson === s.lesson) && (s.level === 'all' || q.level === s.level) && (s.type === 'all' || q.type === s.type);

    });

    var html = '<p>组卷条件：课目=' + (s.lesson === 'all' ? '全部' : KB.lessonById(s.lesson).name) + '，难度=' + (s.level === 'all' ? '全部' : KB.levelName[s.level]) + '，题型=' + (s.type === 'all' ? '全部' : s.type) + '</p>';

    list.forEach(function (q, i) {

      html += '<p><b>' + (i + 1) + '.（' + KB.levelName[q.level] + '·' + q.type + '）</b>' + q.stem + '</p>';

      if (q.opts) html += '<p>' + q.opts.map(function (o, j) { return String.fromCharCode(65 + j) + '. ' + o; }).join('　') + '</p>';

    });

    html += '<h2>参考答案与判分点（教师用）</h2>';

    list.forEach(function (q, i) {

      html += '<p><b>' + (i + 1) + '.</b> 答案：' + q.ans + '｜判分点：' + q.points.join('；') + '｜错因标签：' + (q.wrong || '无') + '</p>';

    });

    App.exportWord('历史习题卷', '初中历史分层习题卷', html);

  }

};



