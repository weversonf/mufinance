<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mu Wallet v07</title>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<style>
  :root {
    --bg-body: #f0f0f0;
    --bg-app: #ffffff;
    --bg-top: #e8e8e8;
    --text-main: #111111;
    --text-sec: #555555;
    --text-muted: #999999;
    --border: #f0f0f0;
    --card-bg: #f7f7f5;
    --primary: #1a7a4a;
    --primary-light: #e6f5ec;
    --modal-bg: #ffffff;
    --input-bg: #ffffff;
    --input-border: #e8e8e8;
    --tab-inactive: #cccccc;
  }

  [data-theme="dark"] {
    --bg-body: #000000;
    --bg-app: #121212;
    --bg-top: #1a1a1a;
    --text-main: #ffffff;
    --text-sec: #bbbbbb;
    --text-muted: #777777;
    --border: #222222;
    --card-bg: #1e1e1e;
    --primary: #2ecc71;
    --primary-light: #1a3a2a;
    --modal-bg: #1e1e1e;
    --input-bg: #2a2a2a;
    --input-border: #333333;
    --tab-inactive: #555555;
  }

  *{box-sizing:border-box;margin:0;padding:0;transition: background 0.3s, color 0.3s}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg-body);min-height:100vh;display:flex;align-items:flex-start;justify-content:center}
  .app{width:100%;max-width:420px;min-height:100vh;background:var(--bg-app);display:flex;flex-direction:column;overflow:hidden;position:relative}
  .top-bar{background:var(--bg-top);padding:52px 20px 16px}
  .greeting{display:flex;justify-content:space-between;align-items:flex-start}
  .greeting h3{font-size:15px;font-weight:400;color:var(--text-main);line-height:1.5}
  .greeting h3 span{font-weight:700}
  .icons{display:flex;gap:8px}
  .icon-btn{width:36px;height:36px;border-radius:50%;background:var(--bg-app);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--text-sec);transition:background .15s}
  .icon-btn:hover{background:var(--border)}
  .balance-section{text-align:center;padding:14px 20px 4px}
  .currency-badge{display:inline-flex;align-items:center;gap:4px;background:var(--bg-app);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500;color:var(--text-sec);margin-bottom:6px}
  .balance{font-size:44px;font-weight:800;color:var(--text-main);letter-spacing:-2px}
  .balance sup{font-size:22px;vertical-align:super;font-weight:600}
  .balance small{font-size:24px;font-weight:400;color:var(--text-sec)}
  .change-badge{display:inline-flex;align-items:center;gap:4px;background:var(--primary);color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;margin-top:8px}
  .actions{display:flex;gap:8px;padding:14px 16px;background:var(--bg-top);align-items:center;justify-content:center}
  .action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px;border-radius:16px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;font-family:inherit}
  .action-btn:hover{opacity:.8}
  .action-btn:active{transform:scale(.97)}
  .action-btn.side{background:var(--bg-app);color:var(--text-main)}
  .action-btn.center-btn{background:var(--primary);color:#fff;border-radius:50%;width:50px;height:50px;flex:0 0 50px;font-size:20px;padding:0}
  .content{background:var(--bg-app);border-radius:32px 32px 0 0;padding:20px 18px;flex:1;margin-top:-10px;overflow-y:auto}
  .section-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .section-label{font-size:14px;font-weight:700;color:var(--text-main)}
  .section-link{font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:2px;cursor:pointer;text-decoration:none;background:none;border:none;font-family:inherit}
  .send-again{display:flex;gap:8px;margin-bottom:8px}
  .avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0;cursor:pointer;transition:transform .15s;border:none;font-family:inherit}
  .avatar:hover{transform:scale(1.08)}
  .avatar-add{background:var(--card-bg) !important;color:var(--text-muted) !important;font-size:22px;border:2px dashed var(--border) !important}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
  .income-card{background:var(--card-bg);border-radius:18px;padding:14px}
  .income-label{font-size:11px;color:var(--text-muted);margin-bottom:4px;font-weight:500}
  .income-amount{font-size:18px;font-weight:800;color:var(--text-main);margin-top:2px}
  .income-change{display:inline-flex;align-items:center;gap:3px;background:var(--primary-light);color:var(--primary);font-size:11px;font-weight:700;border-radius:10px;padding:3px 8px;margin-top:6px}
  .chart-wrap{height:52px;margin:6px 0}
  svg.mini-chart{width:100%;height:52px}
  .transactions{border-top:1px solid var(--border);padding-top:4px}
  .tx-item{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s;border-radius:10px;padding:10px 6px}
  .tx-item:hover{background:var(--card-bg)}
  .tx-logo{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .tx-info{flex:1}
  .tx-name{font-size:13px;font-weight:600;color:var(--text-main)}
  .tx-date{font-size:11px;color:var(--text-muted);margin-top:2px}
  .tx-amount{font-size:14px;font-weight:700}
  .tx-amount.neg{color:#c0392b}
  .tx-amount.pos{color:var(--primary)}
  .tab-bar{display:flex;justify-content:space-around;padding:12px 0 28px;border-top:1px solid var(--border);margin-top:6px;background:var(--bg-app);position:sticky;bottom:0}
  .tab{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;color:var(--tab-inactive);cursor:pointer;transition:color .15s;font-weight:500;background:none;border:none;font-family:inherit;padding:4px 16px}
  .tab:hover{color:var(--text-sec)}
  .tab.active{color:var(--primary)}
  .tab i{font-size:22px}

  /* Modal overlay */
  .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;align-items:flex-end;justify-content:center}
  .modal-overlay.open{display:flex}
  .modal{background:var(--modal-bg);border-radius:28px 28px 0 0;padding:24px 20px 40px;width:100%;max-width:420px;animation:slideUp .25s ease;max-height:90vh;overflow-y:auto}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .modal h2{font-size:16px;font-weight:700;color:var(--text-main);margin-bottom:20px}
  .modal-close{float:right;background:none;border:none;font-size:22px;color:var(--text-muted);cursor:pointer;line-height:1}
  .field-label{font-size:12px;color:var(--text-muted);font-weight:500;margin-bottom:6px;display:block}
  .field-input{width:100%;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-main);border-radius:12px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;transition:border .15s;margin-bottom:14px}
  .field-input:focus{border-color:var(--primary)}
  .contacts-row{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px}
  .contact-chip{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;min-width:52px}
  .contact-chip .av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;border:2px solid transparent;transition:border .15s}
  .contact-chip.selected .av{border-color:var(--primary)}
  .contact-chip span{font-size:10px;color:var(--text-muted);white-space:nowrap}
  .submit-btn{width:100%;background:var(--primary);color:#fff;border:none;border-radius:16px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s}
  .submit-btn:hover{opacity:.88}
  .submit-btn:active{transform:scale(.98)}
  .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;color:#fff;border-radius:20px;padding:10px 20px;font-size:13px;font-weight:500;z-index:200;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
  .toast.show{opacity:1}

  /* Horizontal Category Selection */
  .category-scroll{display:flex;gap:12px;overflow-x:auto;padding:4px 0 16px;margin-bottom:4px;scrollbar-width:none}
  .category-scroll::-webkit-scrollbar{display:none}
  .cat-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;min-width:64px;transition:transform 0.2s}
  .cat-item:active{transform:scale(0.9)}
  .cat-icon{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--card-bg);color:var(--text-sec);border:2px solid transparent;transition:all 0.2s}
  .cat-item.selected .cat-icon{background:var(--primary-light);color:var(--primary);border-color:var(--primary)}
  .cat-name{font-size:10px;color:var(--text-sec);text-align:center;font-weight:600;white-space:nowrap}

  /* Page structures */
  .page{display:none;flex-direction:column;flex:1;background:var(--bg-app);min-height:100vh}
  .page.active{display:flex}
  .page-header{display:flex;align-items:center;gap:10px;padding:52px 18px 16px;background:var(--bg-app);border-bottom:1px solid var(--border)}
  .back-btn{background:none;border:none;font-size:22px;color:var(--text-sec);cursor:pointer;padding:4px}
  .page-title{font-size:17px;font-weight:700;color:var(--text-main)}
  .filter-row{display:flex;gap:8px;padding:12px 18px;overflow-x:auto}
  .filter-chip{background:var(--card-bg);border:none;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--text-sec);cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s}
  .filter-chip.active{background:var(--primary);color:#fff}
  .page-content{padding:18px;flex:1;overflow-y:auto}
  
  /* Card Page Styles */
  .card-item{background:linear-gradient(135deg, var(--primary), #2d5a43);border-radius:20px;padding:20px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden;box-shadow:0 8px 16px rgba(0,0,0,0.1)}
  .card-item::after{content:'';position:absolute;top:-20%;right:-10%;width:150px;height:150px;background:rgba(255,255,255,0.1);border-radius:50%}
  .card-type{font-size:12px;opacity:0.8;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px}
  .card-number{font-size:18px;letter-spacing:2px;margin-bottom:20px;font-family:monospace}
  .card-footer{display:flex;justify-content:space-between;align-items:flex-end}
  .card-holder{font-size:14px;font-weight:600}
  .card-expiry{font-size:12px;opacity:0.8}

  /* Profile Page Styles */
  .profile-header{text-align:center;padding:20px 0}
  .profile-avatar{width:80px;height:80px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 12px}
  .profile-name{font-size:18px;font-weight:700;color:var(--text-main)}
  .profile-email{font-size:13px;color:var(--text-muted);margin-top:4px}
  .menu-list{margin-top:24px}
  .menu-item{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border);cursor:pointer}
  .menu-item i{font-size:20px;color:var(--text-sec)}
  .menu-item span{font-size:14px;font-weight:500;color:var(--text-main);flex:1}
  .menu-item .ti-chevron-right{font-size:16px;color:var(--text-muted)}
  .menu-item .toggle-switch{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;transition:0.3s}
  .menu-item .toggle-switch::after{content:'';width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
  .menu-item.active .toggle-switch{background:var(--primary)}
  .menu-item.active .toggle-switch::after{left:22px}

  /* Config Categories Page List */
  .config-group{margin-bottom:24px}
  .config-cat-item{background:var(--card-bg);border-radius:12px;margin-bottom:10px;overflow:hidden;border:1px solid var(--border)}
  .cat-main{display:flex;align-items:center;gap:12px;padding:12px}
  .cat-main .icon{width:36px;height:36px;border-radius:8px;background:var(--bg-app);display:flex;align-items:center;justify-content:center;font-size:18px}
  .cat-main .name{flex:1;font-size:14px;font-weight:600;color:var(--text-main)}
  .cat-main .actions-btns{display:flex;gap:8px}
  .cat-main .btn{color:var(--text-muted);cursor:pointer;padding:4px;font-size:18px}
  .cat-main .btn.edit:hover{color:var(--primary)}
  .cat-main .btn.delete:hover{color:#c0392b}
  
  .subcat-list{padding:0 12px 12px 48px;display:flex;flex-direction:column;gap:8px}
  .subcat-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-app);border-radius:8px;border:1px solid var(--border)}
  .subcat-item .name{flex:1;font-size:13px;color:var(--text-sec)}
  .subcat-item .btn{color:var(--text-muted);cursor:pointer;font-size:16px}
  .subcat-item .btn:hover{color:var(--primary)}

  .badge-default{font-size:9px;background:var(--border);color:var(--text-muted);padding:2px 6px;border-radius:4px;text-transform:uppercase;font-weight:700;margin-left:6px}

  .tx-group-label{font-size:11px;font-weight:700;color:var(--text-muted);margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px}

  .report-cat-item{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:10px;border-bottom:1px solid var(--border)}
  .report-cat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .report-cat-info{flex:1}
  .report-cat-name{font-size:13px;font-weight:600;color:var(--text-main)}
  .report-cat-count{font-size:11px;color:var(--text-muted)}
  .report-cat-amount{font-size:14px;font-weight:700;text-align:right}
  .report-cat-bar{height:4px;border-radius:2px;background:var(--border);margin-top:4px;overflow:hidden}
  .report-cat-fill{height:100%;border-radius:2px}

  .annual-chart-wrap{background:var(--card-bg);border-radius:16px;padding:16px;margin-bottom:16px}
  .annual-chart-wrap h4{font-size:13px;font-weight:600;color:var(--text-main);margin-bottom:12px}
  .annual-chart-wrap canvas{width:100%;height:160px;display:block}

  .profile-field{margin-bottom:14px}
  .profile-field label{font-size:11px;color:var(--text-muted);font-weight:500;display:block;margin-bottom:4px}
  .profile-field .value{font-size:14px;font-weight:600;color:var(--text-main);padding:8px 12px;background:var(--card-bg);border-radius:10px;display:flex;justify-content:space-between;align-items:center}
  .profile-field .value .edit-btn{background:none;border:none;color:var(--primary);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}
  .profile-field .value .restriction{font-size:10px;color:var(--text-muted);font-weight:400}

  .card-add-btn{background:var(--card-bg);border:2px dashed var(--border);border-radius:20px;padding:16px;text-align:center;cursor:pointer;color:var(--text-muted);font-size:14px;font-weight:600;font-family:inherit;width:100%;transition:all .15s}
  .card-add-btn:hover{background:var(--border)}

  .notif-badge{position:absolute;top:0;right:0;width:8px;height:8px;background:#c0392b;border-radius:50%;display:none}
  .notif-badge.show{display:block}

  /* LOGIN */
  .login-page{position:fixed;inset:0;z-index:999;background:var(--bg-body);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px}
  .login-page.hidden{display:none}
  .login-logo{font-size:32px;font-weight:800;color:var(--primary);letter-spacing:-1px}
  .login-sub{font-size:14px;color:var(--text-muted)}
  .login-btn{display:flex;align-items:center;gap:10px;padding:12px 28px;border-radius:16px;border:2px solid var(--border);background:var(--bg-app);color:var(--text-main);font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
  .login-btn:hover{background:var(--card-bg);border-color:var(--primary)}
  .login-btn i{font-size:22px}
  .login-avatar{width:64px;height:64px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700}
</style>
</head>
<body data-theme="light">

<!-- LOGIN PAGE -->
<div class="login-page" id="login-page">
  <div class="login-logo">Mu Finance</div>
  <div class="login-sub">Gerencie suas finanças com segurança</div>
  <button class="login-btn" onclick="signInGoogle()"><i class="ti ti-brand-google"></i> Entrar com Google</button>
</div>

<!-- HOME PAGE -->
<div class="app page active" id="home-page">
  <div class="top-bar">
    <div class="greeting">
      <h3>Olá, <span>Ben!</span><br><span style="font-weight:400;font-size:12px;color:var(--text-muted)">Bem-vindo à sua carteira</span></h3>
      <div class="icons">
        <button class="icon-btn" title="Menu"><i class="ti ti-grid-dots"></i></button>
        <button class="icon-btn" title="Notificações" id="notif-btn" style="position:relative"><i class="ti ti-bell"></i><span class="notif-badge" id="notif-badge"></span></button>
      </div>
    </div>
    <div class="balance-section">
      <div class="currency-badge"><i class="ti ti-coin" style="font-size:13px"></i> BRL</div>
      <div class="balance" id="main-balance"><sup>R$</sup>12.329<small>,20</small></div>
      <div><span class="change-badge"><i class="ti ti-trending-up" style="font-size:13px"></i> +2,10%</span></div>
    </div>
  </div>

  <div class="actions">
    <button class="action-btn side" onclick="openModal('receive')">
      <i class="ti ti-plus" style="font-size:16px"></i> Receita
    </button>
    <button class="action-btn center-btn" title="Trocar" onclick="showToast('Câmbio em breve!')">
      <i class="ti ti-arrows-exchange"></i>
    </button>
    <button class="action-btn side" onclick="openModal('send')">
      <i class="ti ti-minus" style="font-size:16px"></i> Despesa
    </button>
  </div>

  <div class="content">
    <div class="two-col">
      <div class="send-col">
        <div class="section-label" style="margin-bottom:10px">Enviar novamente</div>
        <div class="send-again">
          <button class="avatar" style="background:#e07a3a" onclick="openSendTo('AM','Ana M.')">AM</button>
          <button class="avatar" style="background:#5b7fa6" onclick="openSendTo('JL','João L.')">JL</button>
          <button class="avatar avatar-add" onclick="showToast('Adicionar contato')">+</button>
        </div>
        <div class="send-again">
          <button class="avatar" style="background:#7a5ba6" onclick="openSendTo('CR','Carlos R.')">CR</button>
          <button class="avatar" style="background:#3a8a5a" onclick="openSendTo('MK','Maria K.')">MK</button>
        </div>
      </div>
      <div class="income-card">
        <div class="income-label">Sua renda · Este mês</div>
        <div class="chart-wrap">
          <svg class="mini-chart" viewBox="0 0 120 52" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="0,44 15,40 30,38 45,32 60,30 75,22 90,16 105,10 120,6 120,52 0,52" fill="url(#g)"/>
            <polyline points="0,44 15,40 30,38 45,32 60,30 75,22 90,16 105,10 120,6"
              fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="income-amount" id="income-amount">R$ 2.432,43</div>
        <div class="income-change"><i class="ti ti-trending-up" style="font-size:11px"></i> +2,10%</div>
      </div>
    </div>

    <div class="section-row">
      <span class="section-label">Atividade recente</span>
      <button class="section-link" onclick="showPage('transactions')">Ver tudo <i class="ti ti-chevron-right" style="font-size:13px"></i></button>
    </div>

    <div class="transactions" id="recent-tx-list"></div>

  </div>

  <div class="tab-bar">
    <button class="tab active" onclick="showPage('home')"><i class="ti ti-home"></i><span>Início</span></button>
    <button class="tab" onclick="showPage('transactions')"><i class="ti ti-chart-bar"></i><span>Extrato</span></button>
    <button class="tab" onclick="showPage('reports')"><i class="ti ti-report"></i><span>Relatórios</span></button>
    <button class="tab" onclick="showPage('cards')"><i class="ti ti-credit-card"></i><span>Cartões</span></button>
    <button class="tab" onclick="showPage('profile')"><i class="ti ti-user"></i><span>Perfil</span></button>
  </div>
</div>

<!-- TRANSACTIONS PAGE (EXTRATO) -->
<div class="app page" id="transactions-page">
  <div class="page-header">
    <button class="back-btn" onclick="showPage('home')"><i class="ti ti-arrow-left"></i></button>
    <span class="page-title">Extrato</span>
  </div>
  <div class="filter-row" id="filter-row">
    <button class="filter-chip active" onclick="filterTx('all',this)">Todas</button>
    <button class="filter-chip" onclick="filterTx('entrada',this)">Entradas</button>
    <button class="filter-chip" onclick="filterTx('saída',this)">Saídas</button>
  </div>
  <div class="page-content" id="all-tx-list"></div>
  <div class="tab-bar">
    <button class="tab" onclick="showPage('home')"><i class="ti ti-home"></i><span>Início</span></button>
    <button class="tab active" onclick="showPage('transactions')"><i class="ti ti-chart-bar"></i><span>Extrato</span></button>
    <button class="tab" onclick="showPage('reports')"><i class="ti ti-report"></i><span>Relatórios</span></button>
    <button class="tab" onclick="showPage('cards')"><i class="ti ti-credit-card"></i><span>Cartões</span></button>
    <button class="tab" onclick="showPage('profile')"><i class="ti ti-user"></i><span>Perfil</span></button>
  </div>
</div>

<!-- CARDS PAGE -->
<div class="app page" id="cards-page">
  <div class="page-header">
    <button class="back-btn" onclick="showPage('home')"><i class="ti ti-arrow-left"></i></button>
    <span class="page-title">Meus Cartões</span>
  </div>
  <div class="page-content" id="cards-list"></div>
  <div class="tab-bar">
    <button class="tab" onclick="showPage('home')"><i class="ti ti-home"></i><span>Início</span></button>
    <button class="tab" onclick="showPage('transactions')"><i class="ti ti-chart-bar"></i><span>Extrato</span></button>
    <button class="tab" onclick="showPage('reports')"><i class="ti ti-report"></i><span>Relatórios</span></button>
    <button class="tab active" onclick="showPage('cards')"><i class="ti ti-credit-card"></i><span>Cartões</span></button>
    <button class="tab" onclick="showPage('profile')"><i class="ti ti-user"></i><span>Perfil</span></button>
  </div>
</div>

<!-- PROFILE PAGE -->
<div class="app page" id="profile-page">
  <div class="page-header">
    <button class="back-btn" onclick="showPage('home')"><i class="ti ti-arrow-left"></i></button>
    <span class="page-title">Perfil</span>
  </div>
  <div class="page-content">
    <div class="profile-header" id="profile-header">
      <div class="profile-avatar" id="profile-avatar">B</div>
      <div class="profile-name" id="profile-name">Benjamin Smith</div>
      <div class="profile-email" id="profile-email">ben.smith@example.com</div>
    </div>
    <div id="profile-fields"></div>
    <div class="menu-list">
      <div class="menu-item" onclick="showPage('config-categories')">
        <i class="ti ti-category"></i>
        <span>Configurar Categorias</span>
        <i class="ti ti-chevron-right"></i>
      </div>
      <div class="menu-item" id="theme-toggle" onclick="toggleTheme()">
        <i class="ti ti-moon"></i>
        <span>Modo Escuro</span>
        <div class="toggle-switch"></div>
      </div>
      <div class="menu-item" style="border:none" onclick="signOutUser()">
        <i class="ti ti-logout" style="color:#c0392b"></i>
        <span style="color:#c0392b">Sair</span>
      </div>
    </div>
  </div>
  <div class="tab-bar">
    <button class="tab" onclick="showPage('home')"><i class="ti ti-home"></i><span>Início</span></button>
    <button class="tab" onclick="showPage('transactions')"><i class="ti ti-chart-bar"></i><span>Extrato</span></button>
    <button class="tab" onclick="showPage('reports')"><i class="ti ti-report"></i><span>Relatórios</span></button>
    <button class="tab" onclick="showPage('cards')"><i class="ti ti-credit-card"></i><span>Cartões</span></button>
    <button class="tab active" onclick="showPage('profile')"><i class="ti ti-user"></i><span>Perfil</span></button>
  </div>
</div>

<!-- REPORTS PAGE -->
<div class="app page" id="reports-page">
  <div class="page-header">
    <button class="back-btn" onclick="showPage('home')"><i class="ti ti-arrow-left"></i></button>
    <span class="page-title">Relatórios</span>
  </div>
  <div class="page-content">
    <div class="two-col" style="margin-bottom:16px">
      <div class="income-card">
        <div class="income-label">Receitas</div>
        <div class="income-amount" style="color:var(--primary)" id="report-income">R$ 0,00</div>
      </div>
      <div class="income-card">
        <div class="income-label">Despesas</div>
        <div class="income-amount" style="color:#c0392b" id="report-expense">R$ 0,00</div>
      </div>
    </div>
    <div class="annual-chart-wrap">
      <h4>Receitas vs Despesas · <span id="chart-year">2026</span></h4>
      <canvas id="annual-chart"></canvas>
    </div>
    <div class="section-row">
      <span class="section-label">Por categoria</span>
    </div>
    <div id="report-by-category"></div>
  </div>
  <div class="tab-bar">
    <button class="tab" onclick="showPage('home')"><i class="ti ti-home"></i><span>Início</span></button>
    <button class="tab" onclick="showPage('transactions')"><i class="ti ti-chart-bar"></i><span>Extrato</span></button>
    <button class="tab active" onclick="showPage('reports')"><i class="ti ti-report"></i><span>Relatórios</span></button>
    <button class="tab" onclick="showPage('cards')"><i class="ti ti-credit-card"></i><span>Cartões</span></button>
    <button class="tab" onclick="showPage('profile')"><i class="ti ti-user"></i><span>Perfil</span></button>
  </div>
</div>

<!-- CONFIG CATEGORIES PAGE -->
<div class="app page" id="config-categories-page">
  <div class="page-header">
    <button class="back-btn" onclick="showPage('profile')"><i class="ti ti-arrow-left"></i></button>
    <span class="page-title">Categorias</span>
  </div>
  <div class="page-content">
    <div class="config-group">
      <div class="section-label" style="margin-bottom:12px">Despesas</div>
      <div id="config-out-list"></div>
    </div>
    <div class="config-group">
      <div class="section-label" style="margin-bottom:12px">Receitas</div>
      <div id="config-in-list"></div>
    </div>
    <button class="submit-btn" style="background:var(--card-bg);color:var(--text-sec);margin-top:10px" onclick="addCustomCategory()">
      <i class="ti ti-plus"></i> Nova Categoria
    </button>
  </div>
</div>

<!-- TRANSACTION MODAL -->
<div class="modal-overlay" id="tx-modal">
  <div class="modal">
    <h2 id="modal-title">Nova Operação <button class="modal-close" onclick="closeModal('tx-modal')"><i class="ti ti-x"></i></button></h2>
    
    <label class="field-label" id="modal-user-label">Para (opcional)</label>
    <div class="contacts-row" id="modal-contacts"></div>
    <input class="field-input" id="modal-user-input" placeholder="Nome ou @usuário" />
    
    <label class="field-label">Categoria</label>
    <div class="category-scroll" id="modal-categories"></div>
    
    <div id="modal-subcategories-container" style="display:none">
      <label class="field-label">Subcategoria</label>
      <div class="category-scroll" id="modal-subcategories"></div>
    </div>
    
    <label class="field-label">Valor (BRL)</label>
    <input class="field-input" id="modal-amount" type="number" placeholder="0,00" min="0" step="0.01" />
    
    <label class="field-label">Descrição (opcional)</label>
    <input class="field-input" id="modal-desc" placeholder="..." />
    
    <button class="submit-btn" id="modal-submit" onclick="submitTransaction()">Confirmar</button>
    <button class="submit-btn" id="modal-delete" onclick="deleteTransaction()" style="background:#c0392b;margin-top:10px;display:none">Excluir Transação</button>
  </div>
</div>

<!-- CARD MODAL -->
<div class="modal-overlay" id="card-modal">
  <div class="modal">
    <h2 id="card-modal-title">Adicionar Cartão <button class="modal-close" onclick="closeModal('card-modal')"><i class="ti ti-x"></i></button></h2>
    <label class="field-label">Bandeira</label>
    <select class="field-input" id="card-type">
      <option value="Visa">Visa</option>
      <option value="Mastercard">Mastercard</option>
      <option value="Elo">Elo</option>
      <option value="Amex">Amex</option>
    </select>
    <label class="field-label">Número do Cartão</label>
    <input class="field-input" id="card-number" placeholder="**** **** **** 0000" maxlength="19" />
    <label class="field-label">Titular</label>
    <input class="field-input" id="card-holder" placeholder="Nome do titular" />
    <label class="field-label">Validade (MM/AA)</label>
    <input class="field-input" id="card-expiry" placeholder="12/28" maxlength="5" />
    <button class="submit-btn" onclick="submitCard()">Salvar</button>
    <button class="submit-btn" id="card-delete-btn" onclick="deleteCard()" style="background:#c0392b;margin-top:10px;display:none">Excluir Cartão</button>
  </div>
</div>

<!-- PROFILE EDIT MODAL -->
<div class="modal-overlay" id="profile-modal">
  <div class="modal">
    <h2 id="profile-modal-title">Editar Perfil <button class="modal-close" onclick="closeModal('profile-modal')"><i class="ti ti-x"></i></button></h2>
    <div id="profile-edit-field"></div>
    <button class="submit-btn" onclick="submitProfileEdit()">Salvar</button>
  </div>
</div>

<!-- NOTIFICATION LIST MODAL -->
<div class="modal-overlay" id="notif-modal">
  <div class="modal">
    <h2>Notificações <button class="modal-close" onclick="closeModal('notif-modal')"><i class="ti ti-x"></i></button></h2>
    <div id="notif-list"></div>
  </div>
</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<script>
// FIREBASE
firebase.initializeApp({
  apiKey: "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: "projetomu-d5722.firebaseapp.com",
  projectId: "projetomu-d5722",
  storageBucket: "projetomu-d5722.firebasestorage.app",
  messagingSenderId: "94478862714",
  appId: "1:94478862714:web:578561a199f685f9e5eec3"
});
const db = firebase.firestore();
const auth = firebase.auth();

// STATE
let transactions = [];
let categories = { saida: [], entrada: [] };
let contacts = [];
let currentTheme = 'light';
let activeModalType = 'send';
let selectedCatId = null;
let selectedSubcatId = null;
let editingTxId = null;
let cards = [];
let profile = { name: 'Benjamin Smith', email: 'ben.smith@example.com', username: '@ben', usernameChangedAt: null };
let notifications = [];
let editingCardId = null;
let profileEditField = null;

// AUTH
const googleProvider = new firebase.auth.GoogleAuthProvider();
let currentUser = null;

auth.onAuthStateChanged(async user => {
  if (user) {
    currentUser = user;
    document.getElementById('login-page').classList.add('hidden');
    startListeners();
    seedIfEmpty();
    // Salvar dados do Google no profile se for primeiro login
    const snap = await db.collection('profile').doc('me').get();
    if (!snap.exists) {
      db.collection('profile').doc('me').set({
        name: user.displayName || 'Usuário',
        email: user.email || '',
        username: '@' + (user.displayName || 'usuario').toLowerCase().replace(/\s/g, ''),
        usernameChangedAt: null,
        photoURL: user.photoURL || '',
      });
    } else if (user.photoURL) {
      db.collection('profile').doc('me').update({ photoURL: user.photoURL }).catch(() => {});
    }
  } else {
    document.getElementById('login-page').classList.remove('hidden');
  }
});

function signInGoogle() {
  showToast("Redirecionando para o Google...");
  auth.signInWithRedirect(googleProvider);
}

auth.getRedirectResult().catch(err => {
  if (err.code !== 'auth/popup-closed-by-user') {
    console.error("Redirect auth error:", err);
    showToast("Erro ao entrar: " + err.message);
  }
});

function signOutUser() {
  auth.signOut();
  showToast("Saiu!");
}

// SEED DEFAULT DATA
async function seedIfEmpty() {
  const batch = db.batch();
  const catSnap = await db.collection('categories').get();
  if (catSnap.empty) {
    [
      { id:'food', name:'Alimentação', icon:'ti-tools-kitchen-2', color:'#e07a3a', isDefault:true, subcats:[], type:'saída' },
      { id:'transport', name:'Transporte', icon:'ti-car', color:'#5b7fa6', isDefault:true, subcats:[], type:'saída' },
      { id:'energy', name:'Energético', icon:'ti-bolt', color:'#a3c11a', isDefault:true, subcats:[{id:'monster',name:'Monster'},{id:'redbull',name:'RedBull'},{id:'bally',name:'Bally'}], type:'saída' },
      { id:'alcohol', name:'Bebida Alcólica', icon:'ti-glass-full', color:'#7a1a3a', isDefault:true, subcats:[{id:'beer',name:'Cerveja'},{id:'wine',name:'Vinho'},{id:'vodka',name:'Vodka'},{id:'drinks',name:'Drinks'}], type:'saída' },
      { id:'shopping', name:'Compras', icon:'ti-shopping-cart', color:'#7a5ba6', isDefault:true, subcats:[], type:'saída' },
      { id:'salary', name:'Salário', icon:'ti-cash', color:'#1a7a4a', isDefault:true, subcats:[], type:'entrada' },
      { id:'freelance', name:'Freelance', icon:'ti-device-laptop', color:'#5b7fa6', isDefault:true, subcats:[], type:'entrada' },
      { id:'gift', name:'Presente', icon:'ti-gift', color:'#e07a3a', isDefault:true, subcats:[], type:'entrada' },
    ].forEach(c => batch.set(db.collection('categories').doc(c.id), c));
  }
  if (!catSnap.empty) return;
  await batch.commit();
}

// FIRESTORE LISTENERS
function startListeners() {
  db.collection('categories').onSnapshot(snap => {
    categories = { saida: [], entrada: [] };
    snap.forEach(doc => {
      const d = doc.data();
      categories[d.type || 'saída'].push({ id: doc.id, ...d });
    });
    if (document.getElementById('config-categories-page').classList.contains('active')) renderConfigCategories();
  });

  db.collection('transactions').onSnapshot(snap => {
    transactions = [];
    snap.forEach(doc => {
      const d = doc.data();
      transactions.push({ id: doc.id, ...d });
    });
    transactions.sort((a, b) => {
      const aT = a.createdAt ? a.createdAt.toDate().getTime() : 0;
      const bT = b.createdAt ? b.createdAt.toDate().getTime() : 0;
      return bT - aT;
    });
    updateBalance();
    renderRecent();
    if (document.getElementById('transactions-page').classList.contains('active')) renderAll('all');
    if (document.getElementById('reports-page').classList.contains('active')) renderReports();
  });

  db.collection('contacts').onSnapshot(snap => {
    contacts = [];
    snap.forEach(doc => contacts.push({ id: doc.id, ...doc.data() }));
  });

  db.collection('cards').onSnapshot(snap => {
    cards = [];
    snap.forEach(doc => cards.push({ id: doc.id, ...doc.data() }));
    if (document.getElementById('cards-page').classList.contains('active')) renderCards();
  });

  db.collection('profile').doc('me').onSnapshot(doc => {
    if (doc.exists) profile = { ...profile, ...doc.data() };
    renderProfileFields();
    const avatar = document.getElementById('profile-avatar');
    if (profile.photoURL) {
      avatar.innerHTML = `<img src="${profile.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />`;
    } else {
      avatar.textContent = profile.name ? profile.name.charAt(0).toUpperCase() : '?';
    }
    const greetingEl = document.querySelector('.greeting h3 span:first-child');
    if (greetingEl) greetingEl.textContent = profile.name || 'Usuário';
    if (document.getElementById('profile-page').classList.contains('active')) {
      document.getElementById('profile-name').textContent = profile.name;
      document.getElementById('profile-email').textContent = profile.email;
    }
  });

  db.collection('notifications').onSnapshot(snap => {
    notifications = [];
    snap.forEach(doc => {
      const d = doc.data();
      notifications.push({ id: doc.id, ...d });
    });
    notifications.sort((a, b) => {
      const aT = a.createdAt ? a.createdAt.toDate().getTime() : 0;
      const bT = b.createdAt ? b.createdAt.toDate().getTime() : 0;
      return bT - aT;
    });
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = unread > 0 ? unread : '';
      badge.classList.toggle('show', unread > 0);
    }
  });
}

// NAVIGATION
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const targetPage = document.getElementById(name + '-page');
  if(targetPage) targetPage.classList.add('active');
  const tabNames = { 'home': 0, 'transactions': 1, 'reports': 2, 'cards': 3, 'profile': 4 };
  if(tabNames[name] !== undefined) {
    document.querySelectorAll('.tab-bar').forEach(bar => {
      const tabs = bar.querySelectorAll('.tab');
      if(tabs[tabNames[name]]) tabs[tabNames[name]].classList.add('active');
    });
  }
  if (name === 'transactions') renderAll('all');
  if (name === 'reports') { renderReports(); renderAnnualChart(); }
  if (name === 'cards') renderCards();
  if (name === 'config-categories') renderConfigCategories();
  window.scrollTo(0,0);
}

// THEME
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', currentTheme);
  const toggle = document.getElementById('theme-toggle');
  if(currentTheme === 'dark') {
    toggle.classList.add('active');
    toggle.querySelector('span').textContent = 'Modo Claro';
    toggle.querySelector('i').className = 'ti ti-sun';
  } else {
    toggle.classList.remove('active');
    toggle.querySelector('span').textContent = 'Modo Escuro';
    toggle.querySelector('i').className = 'ti ti-moon';
  }
}

// CATEGORY CONFIG
function renderConfigCategories() {
  const renderList = (type, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = categories[type].map(cat => `
      <div class="config-cat-item">
        <div class="cat-main">
          <div class="icon" style="color:${cat.color}"><i class="ti ${cat.icon}"></i></div>
          <div class="name">${cat.name} ${cat.isDefault ? '<span class="badge-default">Padrão</span>' : ''}</div>
          <div class="actions-btns">
            <div class="btn edit" onclick="editCategory('${type}', '${cat.id}')"><i class="ti ti-edit"></i></div>
            ${!cat.isDefault ? `<div class="btn delete" onclick="deleteCategory('${type}', '${cat.id}')"><i class="ti ti-trash"></i></div>` : ''}
            <div class="btn move" onclick="moveCatInto('${type}', '${cat.id}')" title="Mover categoria para dentro"><i class="ti ti-arrow-right"></i></div>
          </div>
        </div>
        ${cat.subcats.length > 0 ? `
          <div class="subcat-list">
            ${cat.subcats.map(sub => `
              <div class="subcat-item">
                <div class="name">${sub.name}</div>
                <div class="btn move" onclick="moveSubcatOut('${type}', '${cat.id}', '${sub.id}')" title="Mover para fora"><i class="ti ti-arrow-left"></i></div>
                <div class="btn delete" onclick="deleteSubcat('${type}', '${cat.id}', '${sub.id}')"><i class="ti ti-trash"></i></div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  };
  renderList('saída', 'config-out-list');
  renderList('entrada', 'config-in-list');
}

async function editCategory(type, id) {
  const cat = categories[type].find(c => c.id === id);
  const newName = prompt("Novo nome para a categoria:", cat.name);
  if(newName) {
    cat.name = newName;
    await db.collection('categories').doc(id).update({ name: newName });
  }
}

async function deleteCategory(type, id) {
  if(confirm("Excluir esta categoria?")) {
    categories[type] = categories[type].filter(c => c.id !== id);
    await db.collection('categories').doc(id).delete();
    renderConfigCategories();
  }
}

async function moveSubcatOut(type, catId, subId) {
  const cat = categories[type].find(c => c.id === catId);
  const sub = cat.subcats.find(s => s.id === subId);
  cat.subcats = cat.subcats.filter(s => s.id !== subId);
  const newRef = db.collection('categories').doc();
  const batch = db.batch();
  batch.update(db.collection('categories').doc(catId), { subcats: cat.subcats });
  batch.set(newRef, { id: newRef.id, name: sub.name, icon: cat.icon, color: cat.color, isDefault: false, subcats: [], type: type });
  await batch.commit();
  showToast("Movido para fora!");
}

async function moveCatInto(type, targetCatId) {
  const otherCats = categories[type].filter(c => c.id !== targetCatId);
  if(otherCats.length === 0) return;
  let msg = "Escolha a categoria para mover para dentro:\n";
  otherCats.forEach((c, i) => msg += `${i+1}. ${c.name}\n`);
  const choice = parseInt(prompt(msg)) - 1;
  if(choice >= 0 && choice < otherCats.length) {
    const catToMove = otherCats[choice];
    const targetCat = categories[type].find(c => c.id === targetCatId);
    targetCat.subcats.push({ id: catToMove.id, name: catToMove.name });
    const batch = db.batch();
    batch.update(db.collection('categories').doc(targetCatId), { subcats: targetCat.subcats });
    batch.delete(db.collection('categories').doc(catToMove.id));
    await batch.commit();
    showToast("Movido para dentro!");
  }
}

async function deleteSubcat(type, catId, subId) {
  if(confirm("Excluir subcategoria?")) {
    const cat = categories[type].find(c => c.id === catId);
    cat.subcats = cat.subcats.filter(s => s.id !== subId);
    await db.collection('categories').doc(catId).update({ subcats: cat.subcats });
    renderConfigCategories();
  }
}

async function addCustomCategory() {
  const name = prompt("Nome da nova categoria:");
  if(!name) return;
  const isDespesa = confirm("É uma Despesa?");
  const type = isDespesa ? 'saída' : 'entrada';
  const ref = db.collection('categories').doc();
  await ref.set({ id: ref.id, name, icon: 'ti-category', color: '#999', isDefault: false, subcats: [], type });
}

// TRANSACTION MODAL
function openModal(type, txId = null) {
  activeModalType = type;
  editingTxId = txId;
  selectedCatId = null;
  selectedSubcatId = null;

  const isEditing = txId !== null;
  const tx = isEditing ? transactions.find(t => t.id === txId) : null;

  document.getElementById('modal-title').innerHTML = (isEditing ? 'Editar Transação' : (type === 'send' ? 'Nova Despesa' : 'Nova Receita')) + ` <button class="modal-close" onclick="closeModal('tx-modal')"><i class="ti ti-x"></i></button>`;
  document.getElementById('modal-user-label').textContent = (type === 'send' || type === 'saída') ? 'Para (opcional)' : 'De (opcional)';
  document.getElementById('modal-subcategories-container').style.display = 'none';
  document.getElementById('modal-delete').style.display = isEditing ? 'block' : 'none';

  document.getElementById('modal-user-input').value = isEditing ? tx.name : '';
  document.getElementById('modal-amount').value = isEditing ? Math.abs(tx.amount) : '';
  document.getElementById('modal-desc').value = '';

  document.getElementById('modal-contacts').innerHTML = contacts.map(c =>
    `<div class="contact-chip ${isEditing && tx.name === c.name ? 'selected' : ''}" onclick="selectContact(this, '${c.name}')">
      <div class="av" style="background:${c.color}">${c.initials}</div>
      <span>${c.name.split(' ')[0]}</span>
    </div>`).join('');

  const catType = (type === 'send' || type === 'saída') ? 'saída' : 'entrada';
  document.getElementById('modal-categories').innerHTML = categories[catType].map(cat => `
    <div class="cat-item ${isEditing && tx && tx.cat === cat.id ? 'selected' : ''}" onclick="selectCat('${cat.id}', this)">
      <div class="cat-icon"><i class="ti ${cat.icon}"></i></div>
      <div class="cat-name">${cat.name}</div>
    </div>
  `).join('');

  if(isEditing && tx && tx.cat) {
    selectedCatId = tx.cat;
    const cat = categories[catType].find(c => c.id === tx.cat);
    if(cat && cat.subcats && cat.subcats.length > 0) {
      document.getElementById('modal-subcategories-container').style.display = 'block';
      document.getElementById('modal-subcategories').innerHTML = cat.subcats.map(sub => `
        <div class="cat-item ${tx.subcat === sub.id ? 'selected' : ''}" onclick="selectSubcat('${sub.id}', this)">
          <div class="cat-icon" style="font-size:14px;width:32px;height:32px;border-radius:8px"><i class="ti ti-corner-down-right"></i></div>
          <div class="cat-name">${sub.name}</div>
        </div>
      `).join('');
      if(tx.subcat) selectedSubcatId = tx.subcat;
    }
  }

  document.getElementById('tx-modal').classList.add('open');
}

function selectCat(id, el) {
  el.closest('.category-scroll').querySelectorAll('.cat-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedCatId = id;
  selectedSubcatId = null;
  const catType = (activeModalType === 'send' || activeModalType === 'saída') ? 'saída' : 'entrada';
  const cat = categories[catType].find(c => c.id === id);
  const subContainer = document.getElementById('modal-subcategories-container');
  if(cat && cat.subcats && cat.subcats.length > 0) {
    subContainer.style.display = 'block';
    document.getElementById('modal-subcategories').innerHTML = cat.subcats.map(sub => `
      <div class="cat-item" onclick="selectSubcat('${sub.id}', this)">
        <div class="cat-icon" style="font-size:14px;width:32px;height:32px;border-radius:8px"><i class="ti ti-corner-down-right"></i></div>
        <div class="cat-name">${sub.name}</div>
      </div>
    `).join('');
  } else { subContainer.style.display = 'none'; }
}

function selectSubcat(id, el) {
  el.closest('.category-scroll').querySelectorAll('.cat-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedSubcatId = id;
}

function selectContact(el, name) {
  const isSelected = el.classList.contains('selected');
  el.closest('.contacts-row').querySelectorAll('.contact-chip').forEach(c => c.classList.remove('selected'));
  const input = document.getElementById('modal-user-input');
  if(isSelected) { input.value = ''; } else { el.classList.add('selected'); input.value = name; }
}

async function submitTransaction() {
  const user = document.getElementById('modal-user-input').value.trim();
  const amt = parseFloat(document.getElementById('modal-amount').value);
  if(!selectedCatId || !amt || amt <= 0) { showToast("Preencha os campos obrigatórios"); return; }

  const catType = (activeModalType === 'send' || activeModalType === 'saída') ? 'saída' : 'entrada';
  const cat = categories[catType].find(c => c.id === selectedCatId);
  let displayName = user || cat.name;
  if(selectedSubcatId) {
    const sub = cat.subcats.find(s => s.id === selectedSubcatId);
    displayName = user ? `${user} (${sub.name})` : sub.name;
  }
  const txAmt = (activeModalType === 'send' || activeModalType === 'saída') ? -amt : amt;

  const txData = {
    name: displayName,
    cat: selectedCatId,
    subcat: selectedSubcatId,
    date: 'Agora',
    amount: txAmt,
    type: catType,
    icon: cat.icon,
    bg: cat.color + '22',
    color: cat.color,
    group: 'Hoje',
  };

  if(editingTxId) {
    await db.collection('transactions').doc(editingTxId).update(txData);
    showToast("Atualizado!");
  } else {
    txData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const txRef = await db.collection('transactions').add(txData);

    // Notificação se for transação para um usuário
    if (user) {
      const profilesSnap = await db.collection('profile').where('name', '==', user).get();
      if (!profilesSnap.empty) {
        const otherProfile = profilesSnap.docs[0].data();
        const notifMsg = catType === 'entrada'
          ? `${otherProfile.name} te enviou R$ ${formatBRL(amt)}`
          : `Você enviou R$ ${formatBRL(amt)} para ${otherProfile.name}`;
        await db.collection('notifications').add({
          message: notifMsg,
          amount: amt,
          type: catType === 'entrada' ? 'recebido' : 'enviado',
          from: profile.name,
          read: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    showToast("Sucesso!");
  }

  closeModal('tx-modal');
}

async function deleteTransaction() {
  if(!editingTxId) return;
  if(confirm("Deseja excluir esta transação?")) {
    await db.collection('transactions').doc(editingTxId).delete();
    closeModal('tx-modal');
    showToast("Excluído!");
  }
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openSendTo(initials, name) {
  openModal('send');
  setTimeout(() => {
    document.getElementById('modal-user-input').value = name;
    const chips = document.querySelectorAll('#modal-contacts .contact-chip');
    chips.forEach(c => { if(c.querySelector('.av').textContent === initials) c.classList.add('selected'); });
  }, 50);
}

// CARDS
function renderCards() {
  const container = document.getElementById('cards-list');
  container.innerHTML = cards.map(c => `
    <div class="card-item" style="background:linear-gradient(135deg, ${c.color||'#1a7a4a'}, ${c.colorDark||'#2d5a43'});cursor:pointer" onclick="openCardModal('${c.id}')">
      <div class="card-type">${c.type || 'Visa'} • ${c.bank || ''}</div>
      <div class="card-number">${c.number || '**** **** **** 0000'}</div>
      <div class="card-footer">
        <div class="card-holder">${(c.holder || profile.name).toUpperCase()}</div>
        <div class="card-expiry">${c.expiry || '00/00'}</div>
      </div>
    </div>
  `).join('') + `
    <button class="card-add-btn" onclick="openCardModal()"><i class="ti ti-plus"></i> Adicionar Cartão</button>
  `;
}

function openCardModal(id = null) {
  editingCardId = id;
  const card = id ? cards.find(c => c.id === id) : null;
  document.getElementById('card-modal-title').innerHTML = (card ? 'Editar Cartão' : 'Adicionar Cartão') + ' <button class="modal-close" onclick="closeModal(\'card-modal\')"><i class="ti ti-x"></i></button>';
  document.getElementById('card-type').value = card ? card.type : 'Visa';
  document.getElementById('card-number').value = card ? card.number : '';
  document.getElementById('card-holder').value = card ? card.holder : profile.name;
  document.getElementById('card-expiry').value = card ? card.expiry : '';
  document.getElementById('card-delete-btn').style.display = card ? 'block' : 'none';
  document.getElementById('card-modal').classList.add('open');
}

async function submitCard() {
  const type = document.getElementById('card-type').value;
  const number = document.getElementById('card-number').value.trim();
  const holder = document.getElementById('card-holder').value.trim();
  const expiry = document.getElementById('card-expiry').value.trim();
  if (!number || !holder || !expiry) { showToast("Preencha todos os campos"); return; }
  const colors = { Visa: ['#1a7a4a','#2d5a43'], Mastercard: ['#333','#111'], Elo: ['#c0392b','#7a1a1a'], Amex: ['#2c3e50','#1a252f'] };
  const [color, colorDark] = colors[type] || ['#1a7a4a','#2d5a43'];
  const data = { type, number, holder, expiry, color, colorDark };
  if (editingCardId) {
    await db.collection('cards').doc(editingCardId).update(data);
    showToast("Cartão atualizado!");
  } else {
    await db.collection('cards').add(data);
    showToast("Cartão adicionado!");
  }
  closeModal('card-modal');
}

async function deleteCard() {
  if (!editingCardId) return;
  if (confirm("Excluir este cartão?")) {
    await db.collection('cards').doc(editingCardId).delete();
    closeModal('card-modal');
    showToast("Cartão excluído!");
  }
}

// PROFILE
function renderProfileFields() {
  const container = document.getElementById('profile-fields');
  if (!container) return;
  const canChangeUsername = !profile.usernameChangedAt || (Date.now() - profile.usernameChangedAt.toDate()) > 90 * 24 * 60 * 60 * 1000;
  const daysLeft = profile.usernameChangedAt ? Math.ceil(90 - (Date.now() - profile.usernameChangedAt.toDate()) / (24*60*60*1000)) : 0;
  container.innerHTML = `
    <div class="profile-field">
      <label>Nome</label>
      <div class="value"><span>${profile.name}</span><button class="edit-btn" onclick="openProfileEdit('name')">Editar</button></div>
    </div>
    <div class="profile-field">
      <label>Email</label>
      <div class="value"><span>${profile.email}</span><button class="edit-btn" onclick="openProfileEdit('email')">Editar</button></div>
    </div>
    <div class="profile-field">
      <label>Usuário</label>
      <div class="value">
        <span>${profile.username}</span>
        <div>
          ${canChangeUsername ? `<button class="edit-btn" onclick="openProfileEdit('username')">Editar</button>` : `<span class="restriction">Altere em ${daysLeft} dias</span>`}
        </div>
      </div>
    </div>
  `;
}

function openProfileEdit(field) {
  profileEditField = field;
  const labels = { name: 'Nome', email: 'Email', username: 'Nome de usuário (@)' };
  const current = profile[field] || '';
  document.getElementById('profile-modal-title').innerHTML = `Editar ${labels[field]} <button class="modal-close" onclick="closeModal('profile-modal')"><i class="ti ti-x"></i></button>`;
  const inputType = field === 'email' ? 'email' : 'text';
  const prefix = field === 'username' ? '@' : '';
  document.getElementById('profile-edit-field').innerHTML = `
    <label class="field-label">${labels[field]}</label>
    <input class="field-input" id="profile-edit-input" type="${inputType}" value="${current.replace('@','')}" placeholder="${labels[field]}" />
  `;
  document.getElementById('profile-modal').classList.add('open');
}

async function submitProfileEdit() {
  const val = document.getElementById('profile-edit-input').value.trim();
  if (!val) { showToast("Preencha o campo"); return; }
  const update = {};
  if (profileEditField === 'username') {
    update.username = '@' + val.replace('@','');
    update.usernameChangedAt = firebase.firestore.FieldValue.serverTimestamp();
  } else if (profileEditField === 'name') {
    update.name = val;
  } else if (profileEditField === 'email') {
    update.email = val;
  }
  await db.collection('profile').doc('me').set(update, { merge: true });
  closeModal('profile-modal');
  showToast("Perfil atualizado!");
}

// ANNUAL CHART
function renderAnnualChart() {
  const canvas = document.getElementById('annual-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const year = new Date().getFullYear();
  document.getElementById('chart-year').textContent = year;

  const monthly = {};
  for (let m = 0; m < 12; m++) monthly[m] = { income: 0, expense: 0 };

  transactions.forEach(t => {
    const d = t.createdAt ? t.createdAt.toDate() : new Date();
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    if (t.amount > 0) monthly[m].income += t.amount;
    else monthly[m].expense += Math.abs(t.amount);
  });

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth || 320;
  const h = 160;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  const pad = { top: 16, bottom: 20, left: 4, right: 4 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const maxVal = Math.max(1, ...Object.values(monthly).map(m => Math.max(m.income, m.expense)));
  const monthLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // Grid lines
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#eee';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#999';
    ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('R$' + Math.round(maxVal - (maxVal / 4) * i), pad.left - 2, y + 3);
  }

  // Month labels
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#999';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  monthLabels.forEach((l, i) => ctx.fillText(l, pad.left + (cw / 11) * i, h - 4));

  const colorIncome = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#2ecc71';
  const colorExpense = '#c0392b';

  const points = (arr, color) => {
    ctx.beginPath();
    arr.forEach((v, i) => {
      const x = pad.left + (cw / 11) * i;
      const y = pad.top + ch - (v / maxVal) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();

    // Dots
    arr.forEach((v, i) => {
      const x = pad.left + (cw / 11) * i;
      const y = pad.top + ch - (v / maxVal) * ch;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  };

  points(Object.values(monthly).map(m => m.income), colorIncome);
  points(Object.values(monthly).map(m => m.expense), colorExpense);

  // Legend
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = colorIncome; ctx.fillRect(w - 80, 4, 8, 8);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-main').trim() || '#111';
  ctx.fillText('Receitas', w - 68, 12);
  ctx.fillStyle = colorExpense; ctx.fillRect(w - 80, 18, 8, 8);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-main').trim() || '#111';
  ctx.fillText('Despesas', w - 68, 26);
}

// NOTIFICATIONS
function renderNotifications() {
  const container = document.getElementById('notif-list');
  container.innerHTML = notifications.length === 0
    ? '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0">Nenhuma notificação</p>'
    : notifications.map(n => `
      <div class="tx-item" onclick="markNotifRead('${n.id}')" style="${n.read ? 'opacity:0.5' : ''}">
        <div class="tx-logo" style="background:${n.type==='recebido'?'var(--primary-light)':'#f0e8fa'};color:${n.type==='recebido'?'var(--primary)':'#7a4ab0'}"><i class="ti ${n.type==='recebido'?'ti-arrow-down-left':'ti-arrow-up-right'}"></i></div>
        <div class="tx-info">
          <div class="tx-name">${n.message}</div>
          <div class="tx-date">${n.createdAt ? new Date(n.createdAt.toDate()).toLocaleString('pt-BR') : ''}</div>
        </div>
        ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0"></div>' : ''}
      </div>
    `).join('');
}

async function markNotifRead(id) {
  await db.collection('notifications').doc(id).update({ read: true });
}

// NOTIFICATION BUTTON
document.getElementById('notif-btn').addEventListener('click', () => {
  renderNotifications();
  document.getElementById('notif-modal').classList.add('open');
});

// UTILS
function formatBRL(val) { return Math.abs(val).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function updateBalance() {
  const bal = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const absBal = Math.abs(bal);
  const intPart = Math.floor(absBal).toLocaleString('pt-BR');
  const dec = (absBal % 1).toFixed(2).split('.')[1];
  const sign = bal < 0 ? '-' : '';
  document.getElementById('main-balance').innerHTML = `<sup>R$</sup>${sign}${intPart}<small>,${dec}</small>`;
}
function renderRecent() {
  const list = document.getElementById('recent-tx-list');
  if(list) list.innerHTML = transactions.slice(0,4).map(txHTML).join('');
}
function renderAll(filter) {
  const list = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);
  const groups = [...new Set(list.map(t => t.group))];
  let html = '';
  groups.forEach(g => {
    html += `<div class="tx-group-label">${g}</div>`;
    html += list.filter(t => t.group === g).map(txHTML).join('');
  });
  const container = document.getElementById('all-tx-list');
  if (!html) html = '<p style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center">Nenhuma transação</p>';
  if(container) container.innerHTML = html;
}
function filterTx(type, el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderAll(type);
}
function renderReports() {
  const totalIncome = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'saída').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  document.getElementById('report-income').textContent = 'R$ ' + formatBRL(totalIncome);
  document.getElementById('report-expense').textContent = 'R$ ' + formatBRL(totalExpense);

  const catTotals = {};
  transactions.forEach(t => {
    const allCats = [...categories.saída, ...categories.entrada];
    const cat = allCats.find(c => c.id === t.cat);
    if (!cat) return;
    const key = cat.id;
    if (!catTotals[key]) catTotals[key] = { name: cat.name, icon: cat.icon, color: cat.color, total: 0, count: 0 };
    catTotals[key].total += Math.abs(t.amount || 0);
    catTotals[key].count += 1;
  });

  const entries = Object.values(catTotals).sort((a, b) => b.total - a.total);
  const maxTotal = entries.length > 0 ? entries[0].total : 1;
  const container = document.getElementById('report-by-category');
  container.innerHTML = entries.map(c => `
    <div class="report-cat-item">
      <div class="report-cat-icon" style="background:${c.color}22;color:${c.color}"><i class="ti ${c.icon}"></i></div>
      <div class="report-cat-info">
        <div class="report-cat-name">${c.name}</div>
        <div class="report-cat-count">${c.count} transação${c.count !== 1 ? 'ões' : ''}</div>
        <div class="report-cat-bar"><div class="report-cat-fill" style="width:${(c.total/maxTotal*100).toFixed(0)}%;background:${c.color}"></div></div>
      </div>
      <div class="report-cat-amount">R$ ${formatBRL(c.total)}</div>
    </div>
  `).join('');
  renderAnnualChart();
}

function txHTML(tx) {
  const pos = (tx.amount || 0) > 0;
  return `<div class="tx-item" onclick="openModal('${tx.type}', '${tx.id}')">
    <div class="tx-logo" style="background:${tx.bg};color:${tx.color}"><i class="ti ${tx.icon}"></i></div>
    <div class="tx-info">
      <div class="tx-name">${tx.name}</div>
      <div class="tx-date">${tx.date}</div>
    </div>
    <div class="tx-amount ${pos?'pos':'neg'}">${pos?'+':''}R$${formatBRL(tx.amount)}</div>
  </div>`;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

document.getElementById('tx-modal').addEventListener('click', e => { if(e.target.id === 'tx-modal') closeModal('tx-modal'); });
</script>
</body>
</html>
