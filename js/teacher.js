/* ============ 首页 + 教师端 ============ */

/* ---------------- 首页 ---------------- */
App.pages.home = {
  render: function (main) {
    main.innerHTML =
      '<section class="hero fade-in">' +
      '  <h1>史鉴<span>智师</span></h1>' +
      '  <div class="slogan">以史为鉴 · 以智为师</div>' +
      '  <p class="muted" style="max-width:640px;margin:0 auto">面向统编版初中历史教材的学科教学智能体<br>知识库 · 工作流 · 插件三重驱动，覆盖备课、命题、批改、学情、答疑、规划全流程</p>' +
      '</section>' +
      '<div class="role-cards fade-in">' +
      '  <div class="card role-card" onclick="App.go(\'prep\')"><div class="ic">📜</div><h4>教师 · 教学辅助</h4><p>智能备课 / 习题生成 / 作业批改 / 学情分析<br>点击进入 WF1 智能备课工作流</p></div>' +
      '  <div class="card role-card" onclick="App.go(\'tutor\')"><div class="ic">🏮</div><h4>学生 · 个性化学习</h4><p>启发式答疑 / 错题归因 / 复习规划<br>点击体验"不代写"的苏格拉底式辅导</p></div>' +
      '  <div class="card role-card" onclick="App.go(\'family\')"><div class="ic">✉️</div><h4>协同 · 班级与家校</h4><p>班级学情报告 / 家校沟通文案 / 活动方案<br>点击生成家长版学情通报</p></div>' +
      '</div>' +
      '<div class="card fade-in"><h3>九大功能矩阵</h3>' +
      '  <div class="grid grid-3">' +
      '    <div><p><b>智能备课</b>（WF1 工作流）</p><p class="muted">课标锚定 · 学情预读 · 分层作业，一键生成教案并导出 Word</p></div>' +
      '    <div><p><b>习题生成</b></p><p class="muted">知识点 × 难度 × 题型三维组卷，每题附判分点与错因标签</p></div>' +
      '    <div><p><b>作业批改</b>（WF2 工作流）</p><p class="muted">OCR 识别 → 判分点对齐逐题批改 → 个性化评语与错因归类</p></div>' +
      '    <div><p><b>学情分析</b></p><p class="muted">知识点热力图 + 素养雷达图 + 共性错因分布与教学建议</p></div>' +
      '    <div><p><b>启发式答疑</b></p><p class="muted">引导追问 → 思路支架 → 变式练习，答案锁定至提交后解锁</p></div>' +
      '    <div><p><b>错题本</b></p><p class="muted">四类错因自动归档，一键生成补强练习</p></div>' +
      '    <div><p><b>复习规划</b>（WF4）</p><p class="muted">按薄弱维度生成周计划与三轮复习路径</p></div>' +
      '    <div><p><b>历史时间轴</b>（插件）</p><p class="muted">朝代轴与近代大事轴交互梳理，直击时序错乱痛点</p></div>' +
      '    <div><p><b>家校沟通</b>（插件）</p><p class="muted">三大场景文案模板，学情数据通俗化转写</p></div>' +
      '  </div>' +
      '</div>' +
      '<div class="arch-strip fade-in">' +
      '  <span><b>用户层</b> 教师 · 学生 · 家长</span><span class="sep">｜</span>' +
      '  <span><b>工作流引擎</b> 备课 / 批改 / 辅导 / 规划</span><span class="sep">｜</span>' +
      '  <span><b>知识库</b> 教材 · 课标 · 史料 · 题库 · 学情档案（RAG）</span><span class="sep">｜</span>' +
      '  <span><b>插件</b> OCR · 时间轴 · 文档生成 · 消息推送</span>' +
      '</div>' +
      '<p class="muted fade-in" style="text-align:center;margin-top:18px">安全护栏：史实三重校验 · 启发式不代写 · 学生数据脱敏 · 低置信度内容转教师复核</p>';
  }
};

/* ---------------- WF1 智能备课 ---------------- */
App.pages.prep = {
  render: function (main) {
    var opts = KB.lessons.map(function (l) {
      return '<option value="' + l.id + '">' + l.book + ' · ' + l.name + '</option>';
    }).join('');
    main.innerHTML =
      App.pageHead('智能备课 · WF1 工作流', '知识库检索：课标定位 → 学情预读 → 教案生成 → 史料匹配 → 分层作业，全程可追溯出处', '教师端') +
      App.card('第 1 步 · 选择课目',
        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
        '<div style="flex:1;min-width:260px"><label class="fld">课目（统编版知识库 · 9 课已收录）</label><select id="prepLesson" style="width:100%">' + opts + '</select></div>' +
        '<button class="btn" onclick="App.pages.prep.run()">启动工作流</button>' +
        '<button class="btn btn-outline" onclick="App.pages.prep.reset()">重置</button>' +
        '</div>' +
        '<div class="muted" style="margin-top:10px">知识库命中演示：选择课目后，智能体将同时召回 ①课标条目 ②该班学情薄弱点 ③匹配史料 ④分层作业模板</div>'
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
  state: { lesson: 'all', level: 'all', type: 'all' },
  render: function (main) {
    var s = this.state;
    var lOpts = '<option value="all">全部课目</option>' + KB.lessons.map(function (l) {
      return '<option value="' + l.id + '"' + (s.lesson === l.id ? ' selected' : '') + '>' + l.name + '</option>';
    }).join('');
    main.innerHTML =
      App.pageHead('习题生成 · 三维组卷', '知识库：分层题库 45 题，每题含判分点、解析与错因标签，杜绝"裸题"', '教师端') +
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
    this.state = { lesson: lesson, level: level, type: type };
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
        '<button class="btn btn-outline" onclick="App.go(\'grading\')">去批改配套作业 →</button></div>';
    }
    document.getElementById('exResult').innerHTML = html;
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

/* ---------------- WF2 作业批改 ---------------- */
App.pages.grading = {
  render: function (main) {
    var t = KB.gradingTask;
    var rub = t.rubric.map(function (r) { return '<li>' + r.text + '</li>'; }).join('');
    main.innerHTML =
      App.pageHead('作业批改 · WF2 工作流', 'OCR 识图插件 → 判分点对齐逐题批改 → 个性化评语与错因归类 → 低置信度内容转教师复核', '教师端') +
      App.card('第 1 步 · 作业任务（已录入评分细则）',
        '<p class="kv"><b>任务：</b>' + t.title + '　<b>满分：</b>' + t.fullScore + ' 分　' + App.knowledgeTag(t.lesson) + '</p>' +
        '<div class="paper-sheet" style="margin:10px 0">' + t.question + '</div>' +
        '<details><summary style="cursor:pointer;font-family:var(--sans);font-size:13px;color:var(--green)">展开教师评分细则（' + t.rubric.length + ' 个判分点）</summary><ul style="padding-left:20px;margin-top:8px">' + rub + '</ul></details>') +
      App.card('第 2 步 · 选择学生作业（模拟拍照上传）',
        '<p class="muted">演示模式：点击学生即模拟"拍照上传 → OCR 识别"。实际环境中此步骤调用 OCR 识图插件完成手写体转写。</p><br>' +
        t.samples.map(function (sm, i) {
          return '<button class="btn ' + (i === 1 ? '' : 'btn-outline') + ' btn-sm" style="margin:3px" onclick="App.pages.grading.grade(' + i + ')">📷 ' + sm.student + '（' + sm.level + '）</button>';
        }).join('') +
        ' <button class="btn btn-green btn-sm" style="margin:3px" onclick="App.pages.grading.gradeAll()">一键批改全班（3 份）</button>') +
      App.flowSteps('gradeFlow', ['拍照上传', 'OCR 识别', '结构化解析', '逐题批改', '错因归类', '生成报告']) +
      App.thinking('gradeThink', '') +
      '<div id="gradeResult"></div>';
  },
  grade: function (i) {
    App.markSteps('gradeFlow', 0);
    var t = KB.gradingTask;
    var sm = t.samples[i];
    document.getElementById('gradeResult').innerHTML = '';
    var steps = ['正在调用 OCR 识图插件…', '手写体转写完成，题号对齐…', '对照评分细则逐项判分…', '生成个性化评语并归错因…'];
    App.showThinking('gradeThink', 2200, steps, function () {
      App.markSteps('gradeFlow', 6);
      document.getElementById('gradeResult').innerHTML = App.pages.grading.resultHtml(sm);
    });
  },
  gradeAll: function () {
    App.markSteps('gradeFlow', 0);
    var t = KB.gradingTask;
    var steps = ['批量调用 OCR 识图插件（3 份）…', '手写体转写完成…', '逐份对照评分细则判分…', '汇总班级错因分布…'];
    App.showThinking('gradeThink', 2400, steps, function () {
      App.markSteps('gradeFlow', 6);
      var html = t.samples.map(function (sm) { return App.pages.grading.resultHtml(sm); }).join('');
      html += '<div class="card no-print" style="text-align:center"><button class="btn btn-green" onclick="App.go(\'analytics\')">汇总学情分析 →</button></div>';
      document.getElementById('gradeResult').innerHTML = html;
    });
  },
  resultHtml: function (sm) {
    var t = KB.gradingTask;
    var hitMap = {};
    (sm.hits || []).forEach(function (h) { hitMap[h] = 'ok'; });
    if (sm.partial) hitMap[sm.partial] = 'half';
    var rub = t.rubric.map(function (r) {
      var st = hitMap[r.id];
      var mark = st === 'ok' ? '✓ 得分' : (st === 'half' ? '△ 部分得分' : '✗ 未得分');
      var cls = st === 'ok' ? 'ok' : (st === 'half' ? '' : 'bad');
      return '<div class="verdict ' + cls + '">' + mark + ' ｜ ' + r.text + '</div>';
    }).join('');
    var wrongHtml = sm.wrongType
      ? '<p><span class="tag tag-adv">错因归类：' + sm.wrongType + '</span></p><p class="muted" style="margin:6px 0">' + sm.wrongDetail + '</p>'
      : '<p><span class="tag tag-basic">错因归类：无共性错误</span></p>';
    return App.card('批改结果 · ' + sm.student + '（' + sm.level + '）',
      '<span class="ocr-note">OCR 识图插件 · 手写体识别完成（置信度 ' + (sm.wrongType ? '92%' : '98%') + '）</span>' +
      '<div class="paper-sheet" style="font-size:14.5px;margin-bottom:12px">' + sm.ocr.replace(/\n/g, '<br>') + '</div>' +
      '<div style="margin:10px 0"><span class="score-pill">' + sm.score + ' / ' + t.fullScore + ' 分</span></div>' +
      '<div class="section-title" style="font-size:16px">判分点对齐</div>' + rub +
      wrongHtml +
      '<div class="section-title" style="font-size:16px">个性化评语</div>' +
      '<div class="verdict ok" style="font-family:var(--kai);font-size:15px">' + sm.comment + '</div>' +
      (sm.wrongType ? '<p class="muted no-print">✓ 已将该错因写入 ' + sm.student + ' 的个人学情档案，并在错题本生成补强任务</p>' : ''));
  }
};

/* ---------------- 学情分析 ---------------- */
App.pages.analytics = {
  render: function (main) {
    var a = KB.analytics;
    /* 热力图 */
    var heat = '<table class="tb" style="table-layout:fixed"><tr><th style="width:64px">学生</th>';
    a.dims.forEach(function (d) { heat += '<th style="padding:4px 2px;font-size:11px;text-align:center">' + d + '</th>'; });
    heat += '</tr>';
    a.scores.forEach(function (row, i) {
      heat += '<tr><td style="font-size:12px">' + a.students[i] + '</td>';
      row.forEach(function (v) {
        var c = v >= 80 ? '#2F6E5E' : (v >= 70 ? '#7FA663' : (v >= 60 ? '#D9A441' : '#C05B4D'));
        heat += '<td class="heat-cell" style="background:' + c + ';color:#fff;text-align:center;font-size:11px;padding:6px 2px" title="' + a.students[i] + ' · ' + v + '">' + v + '</td>';
      });
      heat += '</tr>';
    });
    heat += '</table><div class="legend"><span><i style="background:#2F6E5E"></i>掌握良好(≥80)</span><span><i style="background:#7FA663"></i>基本掌握(70-79)</span><span><i style="background:#D9A441"></i>待巩固(60-69)</span><span><i style="background:#C05B4D"></i>薄弱(<60)</span></div>';

    /* 雷达图 SVG */
    var cx = 150, cy = 145, R = 105;
    var maxV = 100;
    var pts = a.literacies.map(function (name, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / a.literacies.length;
      var r = R * a.literAvg[i] / maxV;
      return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang), ang: ang };
    });
    var poly = pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
    var radar = '<svg viewBox="0 0 300 290" style="max-width:300px;margin:0 auto;display:block">';
    [0.25, 0.5, 0.75, 1].forEach(function (k) {
      var ring = a.literacies.map(function (n, i) {
        var ang = -Math.PI / 2 + i * 2 * Math.PI / a.literacies.length;
        return (cx + R * k * Math.cos(ang)).toFixed(1) + ',' + (cy + R * k * Math.sin(ang)).toFixed(1);
      }).join(' ');
      radar += '<polygon points="' + ring + '" fill="none" stroke="#E3D8C4" stroke-width="1"/>';
    });
    a.literacies.forEach(function (n, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / a.literacies.length;
      var lx = cx + (R + 26) * Math.cos(ang), ly = cy + (R + 26) * Math.sin(ang);
      radar += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(ang)).toFixed(1) + '" y2="' + (cy + R * Math.sin(ang)).toFixed(1) + '" stroke="#E3D8C4"/>';
      radar += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="middle" font-size="12" fill="#5E2F1B" font-family="KaiTi">' + n + '</text>';
      var vx = cx + (R * a.literAvg[i] / maxV + 16) * Math.cos(ang), vy = cy + (R * a.literAvg[i] / maxV + 16) * Math.sin(ang);
      radar += '<text x="' + vx.toFixed(1) + '" y="' + (vy + 4).toFixed(1) + '" text-anchor="middle" font-size="10.5" fill="#2F6E5E" font-weight="bold">' + a.literAvg[i] + '</text>';
    });
    radar += '<polygon points="' + poly + '" fill="rgba(140,74,47,.25)" stroke="#8C4A2F" stroke-width="2"/>';
    pts.forEach(function (p) { radar += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.5" fill="#8C4A2F"/>'; });
    radar += '</svg><p class="muted" style="text-align:center">班级素养均值（满分 100）· 最薄弱：史料实证</p>';

    /* 错因分布条形 */
    var maxC = Math.max.apply(null, a.wrongDist.map(function (w) { return w.count; }));
    var bars = a.wrongDist.map(function (w) {
      return '<div style="display:flex;align-items:center;gap:10px;margin:8px 0;font-family:var(--sans);font-size:13px">' +
        '<span style="width:80px;text-align:right">' + w.type + '</span>' +
        '<div style="flex:1;background:#F1EADC;border-radius:5px;overflow:hidden"><div style="width:' + (w.count / maxC * 100) + '%;background:' + w.color + ';height:20px;border-radius:5px;transition:width .8s"></div></div>' +
        '<b style="width:26px">' + w.count + '</b></div>' +
        '<div class="muted" style="margin-left:90px;font-size:12px">' + w.cases + '</div>';
    }).join('');

    main.innerHTML =
      App.pageHead('学情分析 · ' + a.clazz, '数据来源：WF2 批改结果自动回流 · 个体明细仅任课教师可见（家长端仅呈现汇总数据）', '教师端') +
      App.card('知识点掌握热力图（10 名学生 × 8 个维度）', heat) +
      '<div class="grid grid-2">' +
      App.card('五大核心素养 · 班级雷达', radar) +
      App.card('共性错因分布（46 处失分点归因）', bars) +
      '</div>' +
      App.card('教学调整建议（自动生成）', '<ol style="padding-left:22px">' + a.advice.map(function (ad) { return '<li style="margin:6px 0">' + ad + '</li>'; }).join('') + '</ol>' +
        '<div class="muted">近期高频薄弱知识点：' + a.recentWeak.map(function (w) { return '<span class="tag tag-adv">' + w + '</span>'; }).join('') + '</div>') +
      '<div class="card no-print" style="text-align:center">' +
      '<button class="btn btn-green" onclick="App.pages.analytics.exportDoc()">导出班级学情报告（Word）</button> ' +
      '<button class="btn btn-outline" onclick="App.go(\'family\')">生成家长版通报 →</button> ' +
      '<button class="btn btn-outline" onclick="App.go(\'mistakes\')">查看错题本 →</button></div>';
  },
  exportDoc: function () {
    var a = KB.analytics;
    var rows = a.scores.map(function (row, i) {
      return '<tr><td>' + a.students[i] + '</td>' + row.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
    }).join('');
    var html =
      '<h2>一、知识点掌握表</h2><table><tr><th>学生</th>' + a.dims.map(function (d) { return '<th>' + d + '</th>'; }).join('') + '</tr>' + rows + '</table>' +
      '<h2>二、素养均值</h2><p>' + a.literacies.map(function (n, i) { return n + '：' + a.literAvg[i] + ' 分'; }).join('；') + '</p>' +
      '<h2>三、共性错因分布</h2>' + a.wrongDist.map(function (w) { return '<p>' + w.type + '（' + w.count + ' 处）：' + w.cases + '</p>'; }).join('') +
      '<h2>四、教学调整建议</h2><ol>' + a.advice.map(function (ad) { return '<li>' + ad + '</li>'; }).join('') + '</ol>';
    App.exportWord(a.clazz + '-历史学情报告', a.clazz + ' 历史学科阶段性学情报告', html);
  }
};
