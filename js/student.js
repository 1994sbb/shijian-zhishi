/* ============ 学生端 ============ */

/* ---------------- 启发式答疑 ---------------- */
App.pages.tutor = {
  state: { flow: null, stepIdx: 0, waiting: false, answered: {} },
  render: function (main) {
    var flowCards = KB.tutorFlows.map(function (f) {
      return '<div class="card role-card" style="text-align:left" onclick="App.pages.tutor.start(\'' + f.id + '\')">' +
        '<span class="tag tag-ochre">' + f.tag + '</span>' +
        '<h4 style="margin:8px 0 6px">' + f.title + '</h4>' +
        '<p class="muted">点击开始 · 先引导思考，不给现成答案</p></div>';
    }).join('');
    main.innerHTML =
      App.pageHead('启发式答疑 · 苏格拉底式辅导', '智能体不代写作业：先追问定位问题 → 给思路支架 → 变式题检验，答案在你提交作答后解锁', '学生端') +
      '<div class="grid grid-2" id="tutorPick">' + flowCards + '</div>' +
      '<div id="tutorSession"></div>' +
      '<div class="card"><h3>什么是"启发式不代写"？</h3>' +
      '<p class="muted">直接要答案？智能体会这样回应你：先把问题拆成你能回答的小问题，答对了才进入下一步；最后给的是"思路支架"和一道变式题——因为 <b style="color:var(--ochre)">自己想通的答案，才真正属于你</b>。这也是错题归因数据最真实的来源。</p></div>';
    this.state = { flow: null, stepIdx: 0, waiting: false, answered: {} };
  },
  start: function (fid) {
    var f = KB.tutorFlows.find(function (x) { return x.id === fid; });
    this.state = { flow: f, stepIdx: 0, waiting: false, answered: {} };
    document.getElementById('tutorPick').style.display = 'none';
    document.getElementById('tutorSession').innerHTML =
      '<div class="card"><h3>' + f.title + ' <span class="tag tag-ochre">' + f.tag + '</span></h3>' +
      '<div class="chat" id="chatBox"></div>' +
      '<div id="chatInput" style="margin-top:14px"></div>' +
      '<div style="margin-top:12px"><button class="btn btn-outline btn-sm" onclick="App.pages.tutor.quit()">← 换一个问题</button></div></div>';
    this.next();
  },
  quit: function () { this.render(document.getElementById('app')); },
  push: function (role, html) {
    var box = document.getElementById('chatBox');
    var who = role === 'bot' ? '史鉴智师' : '你';
    var cls = role === 'bot' ? 'bot' : 'stu';
    var div = document.createElement('div');
    div.className = 'msg ' + cls + ' fade-in';
    div.innerHTML = '<div class="who">' + who + '</div>' + html;
    box.appendChild(div);
    if (typeof div.scrollIntoView === 'function') div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },
  next: function () {
    var st = this.state;
    if (!st.flow) return;
    if (st.stepIdx >= st.flow.steps.length) { this.finish(); return; }
    var step = st.flow.steps[st.stepIdx];
    var self = this;
    if (step.role === 'bot') {
      st.waiting = true;
      setTimeout(function () {
        self.push('bot', step.text);
        st.stepIdx++;
        st.waiting = false;
        self.next();
      }, 600);
    } else if (step.role === 'choice') {
      var html = '<p class="muted" style="margin-bottom:8px">选一个你的想法：</p>';
      step.options.forEach(function (op, i) {
        html += '<button class="btn btn-outline btn-sm" style="display:block;margin:6px 0;text-align:left;padding:8px 14px" onclick="App.pages.tutor.pick(' + i + ')">' + op.label + '</button>';
      });
      document.getElementById('chatInput').innerHTML = html;
    } else if (step.role === 'scaffold') {
      this.push('bot', '<b>' + step.title + '</b><br><br>' + step.html);
      st.stepIdx++;
      var btn = document.getElementById('chatInput');
      btn.innerHTML = '<button class="btn btn-sm" onclick="App.pages.tutor.next()">我明白了，来检验一下 →</button>';
    } else if (step.role === 'practice') {
      this.renderPractice(step.qid);
    }
  },
  pick: function (i) {
    var st = this.state;
    var step = st.flow.steps[st.stepIdx];
    var op = step.options[i];
    this.push('stu', op.label);
    var self = this;
    document.getElementById('chatInput').innerHTML = '';
    setTimeout(function () {
      self.push('bot', op.ok
        ? '<span style="color:#2F6E5E"><b>✓ ' + op.reply + '</span></b>'
        : '<span style="color:#A93B2E"><b>再想想：</b></span>' + op.reply);
      st.stepIdx++;
      if (!op.ok) {
        setTimeout(function () { self.next(); }, 400);
      } else {
        self.next();
      }
    }, 500);
  },
  renderPractice: function (qid) {
    var q = KB.qById(qid);
    var st = this.state;
    st.stepIdx++;
    var html = '<b>变式检验</b>（答案将在你提交作答后解锁）<br><br>' + q.stem + '<br><br>';
    if (q.opts) {
      q.opts.forEach(function (o, i) {
        html += '<button class="btn btn-outline btn-sm" style="margin:4px 6px 4px 0" onclick="App.pages.tutor.submitOpt(\'' + qid + '\',' + i + ')">' + String.fromCharCode(65 + i) + '</button>';
      });
    } else {
      html += '<textarea id="practiceTa" style="width:100%;min-height:90px" placeholder="分点写下你的答案…"></textarea>' +
        '<button class="btn btn-sm" style="margin-top:8px" onclick="App.pages.tutor.submitTa(\'' + qid + '\')">提交作答</button>';
    }
    this.push('bot', html);
    document.getElementById('chatInput').innerHTML = '<span class="muted">完成变式题后，本题将连同你的作答情况写入个人学情档案</span>';
  },
  submitOpt: function (qid, i) {
    var q = KB.qById(qid);
    var right = String.fromCharCode(65 + i) === q.ans;
    this.push('stu', String.fromCharCode(65 + i));
    var self = this;
    setTimeout(function () {
      self.push('bot', (right ? '<b style="color:#2F6E5E">✓ 回答正确！</b><br><br>' : '<b style="color:#A93B2E">✗ 再看一遍题目…</b><br><br>') +
        '<b>参考答案：' + q.ans + '</b><br><b>判分点：</b><ul style="padding-left:18px">' + q.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<b>解析：</b>' + q.analysis);
      self.finish();
    }, 500);
  },
  submitTa: function (qid) {
    var q = KB.qById(qid);
    var ta = document.getElementById('practiceTa');
    var val = (ta.value || '').trim();
    if (!val) { ta.style.borderColor = '#A93B2E'; ta.placeholder = '先写下你的思考，答案才会解锁哦'; return; }
    this.push('stu', val);
    var self = this;
    document.getElementById('chatInput').innerHTML = '';
    setTimeout(function () {
      self.push('bot', '<b>已收到你的作答（' + val.length + ' 字）。</b><br><br>对照判分点自评：<ul style="padding-left:18px">' +
        q.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<b>参考答案要点：' + q.ans + '</b><br><b>解析：</b>' + q.analysis);
      self.finish();
    }, 600);
  },
  finish: function () {
    this.push('bot', '✅ 本次辅导完成。你的表现已记录到个人学情档案，系统会据此调整错题本与复习规划。学而不思则罔——今天你自己想通的部分，才是真正带走的收获。');
    document.getElementById('chatInput').innerHTML =
      '<button class="btn btn-sm" onclick="App.pages.tutor.quit()">← 再选一个问题</button> ' +
      '<button class="btn btn-outline btn-sm" onclick="App.go(\'mistakes\')">查看我的错题本 →</button>';
  }
};

/* ---------------- 错题本 ---------------- */
App.pages.mistakes = {
  render: function (main) {
    var cats = ['概念混淆', '审题偏差', '表达不规范', '时序错乱'];
    var colors = { '概念混淆': 'tag-adv', '审题偏差': 'tag-mid', '表达不规范': 'tag-basic', '时序错乱': 'tag-ochre' };
    var self = this;
    var catHtml = cats.map(function (c) {
      var list = KB.mistakes.filter(function (m) { return m.note === c; });
      var items = list.map(function (m) {
        var q = KB.qById(m.qid);
        return '<div class="verdict"><b>' + m.student + '</b> · ' + KB.lessonById(q.lesson).name + ' · ' + m.kp +
          '<br><span class="muted">' + m.summary + '</span></div>';
      }).join('');
      return App.card('错因分类：' + c + '（' + list.length + ' 条）' +
        ' <button class="btn btn-outline btn-sm no-print" onclick="App.pages.mistakes.drill(\'' + c + '\')">生成补强练习</button>',
        items || '<p class="muted">暂无该类错题</p>');
    }).join('');
    main.innerHTML =
      App.pageHead('错题本 · 归因与补强', '错因来自 WF2 批改与变式练习的自动归档：概念混淆 / 审题偏差 / 表达不规范 / 时序错乱', '学生端') +
      '<div class="grid grid-2">' + catHtml + '</div>' +
      '<div id="drillBox"></div>';
  },
  drill: function (cat) {
    var drillMap = {
      '概念混淆': ['q38', 'q39', 'q28', 'q13'],
      '审题偏差': ['q43', 'q41', 'q3', 'q29'],
      '表达不规范': ['q4', 'q15', 'q19'],
      '时序错乱': ['q37', 'q11', 'q6', 'q16']
    };
    var ids = drillMap[cat] || [];
    var qs = ids.map(function (id) { return KB.qById(id); }).filter(Boolean);
    var html = App.card('补强练习 · ' + cat + '（针对 ' + qs.length + ' 个薄弱点自动组卷）',
      qs.map(function (q, i) {
        return '<p style="margin:10px 0 4px"><b>' + (i + 1) + '.（' + KB.levelName[q.level] + '）</b>' + q.stem + '</p>' +
          (q.opts ? '<p class="muted">' + q.opts.map(function (o, j) { return String.fromCharCode(65 + j) + '. ' + o; }).join('　') + '</p>' : '') +
          '<details><summary style="cursor:pointer;font-family:var(--sans);font-size:12.5px;color:var(--green)">答案与判分点</summary><div class="verdict ok"><b>答案：' + q.ans + '</b><br>' + q.points.join('；') + '</div></details>';
      }).join('') +
      '<p class="muted" style="margin-top:8px">建议完成后在本页面自评，连续两次全对则该错因等级下调。</p>');
    document.getElementById('drillBox').innerHTML = html + '<div class="card no-print" style="text-align:center"><button class="btn btn-green btn-sm" onclick="App.pages.mistakes.printDrill()">打印练习 / 导出 PDF</button></div>';
    this._drillHtml = html;
  },
  printDrill: function () { window.print(); }
};

/* ---------------- 复习规划 ---------------- */
App.pages.plan = {
  render: function (main) {
    var a = KB.analytics;
    var dims = a.dims.concat(['素养·史料实证']);
    var checks = dims.map(function (d, i) {
      return '<label style="display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:13.5px;margin:6px 10px;cursor:pointer">' +
        '<input type="checkbox" class="planDim" value="' + d + '"> ' + d + '</label>';
    }).join('');
    main.innerHTML =
      App.pageHead('复习规划 · WF4 工作流', '依据个人能力雷达与中考考情库，生成"按册过关 + 专题突破 + 限时模拟"的滚动计划', '学生端') +
      App.card('第 1 步 · 选择你的薄弱维度',
        '<p class="muted">参考下方学情雷达的建议（系统默认已结合你的个人档案）：</p>' + checks +
        '<div style="margin-top:12px">' +
        '<button class="btn" onclick="App.pages.plan.gen(false)">生成周计划</button> ' +
        '<button class="btn btn-outline" onclick="App.pages.plan.gen(true)">生成中考三轮总规划</button></div>') +
      '<div id="planResult"></div>';
  },
  gen: function (full) {
    var picks = Array.prototype.slice.call(document.querySelectorAll('.planDim:checked')).map(function (c) { return c.value; });
    var defaults = full ? ['中国近代史通史', '史料实证专项'] : ['魏晋隋唐', '近代化探索'];
    var dims = picks.length ? picks : defaults;
    var lessonMap = {
      '先秦变革': 'shangyang', '秦汉统一': 'qin', '魏晋隋唐': 'tang', '明清时期': 'zhenghe',
      '列强侵略': 'yingpian', '近代化探索': 'yangwu', '革命与建国': 'xinhai', '社会生活与文化': 'tang'
    };
    var rows = dims.map(function (d, i) {
      var lid = lessonMap[d] || 'shangyang';
      var l = KB.lessonById(lid);
      var day = ['周一（30 分钟）', '周二（30 分钟）', '周四（30 分钟）', '周六（60 分钟）'][i % 4];
      return '<tr><td>' + (i + 1) + '</td><td>' + day + '</td><td>' + d + '</td>' +
        '<td>① 复习《' + l.name + '》主干并手绘时间轴；② 完成基础层练习；③ 错题归因打卡</td></tr>';
    }).join('');
    var html;
    if (full) {
      html = App.card('中考三轮总规划（依据薄弱维度：' + dims.join('、') + '）',
        '<table class="tb"><tr><th>轮次</th><th>时间</th><th>主线</th><th>本周落点</th></tr>' +
        '<tr><td>一轮 · 按册过关</td><td>第 1—8 周</td><td>六册教材逐册过主干，配基础层练习</td><td>' + dims[0] + ' 单元梳理</td></tr>' +
        '<tr><td>二轮 · 专题突破</td><td>第 9—14 周</td><td>8 大专题 + 素养专项（史料实证 / 历史解释）</td><td>"' + dims[1] + '"专题卷</td></tr>' +
        '<tr><td>三轮 · 限时模拟</td><td>第 15—17 周</td><td>中考真题限时训练 + 错题回炉</td><td>每周 2 套限时卷</td></tr></table>' +
        '<p class="muted" style="margin-top:8px">每周日晚系统依据本周正确率自动调整下周任务（滚动式闭环）。</p>');
    } else {
      html = App.card('本周复习计划（薄弱维度：' + dims.join('、') + '）',
        '<table class="tb"><tr><th>#</th><th>时段</th><th>薄弱维度</th><th>任务（对应知识库课目）</th></tr>' + rows + '</table>' +
        '<p class="muted" style="margin-top:8px">任务难度随完成度动态升降；周五晚将推送一次 10 分钟小测检验本周效果。</p>');
    }
    document.getElementById('planResult').innerHTML = html +
      '<div class="card no-print" style="text-align:center"><button class="btn btn-outline btn-sm" onclick="App.go(\'tutor\')">去答疑巩固 →</button> <button class="btn btn-outline btn-sm" onclick="App.go(\'timeline\')">用时间轴梳理 →</button></div>';
  }
};
