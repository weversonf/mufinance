# Mu Finance React - Código Fonte Completo
Gerado em 2026-06-26 10:45
Total de arquivos: 40

---

## src\index.css
``$(@{True='jsx'}[src\index.css.EndsWith('.jsx') -or src\index.css.EndsWith('.js')])
:root{--bg-body:#f5f3ff;--bg-app:#ffffff;--bg-top:#ede9fe;--text-main:#1e1b4b;--text-sec:#6d6a8a;--text-muted:#9d9ab0;--border:#e8e5f0;--card-bg:#f8f7ff;--primary:#7C3AED;--primary-light:#EDE9FE;--modal-bg:#ffffff;--input-bg:#ffffff;--input-border:#e8e5f0;--tab-inactive:#c4c0d8}
[data-theme="dark"]{--bg-body:#0f0a1a;--bg-app:#1a1528;--bg-top:#221d35;--text-main:#f0edff;--text-sec:#a8a2c0;--text-muted:#6b6680;--border:#2d2840;--card-bg:#231e35;--primary:#8B5CF6;--primary-light:#1E1B4B;--modal-bg:#231e35;--input-bg:#2d2840;--input-border:#3d3860;--tab-inactive:#5a5580}
*{box-sizing:border-box;margin:0;padding:0;transition:background 0.3s,color 0.3s}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg-body);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
input,textarea,.field-input,.field-input *{-webkit-user-select:text;user-select:text}
.app{width:100%;max-width:420px;min-height:100vh;background:var(--bg-app);display:flex;flex-direction:column;overflow:hidden;position:relative}
.app-shell{width:100%;max-width:420px;min-height:100vh;background:var(--bg-app);margin:0 auto;display:flex;flex-direction:column;position:relative}
.loading-screen{display:flex;align-items:center;justify-content:center;height:100vh}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.desktop-sidebar{display:none}
.desktop-only{display:none}
.three-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
.top-bar{background:linear-gradient(135deg,#7C3AED,#6D28D9);padding:52px 20px 16px;border-radius:0 0 24px 24px}.top-bar .greeting h3,.top-bar .greeting h3 span,.top-bar .balance{color:#fff}.top-bar .currency-badge{background:rgba(255,255,255,0.2);color:#fff;backdrop-filter:blur(4px)}[data-theme="dark"] .top-bar{background:linear-gradient(135deg,#6D28D9,#5B21B6)}
.greeting{display:flex;justify-content:space-between;align-items:flex-start}
.greeting h3{font-size:15px;font-weight:400;color:var(--text-main);line-height:1.5}
.greeting h3 span{font-weight:700}
.icons{display:flex;gap:8px}
.icon-btn{width:36px;height:36px;border-radius:50%;background:var(--bg-app);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--text-sec);transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .15s}
.icon-btn:hover{background:var(--border)}
.icon-btn:active{transform:scale(.85)}
.balance-section{text-align:center;padding:14px 20px 4px}
.currency-badge{display:inline-flex;align-items:center;gap:4px;background:var(--bg-app);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500;color:var(--text-sec);margin-bottom:6px}
.balance{font-size:44px;font-weight:800;color:var(--text-main);letter-spacing:-2px}
.balance sup{font-size:22px;vertical-align:super;font-weight:600}
.balance small{font-size:24px;font-weight:400;color:var(--text-sec)}
.change-badge{display:inline-flex;align-items:center;gap:4px;background:var(--primary);color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;margin-top:8px}
.tx-val-wrap{position:relative;display:flex;align-items:center;margin-bottom:16px}
.tx-val-input{width:100%;font-size:36px;font-weight:800;color:var(--text-main);background:none;border:none;outline:none;padding:8px 0 8px 42px;letter-spacing:-1px;font-family:inherit;text-align:left}
.tx-val-input::placeholder{color:var(--text-muted);opacity:.4}
.tx-val-currency{position:absolute;left:0;font-size:20px;font-weight:700;color:var(--text-muted);pointer-events:none}
.actions{display:flex;gap:8px;padding:14px 16px;background:var(--bg-top);align-items:center;justify-content:center}
.action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:14px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1);font-family:inherit;box-shadow:0 2px 8px rgba(124,58,237,0.08)}
.action-btn:hover{opacity:.85;transform:translateY(-1px)}
.action-btn:active{transform:scale(.95)}
.action-btn.side{background:var(--bg-app);color:var(--primary);border:1.5px solid var(--primary-light)}
.action-btn.center-btn{background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;border-radius:50%;width:52px;height:52px;flex:0 0 52px;font-size:22px;padding:0;box-shadow:0 4px 16px rgba(124,58,237,0.35)}
[data-theme="dark"] .action-btn.center-btn{background:linear-gradient(135deg,#8B5CF6,#7C3AED)}
.greeting-left{display:flex;align-items:center;gap:12px}
.profile-avatar-top{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;border:none;cursor:pointer;flex-shrink:0;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s}
.profile-avatar-top:active{transform:scale(.9)}
.profile-header .profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 12px;box-shadow:0 4px 20px rgba(124,58,237,0.25)}
.content{background:var(--bg-app);border-radius:24px 24px 0 0;padding:20px 18px 100px;flex:1;margin-top:-16px;overflow-y:auto;box-shadow:0 -4px 20px rgba(124,58,237,0.06)}
.section-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.section-label{font-size:14px;font-weight:700;color:var(--text-main)}
.section-link{font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:2px;cursor:pointer;text-decoration:none;background:none;border:none;font-family:inherit}
.section-title-new{font-size:12px;font-weight:700;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;margin-top:16px}
.section-title-new i{color:var(--primary);font-size:15px}
.send-again{display:flex;gap:8px;margin-bottom:8px}
.avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0;cursor:pointer;transition:transform .15s;border:none;font-family:inherit}
.avatar:hover{transform:scale(1.08)}
.avatar-add{background:var(--card-bg) !important;color:var(--text-muted) !important;font-size:22px;border:2px dashed var(--border) !important}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
.income-card{background:var(--card-bg);border-radius:18px;padding:16px;box-shadow:0 2px 12px rgba(124,58,237,0.06);border:1px solid var(--border)}
.income-label{font-size:11px;color:var(--text-muted);margin-bottom:4px;font-weight:500}
.income-amount{font-size:18px;font-weight:800;color:var(--text-main);margin-top:2px}
.income-change{display:inline-flex;align-items:center;gap:3px;background:var(--primary-light);color:var(--primary);font-size:11px;font-weight:700;border-radius:10px;padding:3px 8px;margin-top:6px}
.chart-wrap{height:52px;margin:6px 0}
svg.mini-chart{width:100%;height:52px}
.transactions{border-top:1px solid var(--border);padding-top:4px}
.tx-item{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s,transform .15s;border-radius:12px;padding:12px 8px}
.tx-item:hover{background:var(--card-bg)}
.tx-item:hover{background:var(--card-bg)}
.tx-logo{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.tx-info{flex:1}
.tx-name{font-size:13px;font-weight:600;color:var(--text-main)}
.tx-date{font-size:11px;color:var(--text-muted);margin-top:2px}
.tx-amount{font-size:14px;font-weight:700}
.tx-amount.neg{color:#c0392b}
.tx-amount.pos{color:var(--primary)}
.tab-bar{display:flex;justify-content:space-between;align-items:center;padding:8px 24px 16px;background:var(--bg-app);position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:50;width:100%;max-width:420px;border-radius:24px 24px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,0.06);border:none}
.tab-bar::before{content:'';position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:60px;height:16px;background:var(--bg-app);border-radius:0 0 30px 30px;z-index:3}
.tab{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;color:var(--tab-inactive);cursor:pointer;font-weight:600;background:none;border:none;font-family:inherit;padding:4px 12px;transition:color .15s,transform .2s cubic-bezier(.34,1.56,.64,1)}
.tab:hover{color:var(--text-sec)}
.tab.active{color:var(--primary)}
.tab:active{transform:scale(.92)}
.tab i{font-size:22px}
.notif-badge{position:absolute;top:0;right:0;width:8px;height:8px;background:#c0392b;border-radius:50%;display:none}
.notif-badge.show{display:block}
.page{display:none;flex-direction:column;flex:1;background:var(--bg-app);min-height:100vh;animation:none}
.page.active{display:flex;animation:pageIn .35s cubic-bezier(.2,.9,.3,1)}
.page-header{display:flex;align-items:center;gap:10px;padding:52px 18px 16px;background:var(--bg-app);border-bottom:1px solid var(--border)}
.back-btn{background:none;border:none;font-size:22px;color:var(--text-sec);cursor:pointer;padding:4px}
.page-title{font-size:17px;font-weight:700;color:var(--text-main)}
.filter-row{display:flex;gap:8px;padding:12px 18px;overflow-x:auto}
.filter-chip{background:var(--card-bg);border:none;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--text-sec);cursor:pointer;font-family:inherit;white-space:nowrap}
.filter-chip.active{background:var(--primary);color:#fff}
.page-content{padding:18px 18px 90px;flex:1;overflow-y:auto}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;align-items:flex-end;justify-content:center;transition:background .25s}
.modal-overlay.open{display:flex}
.modal{background:var(--modal-bg);border-radius:28px 28px 0 0;padding:24px 20px 40px;width:100%;max-width:420px;animation:modalUp .3s cubic-bezier(.2,.9,.3,1);max-height:90vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,0.12)}
@keyframes modalUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
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
.submit-btn{width:100%;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .2s cubic-bezier(.34,1.56,.64,1),opacity .2s;box-shadow:0 4px 16px rgba(124,58,237,0.25)}
.submit-btn:hover{opacity:.9;box-shadow:0 6px 20px rgba(124,58,237,0.35)}
.submit-btn:active{transform:scale(.97)}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;color:#fff;border-radius:20px;padding:10px 20px;font-size:13px;font-weight:500;z-index:200;opacity:0;pointer-events:none;white-space:nowrap;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .3s}
.toast.show{opacity:1}
.category-scroll{display:flex;gap:12px;overflow-x:auto;padding:4px 0 16px;margin-bottom:4px;scrollbar-width:none}
.category-scroll::-webkit-scrollbar{display:none}
.cat-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;min-width:64px;transition:transform 0.2s}
.cat-item:active{transform:scale(0.9)}
.cat-icon{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--card-bg);color:var(--text-sec);border:2px solid transparent;transition:all 0.2s}
.cat-item.selected .cat-icon{background:var(--primary-light);color:var(--primary);border-color:var(--primary)}
.cat-name{font-size:10px;color:var(--text-sec);text-align:center;font-weight:600;white-space:nowrap}
.card-item{background:linear-gradient(135deg,var(--primary),#2d5a43);border-radius:20px;padding:20px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden;box-shadow:0 8px 16px rgba(0,0,0,0.1)}
.card-item::after{content:'';position:absolute;top:-20%;right:-10%;width:150px;height:150px;background:rgba(255,255,255,0.1);border-radius:50%}
.card-type{font-size:12px;opacity:0.8;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px}
.card-number{font-size:18px;letter-spacing:2px;margin-bottom:20px;font-family:monospace}
.card-footer{display:flex;justify-content:space-between;align-items:flex-end}
.card-holder{font-size:14px;font-weight:600}
.card-expiry{font-size:12px;opacity:0.8}
.card-add-btn{background:var(--card-bg);border:2px dashed var(--border);border-radius:20px;padding:16px;text-align:center;cursor:pointer;color:var(--text-muted);font-size:14px;font-weight:600;font-family:inherit;width:100%;transition:all .15s}
.card-add-btn:hover{background:var(--border)}
.profile-header{text-align:center;padding:20px 0}
.profile-avatar{width:80px;height:80px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 12px}
.profile-name{font-size:18px;font-weight:700;color:var(--text-main)}
.profile-email{font-size:13px;color:var(--text-muted);margin-top:4px}
.menu-list{margin-top:24px}
.menu-item{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s;border-radius:12px}
.menu-item:hover{background:var(--card-bg)}
.menu-item i{font-size:20px;color:var(--text-sec)}
.menu-item span{font-size:14px;font-weight:500;color:var(--text-main);flex:1}
.menu-item .ti-chevron-right{font-size:16px;color:var(--text-muted)}
.profile-field{margin-bottom:14px}
.profile-field label{font-size:11px;color:var(--text-muted);font-weight:500;display:block;margin-bottom:4px}
.profile-field .value{font-size:14px;font-weight:600;color:var(--text-main);padding:8px 12px;background:var(--card-bg);border-radius:10px;display:flex;justify-content:space-between;align-items:center}
.profile-field .value .edit-btn{background:none;border:none;color:var(--primary);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}
.profile-field .value .restriction{font-size:10px;color:var(--text-muted);font-weight:400}
.prof-field-new{margin-bottom:10px}
.prof-field-new label{font-size:10px;color:var(--text-muted);font-weight:500;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px}
.prof-field-new .pval{font-size:13px;font-weight:600;color:var(--text-main);padding:8px 10px;background:var(--card-bg);border-radius:8px;display:flex;justify-content:space-between;align-items:center}
.prof-field-new .pval .edit{background:none;border:none;color:var(--primary);cursor:pointer;font-size:11px;font-weight:600;font-family:inherit}
.prof-field-new .pval .rest{font-size:9px;color:var(--text-muted);font-weight:400}
.toggle-switch{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;transition:background .3s;cursor:pointer;flex-shrink:0}
.toggle-switch::after{content:'';width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .3s;box-shadow:0 2px 4px rgba(0,0,0,.2)}
.toggle-switch.active{background:var(--primary)}
.toggle-switch.active::after{left:22px}
.config-group{margin-bottom:24px}
.config-group-new{margin-bottom:16px}
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
.accordion-header{display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--card-bg);border-radius:10px;cursor:pointer;border:1px solid var(--border);margin-bottom:4px;transition:background .15s;font-family:inherit;width:100%;text-align:left;font-size:13px;font-weight:600;color:var(--text-main)}
.accordion-header:hover{background:var(--border)}
.accordion-header .arrow{margin-left:auto;font-size:16px;color:var(--text-muted);transition:transform .2s}
.accordion-header.open .arrow{transform:rotate(180deg)}
.accordion-content{display:none;padding:4px 0 8px 0}
.accordion-content.open{display:block}
.icon-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:6px;max-height:240px;overflow-y:auto;padding:4px 0;margin-bottom:12px}
.icon-picker-grid .ip-item{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;border:2px solid transparent;background:var(--card-bg);color:var(--text-sec);transition:all .15s}
.icon-picker-grid .ip-item:hover{background:var(--border);color:var(--text-main)}
.icon-picker-grid .ip-item.selected{border-color:var(--primary);background:var(--primary-light);color:var(--primary)}
.config-item-new{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--card-bg);border-radius:14px;margin-bottom:6px;border:1px solid var(--border);box-shadow:0 2px 8px rgba(124,58,237,0.04)}
.config-item-new .ci-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--bg-app);flex-shrink:0}
.config-item-new .ci-info{flex:1}
.config-item-new .ci-info .ci-name{font-size:13px;font-weight:600;color:var(--text-main)}
.config-item-new .ci-info .ci-sub{font-size:10px;color:var(--text-muted)}
.config-item-new .ci-actions{display:flex;gap:6px}
.config-item-new .ci-actions button{background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:2px}
.config-item-new .ci-actions button:hover{color:var(--primary)}
.config-item-new .ci-actions .del:hover{color:#c0392b}
.tx-group-label{font-size:11px;font-weight:700;color:var(--text-muted);margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px}
.report-cat-item{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:10px;border-bottom:1px solid var(--border)}
.report-cat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.report-cat-info{flex:1}
.report-cat-name{font-size:13px;font-weight:600;color:var(--text-main)}
.report-cat-count{font-size:11px;color:var(--text-muted)}
.report-cat-amount{font-size:14px;font-weight:700;text-align:right}
.report-cat-bar{height:4px;border-radius:2px;background:var(--border);margin-top:4px;overflow:hidden}
.report-cat-fill{height:100%;border-radius:2px}
.rep-cat-new{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)}
.rep-cat-new .rc-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.rep-cat-new .rc-info{flex:1}
.rep-cat-new .rc-info .rc-name{font-size:12px;font-weight:600;color:var(--text-main)}
.rep-cat-new .rc-bar{height:4px;background:var(--border);border-radius:2px;margin-top:3px;overflow:hidden}
.rep-cat-new .rc-fill{height:100%;border-radius:2px}
.rep-cat-new .rc-amt{font-size:12px;font-weight:700;text-align:right}
.annual-chart-wrap{background:var(--card-bg);border-radius:16px;padding:16px;margin-bottom:16px}
.annual-chart-wrap h4{font-size:13px;font-weight:600;color:var(--text-main);margin-bottom:12px}
.annual-chart-wrap canvas{width:100%;height:160px;display:block}
.chart-wrap-new{background:var(--card-bg);border-radius:14px;padding:14px;margin-bottom:12px}
.chart-wrap-new h4{font-size:12px;font-weight:600;color:var(--text-main);margin-bottom:10px}
.chart-canvas-box{position:relative;width:100%;height:200px}
.chart-wrap-new canvas{display:block}
.progress-bar-new{height:6px;background:var(--border);border-radius:4px;overflow:hidden;margin:6px 0}
.progress-fill-new{height:100%;border-radius:4px;transition:width .5s ease}
.budget-item-new{padding:10px 0;border-bottom:1px solid var(--border)}
.budget-header-new{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.budget-header-new .b-name{font-size:12px;font-weight:600;color:var(--text-main)}
.budget-header-new .b-amt{font-size:11px;color:var(--text-muted)}
.budget-header-new .b-amt .spent{color:var(--text-sec);font-weight:600}
.goal-item-new{background:var(--card-bg);border-radius:14px;padding:14px;margin-bottom:10px}
.goal-item-new .g-name{font-size:14px;font-weight:700;color:var(--text-main);margin-bottom:6px}
.goal-progress-new{display:flex;align-items:center;gap:8px}
.goal-progress-new .gp-bar{flex:1;height:8px;background:var(--border);border-radius:6px;overflow:hidden}
.goal-progress-new .gp-fill{height:100%;border-radius:6px;background:var(--primary)}
.goal-progress-new .gp-pct{font-size:12px;font-weight:700;color:var(--primary);min-width:32px;text-align:right}
.goal-values-new{font-size:11px;color:var(--text-muted);margin-top:4px}
.v-health{display:flex;flex-direction:column;gap:6px;padding:4px 0}
.v-health-item{display:flex;align-items:center;gap:8px}
.v-health-item .v-lbl{font-size:11px;color:var(--text-sec);width:44px;flex-shrink:0}
.v-health-item .v-bar{flex:1;height:6px;background:var(--border);border-radius:4px;overflow:hidden}
.v-health-item .v-fill{height:100%;border-radius:4px;transition:width .5s}
.v-health-item .v-pct{font-size:11px;font-weight:600;width:32px;text-align:right;color:var(--text-sec)}
.v-hist-item{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)}
.v-hist-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;background:var(--card-bg)}
.v-hist-info{flex:1}
.v-hist-info .vh-t{font-size:12px;font-weight:600;color:var(--text-main)}
.v-hist-info .vh-s{font-size:10px;color:var(--text-muted)}
.v-hist-actions{display:flex;gap:4px;flex-shrink:0}
.v-del-btn{width:28px;height:28px;border:none;border-radius:6px;background:#c0392b22;color:#c0392b;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:background .15s}
.v-del-btn:hover{background:#c0392b44}
.v-edit-btn{width:28px;height:28px;border:none;border-radius:6px;background:var(--primary-light);color:var(--primary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:background .15s}
.v-edit-btn:hover{background:var(--primary)}
#vehicle-page{max-height:100vh;min-height:0;overflow:hidden}
.veh-action-overlay{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s,visibility .25s}
.veh-action-overlay.open{opacity:1;visibility:visible;pointer-events:auto}
.veh-action-card{background:var(--card-bg);border-radius:16px;padding:20px;width:260px;box-shadow:0 8px 32px rgba(0,0,0,.3);animation:modalUp .35s cubic-bezier(.34,1.56,.64,1)}
.veh-action-title{font-size:14px;font-weight:700;color:var(--text-main);text-align:center;margin-bottom:16px}
.veh-action-grid{display:flex;flex-direction:column;gap:10px}
.veh-action-btn{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:none;background:var(--bg-app);color:var(--text-main);font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 1px 4px rgba(0,0,0,.08);transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s}
.veh-action-btn:active{transform:scale(.95)}
.veh-action-btn i{font-size:22px;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.veh-action-btn .va-icon-gas{background:#e67e2215;color:#e67e22}
.veh-action-btn .va-icon-tool{background:#2980b915;color:#2980b9}
.tab-fab-wrap{position:relative;display:flex;justify-content:center;align-items:center;width:60px;height:0;z-index:5}
.tab-fab{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;border:none;box-shadow:0 6px 20px rgba(124,58,237,0.4);transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .35s;margin-top:-32px;z-index:6;position:relative}
.tab-fab:active{transform:scale(.92)}
.tab-fab.active{transform:rotate(45deg);background:linear-gradient(135deg,#dc2626,#b91c1c);box-shadow:0 6px 20px rgba(220,38,38,0.4)}
.tab-fab-sub{position:fixed;bottom:120px;left:50%;z-index:5;pointer-events:none;margin-left:-65px;width:130px;height:130px}
.tab-fab-sub .fab-opt{position:absolute;bottom:0;left:50%;margin-left:-24px;width:48px;height:48px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;background:#1a1a2e;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.3);font-family:inherit;opacity:0;transform:scale(0);transition:all .35s cubic-bezier(.34,1.56,.64,1)}
.tab-fab-sub.active .fab-opt{opacity:1;pointer-events:auto}
.tab-fab-sub.active .fab-opt-left{transform:scale(1) translate(-70px,-80px);transition-delay:.05s}
.tab-fab-sub.active .fab-opt-center{transform:scale(1) translate(0,-130px);transition-delay:.1s}
.tab-fab-sub.active .fab-opt-right{transform:scale(1) translate(70px,-80px);transition-delay:.15s}
.tab-fab-overlay{position:fixed;inset:0;z-index:4;display:none;background:rgba(0,0,0,.3);backdrop-filter:blur(4px)}
.tab-fab-overlay.active{display:block}
.notif-actions{display:flex;gap:8px;margin-top:8px}
.notif-actions button{flex:1;padding:6px 12px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}
.notif-actions .accept{background:var(--primary);color:#fff}
.notif-actions .reject{background:var(--card-bg);color:var(--text-sec)}
.p2p-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.p2p-card{background:var(--card-bg);border-radius:14px;padding:16px;text-align:center;cursor:pointer;transition:transform .15s}
.p2p-card:active{transform:scale(.95)}
.p2p-card .icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:22px}
.p2p-card .label{font-size:13px;font-weight:600;color:var(--text-main)}
.p2p-card .sub{font-size:11px;color:var(--text-muted)}
.p2p-search-result{padding:10px 12px;border-radius:10px;background:var(--card-bg);display:flex;align-items:center;gap:12px;margin-top:8px;cursor:pointer;transition:background .15s}
.p2p-search-result:active{background:var(--input-bg)}
.p2p-search-result .av{width:36px;height:36px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
#p2p-section .p2p-search-result{margin:6px 0 0;padding:8px 10px;border-radius:8px;background:var(--card-bg);display:flex;align-items:center;gap:10px;cursor:pointer}
#p2p-section .p2p-search-result.selected{background:var(--primary-light);border:2px solid var(--primary)}
.pwa-install-banner{display:none;align-items:center;gap:10px;padding:10px 14px;background:var(--primary);color:#fff;font-size:13px;font-weight:600;cursor:pointer;position:fixed;bottom:70px;left:0;right:0;z-index:999;border-radius:12px;margin:0 12px;box-shadow:0 4px 12px rgba(0,0,0,.25);max-width:400px;margin:0 auto;bottom:70px;left:12px;right:12px}
.pwa-install-banner i{font-size:20px}
.pwa-install-banner .close-banner{margin-left:auto;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px;opacity:.7}
.blurred{filter:blur(8px);user-select:none}
.loading-overlay{position:fixed;inset:0;z-index:998;background:var(--bg-body);display:flex;align-items:center;justify-content:center;flex-direction:column}
.loading-overlay.hidden{display:none}
.loading-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite}
.login-logo{font-size:32px;font-weight:800;color:var(--primary);letter-spacing:-1px}
.login-btn{display:flex;align-items:center;gap:10px;padding:12px 28px;border-radius:16px;border:2px solid var(--border);background:var(--bg-app);color:var(--text-main);font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
.login-btn:hover{background:var(--card-bg);border-color:var(--primary)}
.login-btn i{font-size:22px}
.login-avatar{width:64px;height:64px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700}
.login-divider{display:flex;align-items:center;gap:12px;width:280px;color:var(--text-muted);font-size:11px;font-weight:500}
.login-divider::before,.login-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.login-form{display:flex;flex-direction:column;gap:10px;width:280px}
.login-input{width:100%;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-main);border-radius:12px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;transition:border .15s}
.login-input:focus{border-color:var(--primary)}
.login-submit{width:100%;background:var(--primary);color:#fff;border:none;border-radius:12px;padding:11px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s}
.login-submit:hover{opacity:.88}
.login-link{font-size:12px;color:var(--text-muted);cursor:pointer;background:none;border:none;font-family:inherit;text-decoration:underline}
.login-link:hover{color:var(--primary)}
.login-toggle{display:flex;gap:8px;margin-bottom:4px}
.login-toggle button{flex:1;padding:7px;border-radius:10px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-muted);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
.login-toggle button.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.login-page{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-body);padding:20px}
.login-box{background:var(--bg-app);border-radius:20px;padding:32px 24px;width:100%;max-width:360px;text-align:center;box-shadow:0 2px 20px rgba(0,0,0,.06)}
.login-mark{width:56px;height:56px;border-radius:16px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;margin:0 auto 12px}
.login-title{font-size:22px;font-weight:800;color:var(--text-main);letter-spacing:-.5px}
.login-sub{font-size:13px;color:var(--text-muted);margin-bottom:24px}
.login-error{font-size:12px;color:#c0392b;margin-top:8px}
@keyframes pageIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.submit-btn,.action-btn,.filter-chip{transition:transform .15s cubic-bezier(.34,1.56,.64,1),opacity .15s}
.submit-btn:active,.action-btn:active,.filter-chip:active{transform:scale(.95)}
@media(min-width:768px){
body{background:var(--bg-body);padding:0}
.app{max-width:none;border-radius:0;box-shadow:none;min-height:100vh;overflow:visible;width:100%}
.app-shell{max-width:none;border-radius:0;box-shadow:none;min-height:100vh}
.page>.tab-bar{display:none !important}
.desktop-sidebar{display:flex;flex-direction:column;position:fixed;left:0;top:0;width:220px;height:100vh;background:var(--bg-top);border-right:1px solid var(--border);padding:20px 10px;z-index:100}
.desktop-sidebar .brand{display:flex;align-items:center;gap:10px;padding:0 10px;margin-bottom:24px}
.desktop-sidebar .brand-mark{width:32px;height:32px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.desktop-sidebar .brand-name{font-size:14px;font-weight:800;color:var(--text-main);letter-spacing:-.3px}
.desktop-sidebar nav{display:flex;flex-direction:column;gap:1px}
.desktop-sidebar .d-tab{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;border:none;background:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:var(--text-sec);text-align:left;width:100%;transition:background .15s,color .15s}
.desktop-sidebar .d-tab:hover{background:var(--bg-app);color:var(--text-main)}
.desktop-sidebar .d-tab.active{background:var(--primary-light);color:var(--primary)}
.desktop-sidebar .d-tab i{font-size:17px;width:20px;text-align:center;flex-shrink:0}
.desktop-sidebar .sidebar-footer{margin-top:auto;padding-top:10px;border-top:1px solid var(--border)}
.app.page{margin-left:220px;min-height:100vh}
.app>.top-bar,.app>.actions,.app>.page-header{background:var(--bg-app);border-right:none;min-height:auto}
.app>.top-bar{flex-direction:row;align-items:center;gap:16px;padding:28px 32px 6px;justify-content:space-between}
.app>.top-bar .greeting{flex-direction:row;gap:16px;align-items:center;width:auto}
.app>.actions{flex-direction:row;padding:6px 32px 14px;gap:8px;justify-content:flex-start}
.app>.content,.app>.page-content{padding:16px 28px 48px;margin-top:0;overflow-y:visible}
.app>.page-header{flex-direction:row;align-items:center;gap:10px;padding:28px 32px 6px}
.two-col{grid-template-columns:1fr 1fr}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px}
.actions .action-btn.center-btn{width:auto;height:auto;border-radius:16px;flex:0 0 auto;padding:9px 16px;font-size:13px}
.actions .action-btn.center-btn i{margin-right:6px}
.actions .action-btn.center-btn::after{content:'Transferir'}
.actions .action-btn.side{flex:0 0 auto;padding:9px 18px}
.app>.filter-row{padding:4px 32px}
.desktop-only{display:block}
.mobile-only{display:none}
.tab-fab-wrap,.tab-fab-sub,#fab-overlay{display:none!important}
.app.page .tab-bar{display:none!important}
}
@media(min-width:1024px){
.desktop-sidebar{width:240px}
.app.page{margin-left:240px}
.app>.content,.app>.page-content{max-width:none}
.two-col{grid-template-columns:1fr 1fr;gap:18px}
.three-col{grid-template-columns:1fr 1fr 1fr;gap:18px}
.desktop-grid-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:18px}
.send-again{flex-wrap:wrap}
.desktop-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
}
@media(min-width:1400px){
.desktop-sidebar{width:260px}
.app.page{margin-left:260px}
.desktop-chart-row{grid-template-columns:2fr 1fr}
}

```

## src\main.jsx
``$(@{True='jsx'}[src\main.jsx.EndsWith('.jsx') -or src\main.jsx.EndsWith('.js')])
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## src\App.jsx
``$(@{True='jsx'}[src\App.jsx.EndsWith('.jsx') -or src\App.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { doc, updateDoc, setDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase/config'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import { ToastProvider, useToast } from './components/Toast'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage'
import CardsPage from './pages/CardsPage'
import ProfilePage from './pages/ProfilePage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import BudgetPage from './pages/BudgetPage'
import GoalsPage from './pages/GoalsPage'
import VehiclePage from './pages/VehiclePage'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import FabMenu from './components/FabMenu'
import PwaInstallBanner from './components/PwaInstallBanner'
import TxModal from './components/TxModal'
import CardModal from './components/CardModal'
import ProfileEditModal from './components/ProfileEditModal'
import NotifModal from './components/NotifModal'
import AccountModal from './components/AccountModal'
import GoalModal from './components/GoalModal'
import BudgetLimitModal from './components/BudgetLimitModal'
import BudgetCatModal from './components/BudgetCatModal'
import VehicleConfigModal from './components/VehicleConfigModal'
import RefuelModal from './components/RefuelModal'
import MaintModal from './components/MaintModal'
import RouteModal from './components/RouteModal'
import './index.css'

function AppShell() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <LoginPage />

  return (
    <DataProvider>
      <ToastProvider>
        <AppCore />
      </ToastProvider>
    </DataProvider>
  )
}

function AppCore() {
  const { user, logout } = useAuth()
  const { categories, profile, cards, accounts, goals, budget, vehicle, modules } = useData()
  const { showToast } = useToast()
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState(localStorage.getItem('mu_theme') || 'light')
  const [fabOpen, setFabOpen] = useState(false)
  const [pwaDeferred, setPwaDeferred] = useState(null)
  const [pwaDismissed, setPwaDismissed] = useState(false)

  // Modal states
  const [txModal, setTxModal] = useState({ open: false, type: 'send', editTx: null })
  const [cardModal, setCardModal] = useState({ open: false, editCard: null })
  const [profileEditModal, setProfileEditModal] = useState({ open: false, field: null, value: '' })
  const [notifModal, setNotifModal] = useState(false)
  const [accountModal, setAccountModal] = useState({ open: false, editAccount: null })
  const [goalModal, setGoalModal] = useState({ open: false, editGoal: null })
  const [budgetLimitModal, setBudgetLimitModal] = useState(false)
  const [budgetCatModal, setBudgetCatModal] = useState({ open: false, editBudgetCat: null })
  const [vehicleConfigModal, setVehicleConfigModal] = useState(false)
  const [refuelModal, setRefuelModal] = useState(false)
  const [maintModal, setMaintModal] = useState(false)
  const [routeModal, setRouteModal] = useState(false)

  // Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('mu_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  // PWA
  useEffect(() => {
    const handler = e => { e.preventDefault(); setPwaDeferred(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPWA = async () => {
    if (!pwaDeferred) return
    pwaDeferred.prompt()
    const result = await pwaDeferred.userChoice
    if (result.outcome === 'accepted') showToast('Instalado!')
    setPwaDeferred(null)
  }

  // Vehicle module toggle
  const toggleVehicleModule = async () => {
    const newVal = !modules?.vehicleActive
    await setDoc(doc(db, 'settings', 'modules'), { vehicleActive: newVal }, { merge: true })
    showToast(newVal ? 'Veículo ativado!' : 'Veículo desativado')
  }

  // FAB
  const handleFabClick = () => setFabOpen(o => !o)
  const handleFabSelect = type => {
    setFabOpen(false)
    if (type === 'send' || type === 'receive') setTxModal({ open: true, type, editTx: null })
    else if (type === 'vehicle') setVehActionOpen(true)
  }

  // Navigation
  const navigate = p => { setPage(p); setFabOpen(false) }

  // Page components map (render active page inside app for desktop sidebar)
  const renderPage = () => {
    const commonProps = { onNavigate: navigate }
    switch (page) {
      case 'home': return <HomePage key="home" {...commonProps} onOpenTx={t => setTxModal({ open: true, type: t, editTx: null })} onOpenNotif={() => setNotifModal(true)} />
      case 'transactions': return <TransactionsPage key="tx" {...commonProps} onEditTransaction={tx => setTxModal({ open: true, type: tx.type || 'send', editTx: tx })} />
      case 'cards': return <CardsPage key="cards" {...commonProps} onEditCard={c => setCardModal({ open: true, editCard: c })} />
      case 'profile': return <ProfilePage key="profile" {...commonProps} onEditProfile={f => setProfileEditModal({ open: true, field: f, value: profile[f] || '' })} onToggleTheme={toggleTheme} onSignOut={logout} />
      case 'reports': return <ReportsPage key="reports" {...commonProps} onNavigateGoals={() => navigate('goals')} onNavigateBudget={() => navigate('budget')} />
      case 'settings': return <SettingsPage key="settings" {...commonProps} onEditAccount={a => setAccountModal({ open: true, editAccount: a })} onEditCard={c => setCardModal({ open: true, editCard: c })} onToggleVehicleModule={toggleVehicleModule} />
      case 'budget': return <BudgetPage key="budget" {...commonProps} onEditBudgetLimit={() => setBudgetLimitModal(true)} onEditBudgetCat={bc => setBudgetCatModal({ open: true, editBudgetCat: bc })} />
      case 'goals': return <GoalsPage key="goals" {...commonProps} onEditGoal={g => setGoalModal({ open: true, editGoal: g })} />
      case 'vehicle': return <VehiclePage key="vehicle" {...commonProps} onEditVehicle={() => setVehicleConfigModal(true)} onRefuel={() => setRefuelModal(true)} onMaint={() => setMaintModal(true)} onRoute={() => setRouteModal(true)} onCalcTrip={() => showToast('Calculadora de viagem')} />
      default: return <HomePage key="home" {...commonProps} />
    }
  }

  return (
    <div className="app-wrapper">
      <Sidebar activePage={page} onNavigate={navigate} />
      {renderPage()}

      {/* TabBar (mobile) */}
      <TabBar activePage={page} onNavigate={navigate} onFabClick={handleFabClick} />

      {/* FAB Menu */}
      <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} onSelect={handleFabSelect} />

      {/* PWA Install Banner */}
      {pwaDeferred && !pwaDismissed && (
        <div className="pwa-install-banner" style={{ display: 'flex' }} onClick={installPWA}>
          <i className="ti ti-download"></i>
          <span>Instalar Mu Finance</span>
          <button className="close-banner" onClick={e => { e.stopPropagation(); setPwaDismissed(true) }}>&times;</button>
        </div>
      )}

      {/* MODALS */}
      {txModal.open && <TxModal type={txModal.type} editTx={txModal.editTx} onClose={() => setTxModal({ open: false, type: 'send', editTx: null })} />}
      {cardModal.open && <CardModal editCard={cardModal.editCard} onClose={() => setCardModal({ open: false, editCard: null })} />}
      {profileEditModal.open && <ProfileEditModal field={profileEditModal.field} currentValue={profileEditModal.value} onClose={() => setProfileEditModal({ open: false, field: null, value: '' })} />}
      {notifModal && <NotifModal onClose={() => setNotifModal(false)} />}
      {accountModal.open && <AccountModal editAccount={accountModal.editAccount} onClose={() => setAccountModal({ open: false, editAccount: null })} />}
      {goalModal.open && <GoalModal editGoal={goalModal.editGoal} onClose={() => setGoalModal({ open: false, editGoal: null })} />}
      {budgetLimitModal && <BudgetLimitModal currentLimit={budget?.totalLimit || 0} onClose={() => setBudgetLimitModal(false)} onSave={async val => { await setDoc(doc(db, 'budget', 'current'), { totalLimit: val }, { merge: true }); setBudgetLimitModal(false); showToast('Limite salvo!') }} />}
      {budgetCatModal.open && <BudgetCatModal categories={categories.saida || []} editBudgetCat={budgetCatModal.editBudgetCat} onClose={() => setBudgetCatModal({ open: false, editBudgetCat: null })} onSave={async data => { const b = budget; b.cats[data.catId] = data.limit; await setDoc(doc(db, 'budget', 'current'), b, { merge: true }); setBudgetCatModal({ open: false, editBudgetCat: null }); showToast('Salvo!') }} />}
      {vehicleConfigModal && <VehicleConfigModal vehicle={vehicle} accounts={accounts} onClose={() => setVehicleConfigModal(false)} />}
      {refuelModal && <RefuelModal accounts={accounts} onClose={() => setRefuelModal(false)} />}
      {maintModal && <MaintModal accounts={accounts} onClose={() => setMaintModal(false)} />}
      {routeModal && <RouteModal accounts={accounts} onClose={() => setRouteModal(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

```

## src\firebase\config.js
``$(@{True='jsx'}[src\firebase\config.js.EndsWith('.jsx') -or src\firebase\config.js.EndsWith('.js')])
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: "projetomu-d5722.firebaseapp.com",
  projectId: "projetomu-d5722",
  storageBucket: "projetomu-d5722.firebasestorage.app",
  messagingSenderId: "94478862714",
  appId: "1:94478862714:web:578561a199f685f9e5eec3"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app

```

## src\context\AuthContext.jsx
``$(@{True='jsx'}[src\context\AuthContext.jsx.EndsWith('.jsx') -or src\context\AuthContext.jsx.EndsWith('.js')])
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

```

## src\context\DataContext.jsx
``$(@{True='jsx'}[src\context\DataContext.jsx.EndsWith('.jsx') -or src\context\DataContext.jsx.EndsWith('.js')])
import { createContext, useContext, useEffect, useState } from 'react'
import { collection, onSnapshot, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({ saida: [], entrada: [] })
  const [profile, setProfile] = useState({ name: 'Usuário', email: '', username: '' })
  const [notifications, setNotifications] = useState([])
  const [cards, setCards] = useState([])
  const [contacts, setContacts] = useState([])
  const [goals, setGoals] = useState([])
  const [budget, setBudget] = useState({ totalLimit: 0, cats: {} })
  const [accounts, setAccounts] = useState([])
  const [vehicle, setVehicle] = useState(null)
  const [refuels, setRefuels] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [routes, setRoutes] = useState([])
  const [vehicleHistory, setVehicleHistory] = useState([])
  const [modules, setModules] = useState({ vehicleActive: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setNotifications([])
      setCards([])
      setContacts([])
      setGoals([])
      setBudget({ totalLimit: 0, cats: {} })
      setAccounts([])
      setVehicle(null)
      setRefuels([])
      setMaintenances([])
      setRoutes([])
      setVehicleHistory([])
      setModules({ vehicleActive: false })
      setLoading(false)
      return
    }
    setLoading(true)

    const unsubs = [
      onSnapshot(collection(db, 'transactions'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0
          const bT = b.createdAt?.toDate?.()?.getTime() || 0
          return bT - aT
        })
        setTransactions(list)
      }),

      onSnapshot(collection(db, 'categories'), snap => {
        const cats = { saida: [], entrada: [] }
        snap.forEach(d => {
          const data = d.data()
          const type = data.type === 'entrada' ? 'entrada' : 'saida'
          if (cats[type]) cats[type].push({ id: d.id, ...data })
        })
        setCategories(cats)
      }),

      onSnapshot(doc(db, 'profile', 'me'), snap => {
        if (snap.exists()) setProfile(prev => ({ ...prev, ...snap.data() }))
      }),

      onSnapshot(query(collection(db, 'notifications'), where('uid', '==', user.uid)), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0
          const bT = b.createdAt?.toDate?.()?.getTime() || 0
          return bT - aT
        })
        setNotifications(list)
      }),

      onSnapshot(collection(db, 'cards'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setCards(list)
      }),

      onSnapshot(collection(db, 'contacts'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setContacts(list)
      }),

      onSnapshot(collection(db, 'goals'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setGoals(list)
      }),

      onSnapshot(doc(db, 'budget', 'current'), snap => {
        if (snap.exists()) setBudget(snap.data())
        else setBudget({ totalLimit: 0, cats: {} })
      }),

      onSnapshot(collection(db, 'accounts'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setAccounts(list)
      }),

      onSnapshot(doc(db, 'vehicle', 'config'), snap => {
        if (snap.exists()) setVehicle(snap.data())
        else setVehicle(null)
      }),

      onSnapshot(collection(db, 'vehicle_refuels'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setRefuels(list)
      }),

      onSnapshot(collection(db, 'vehicle_maintenance'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setMaintenances(list)
      }),

      onSnapshot(collection(db, 'vehicle_routes'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setRoutes(list)
      }),

      onSnapshot(doc(db, 'settings', 'modules'), snap => {
        if (snap.exists()) setModules(snap.data())
        else setModules({ vehicleActive: false })
      }),
    ]

    setLoading(false)
    return () => unsubs.forEach(u => u())
  }, [user])

  useEffect(() => {
    const all = [
      ...refuels.map(r => ({ ...r, _type: 'refuel' })),
      ...maintenances.map(m => ({ ...m, _type: 'maintenance' })),
      ...routes.map(r => ({ ...r, _type: 'route' })),
    ]
    all.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
    setVehicleHistory(all)
  }, [refuels, maintenances, routes])

  return (
    <DataContext.Provider value={{ transactions, categories, profile, notifications, cards, contacts, goals, budget, accounts, vehicle, refuels, maintenances, routes, vehicleHistory, modules, loading }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)

```

## src\components\Toast.jsx
``$(@{True='jsx'}[src\components\Toast.jsx.EndsWith('.jsx') -or src\components\Toast.jsx.EndsWith('.js')])
import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setVisible(false)
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`} id="toast">{message}</div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

```

## src\components\Sidebar.jsx
``$(@{True='jsx'}[src\components\Sidebar.jsx.EndsWith('.jsx') -or src\components\Sidebar.jsx.EndsWith('.js')])
export default function Sidebar({ activePage, onNavigate }) {
  const tabs = [
    { page: 'home', icon: 'ti ti-home', label: 'Início' },
    { page: 'transactions', icon: 'ti ti-chart-bar', label: 'Extrato' },
    { page: 'reports', icon: 'ti ti-report', label: 'Relatórios' },
    { page: 'cards', icon: 'ti ti-credit-card', label: 'Cartões' },
    { page: 'goals', icon: 'ti ti-target', label: 'Metas' },
    { page: 'budget', icon: 'ti ti-chart-pie', label: 'Orçamento' },
    { page: 'profile', icon: 'ti ti-user', label: 'Perfil' },
  ]

  return (
    <nav className="desktop-sidebar">
      <div className="brand">
        <div className="brand-mark"><i className="ti ti-wallet"></i></div>
        <div className="brand-name">Mu Finance</div>
      </div>
      <nav>
        {tabs.map(tab => (
          <button
            key={tab.page}
            className={`d-tab${activePage === tab.page ? ' active' : ''}`}
            data-page={tab.page}
            onClick={() => onNavigate(tab.page)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className={`d-tab${activePage === 'settings' ? ' active' : ''}`}
          data-page="settings"
          onClick={() => onNavigate('settings')}
        >
          <i className="ti ti-settings"></i>
          <span>Configurações</span>
        </button>
      </div>
    </nav>
  )
}

```

## src\components\TabBar.jsx
``$(@{True='jsx'}[src\components\TabBar.jsx.EndsWith('.jsx') -or src\components\TabBar.jsx.EndsWith('.js')])
export default function TabBar({ activePage, onNavigate, onFabClick }) {
  return (
    <div className="tab-bar">
      <button className={`tab${activePage === 'home' ? ' active' : ''}`} onClick={() => onNavigate('home')}>
        <i className="ti ti-home"></i>
        <span>Home</span>
      </button>

      <div className="tab-fab-wrap">
        <button className="tab-fab" onClick={onFabClick}><i className="ti ti-plus"></i></button>
      </div>

      <button className={`tab${activePage === 'profile' ? ' active' : ''}`} onClick={() => onNavigate('profile')}>
        <i className="ti ti-user"></i>
        <span>Profile</span>
      </button>
    </div>
  )
}

```

## src\components\FabMenu.jsx
``$(@{True='jsx'}[src\components\FabMenu.jsx.EndsWith('.jsx') -or src\components\FabMenu.jsx.EndsWith('.js')])
export default function FabMenu({ open, onClose, onSelect }) {
  return (
    <>
      <div className={`tab-fab-overlay${open ? ' active' : ''}`} onClick={onClose}></div>
      <div className={`tab-fab-sub${open ? ' active' : ''}`}>
        <button className="fab-opt fab-opt-left" onClick={() => { onSelect('send'); onClose() }}>
          <i className="ti ti-microphone"></i>
        </button>
        <button className="fab-opt fab-opt-center" onClick={() => { onSelect('receive'); onClose() }}>
          <i className="ti ti-bolt"></i>
        </button>
        <button className="fab-opt fab-opt-right" onClick={() => { onSelect('vehicle'); onClose() }}>
          <i className="ti ti-grid"></i>
        </button>
      </div>
    </>
  )
}

```

## src\components\ModalWrapper.jsx
``$(@{True='jsx'}[src\components\ModalWrapper.jsx.EndsWith('.jsx') -or src\components\ModalWrapper.jsx.EndsWith('.js')])
export default function ModalWrapper({ id, open, onClose, title, children }) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} id={id} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>
          {title}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x"></i></button>
        </h2>
        {children}
      </div>
    </div>
  )
}

```

## src\components\PwaInstallBanner.jsx
``$(@{True='jsx'}[src\components\PwaInstallBanner.jsx.EndsWith('.jsx') -or src\components\PwaInstallBanner.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function installPWA() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null)
      setShow(false)
    })
  }

  function dismissPWA() {
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="pwa-install-banner" id="pwa-install-banner" style={{ display: 'flex' }} onClick={installPWA}>
      <i className="ti ti-download"></i>
      <span>Instalar Mu Finance</span>
      <button className="close-banner" onClick={(e) => { e.stopPropagation(); dismissPWA() }}>&times;</button>
    </div>
  )
}

```

## src\components\TxModal.jsx
``$(@{True='jsx'}[src\components\TxModal.jsx.EndsWith('.jsx') -or src\components\TxModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function TxModal({ type, editTx, onClose, onSave }) {
  const { user } = useAuth()
  const { categories, profile } = useData()
  const isSend = type === 'send'
  const catType = isSend ? 'saida' : 'entrada'
  const catList = categories[catType] || []
  const isEditing = !!editTx

  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSubcat, setSelectedSubcat] = useState(null)
  const [status, setStatus] = useState('efetivada')
  const [p2pOn, setP2pOn] = useState(false)
  const [p2pQuery, setP2pQuery] = useState('')
  const [p2pUser, setP2pUser] = useState(null)
  const [p2pResults, setP2pResults] = useState([])
  const [recurring, setRecurring] = useState(false)
  const [recurMonths, setRecurMonths] = useState(12)

  useEffect(() => {
    if (editTx) {
      setAmount(Math.abs(editTx.amount).toString())
      setDesc(editTx.name || '')
      setSelectedCat(editTx.cat || null)
      setSelectedSubcat(editTx.subcat || null)
      setStatus(editTx.status || 'efetivada')
    }
  }, [editTx])

  const handleCatSelect = (id) => {
    setSelectedCat(id)
    setSelectedSubcat(null)
  }

  const handleP2pSearch = async (val) => {
    setP2pQuery(val)
    setP2pUser(null)
    if (!val || val.length < 1) { setP2pResults([]); return }
    const q = val.startsWith('@') ? val : '@' + val
    try {
      const snap = await getDocs(
        query(collection(db, 'profile'), where('username', '>=', q.toLowerCase()), where('username', '<=', q.toLowerCase() + '\uf8ff'), limit(5))
      )
      const users = []
      snap.forEach(d => { if (d.id !== user.uid) users.push({ uid: d.id, ...d.data() }) })
      setP2pResults(users)
    } catch (e) { console.error(e) }
  }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!selectedCat || !amt || amt <= 0) return alert('Preencha os campos obrigatórios')
    const cat = catList.find(c => c.id === selectedCat)
    if (!cat) return

    let displayName = desc || cat.name
    if (selectedSubcat) {
      const sub = cat.subcats?.find(s => s.id === selectedSubcat)
      if (sub) displayName = desc ? `${desc} (${sub.name})` : sub.name
    }

    const txAmt = isSend ? -amt : amt

    const txData = {
      name: displayName,
      cat: selectedCat,
      subcat: selectedSubcat || null,
      date: 'Agora',
      amount: txAmt,
      type: catType,
      icon: cat.icon || 'ti-receipt',
      bg: (cat.color || '#888') + '22',
      color: cat.color || '#888',
      group: 'Hoje',
      status,
      uid: user.uid,
    }

    if (p2pUser) {
      txData.p2pCounterpartName = p2pUser.name
      if (isSend) txData.p2pTargetUid = p2pUser.uid
      else txData.p2pSenderUid = p2pUser.uid
    }

    if (isEditing) {
      await updateDoc(doc(db, 'transactions', editTx.id), txData)
    } else {
      const now = new Date()
      const months = recurring ? Math.max(1, recurMonths) : 1
      const groupId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      for (let i = 0; i < months; i++) {
        const copy = { ...txData, createdAt: i === 0 ? serverTimestamp() : new Date(now.getFullYear(), now.getMonth() + i, now.getDate()) }
        if (i > 0) { copy.status = 'prevista'; copy.date = 'Previsto'; copy.group = 'Previsto' }
        if (recurring) copy.recurGroup = groupId
        await addDoc(collection(db, 'transactions'), copy)
      }

      if (p2pUser) {
        if (isSend) {
          await addDoc(collection(db, 'transactions'), {
            name: displayName, cat: selectedCat, subcat: selectedSubcat || null, date: 'Agora', amount: amt, type: 'entrada', icon: cat.icon || 'ti-receipt', bg: (cat.color || '#888') + '22', color: cat.color || '#888', group: 'Hoje', status: 'prevista', uid: p2pUser.uid, p2pCounterpartName: profile.name, p2pSenderUid: user.uid, createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'notifications'), {
            uid: p2pUser.uid, message: `${profile.name} enviou R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`, amount: amt, type: 'recebido', from: profile.name, read: false, createdAt: serverTimestamp(),
          })
        } else {
          const reqRef = await addDoc(collection(db, 'p2p_requests'), {
            fromUid: user.uid, fromName: profile.name, fromEmail: user.email || '', toUid: p2pUser.uid, toEmail: '', amount: amt, desc: desc || `Cobrança de ${profile.name}`, status: 'pending', createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'notifications'), {
            uid: p2pUser.uid, type: 'p2p_request', fromUid: user.uid, fromName: profile.name, amount: amt, desc: desc || `Cobrança de ${profile.name}`, message: `${profile.name} está cobrando R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`, p2pRequestId: reqRef.id, read: false, createdAt: serverTimestamp(),
          })
        }
      }
    }

    if (onSave) onSave()
    onClose()
  }

  const handleDelete = async () => {
    if (!editTx) return
    if (!confirm('Deseja excluir esta transação?')) return
    await updateDoc(doc(db, 'transactions', editTx.id), { deleted: true })
    if (onSave) onSave()
    onClose()
  }

  const selectedCatData = selectedCat ? catList.find(c => c.id === selectedCat) : null
  const hasSubcats = selectedCatData?.subcats?.length > 0

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {isEditing ? 'Editar Transação' : isSend ? 'Nova Despesa' : 'Nova Receita'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>

        <div className="tx-val-wrap">
          <input className="tx-val-input" type="number" placeholder="0,00" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <span className="tx-val-currency">R$</span>
        </div>

        <label className="field-label">Categoria</label>
        <div className="category-scroll" id="modal-categories">
          {catList.map(c => (
            <div key={c.id} className={'cat-item' + (selectedCat === c.id ? ' selected' : '')} onClick={() => handleCatSelect(c.id)}>
              <div className="cat-icon"><i className={'ti ' + (c.icon || 'ti-question-mark')} /></div>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>

        {hasSubcats && (
          <>
            <label className="field-label">Subcategoria</label>
            <div className="category-scroll" id="modal-subcategories">
              {selectedCatData.subcats.map(sub => (
                <div key={sub.id} className={'cat-item' + (selectedSubcat === sub.id ? ' selected' : '')} onClick={() => setSelectedSubcat(sub.id)}>
                  <div className="cat-icon" style={{ fontSize: 14, width: 32, height: 32, borderRadius: 8 }}><i className="ti ti-corner-down-right" /></div>
                  <div className="cat-name">{sub.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <label className="field-label">Descrição</label>
        <input className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Salário, Aluguel" />

        {!isEditing && (
          <>
            <div className="p2p-toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div className={'toggle-switch' + (p2pOn ? ' active' : '')} onClick={() => { setP2pOn(!p2pOn); setP2pUser(null); setP2pQuery(''); setP2pResults([]) }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{isSend ? 'Enviar para amigo' : 'Cobrar de amigo'}</span>
            </div>

            {p2pOn && (
              <div style={{ marginBottom: 12 }}>
                <input className="field-input" placeholder="@usuario" value={p2pQuery} onChange={e => handleP2pSearch(e.target.value)} autoComplete="off" />
                {p2pResults.length > 0 && p2pResults.map(u => (
                  <div key={u.uid} className={'p2p-search-result' + (p2pUser?.uid === u.uid ? ' selected' : '')} onClick={() => setP2pUser({ uid: u.uid, name: u.name || '', username: u.username || '' })}>
                    <div className="av">{(u.name || '?').charAt(0).toUpperCase()}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.username}</div></div>
                  </div>
                ))}
                {p2pUser && (
                  <div className="p2p-search-result selected" style={{ marginTop: 6 }}>
                    <div className="av" style={{ background: 'var(--primary)', color: '#fff' }}>{p2pUser.name.charAt(0).toUpperCase()}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{p2pUser.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p2pUser.username}</div></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <button className={'filter-chip' + (status === 'efetivada' ? ' active' : '')} onClick={() => setStatus('efetivada')} style={{ fontSize: 11, padding: '5px 10px' }}>Efetivada</button>
            <button className={'filter-chip' + (status === 'prevista' ? ' active' : '')} onClick={() => setStatus('prevista')} style={{ fontSize: 11, padding: '5px 10px' }}>Prevista</button>
          </div>
          {!isEditing && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={'toggle-switch' + (recurring ? ' active' : '')} onClick={() => setRecurring(!recurring)} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-main)' }}>Recorrente</span>
              </div>
              {recurring && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input className="field-input" type="number" min="1" max="60" value={recurMonths} onChange={e => setRecurMonths(parseInt(e.target.value) || 1)} style={{ width: 44, padding: '3px 4px', textAlign: 'center', margin: 0, fontSize: 11 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>meses</span>
                </div>
              )}
            </>
          )}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Confirmar</button>
        {isEditing && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Transação</button>
        )}
      </div>
    </div>
  )
}

```

## src\components\CardModal.jsx
``$(@{True='jsx'}[src\components\CardModal.jsx.EndsWith('.jsx') -or src\components\CardModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useData } from '../context/DataContext'

export default function CardModal({ editCard, onClose }) {
  const { profile } = useData()
  const [type, setType] = useState('Visa')
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')

  useEffect(() => {
    if (editCard) {
      setType(editCard.type || 'Visa')
      setNumber(editCard.number || '')
      setHolder(editCard.holder || '')
      setExpiry(editCard.expiry || '')
    } else {
      setHolder(profile.name || '')
    }
  }, [editCard, profile])

  const handleSubmit = async () => {
    if (!number.trim() || !holder.trim() || !expiry.trim()) return alert('Preencha todos os campos')
    const colors = { Visa: ['#1a7a4a', '#2d5a43'], Mastercard: ['#333', '#111'], Elo: ['#c0392b', '#7a1a1a'], Amex: ['#2c3e50', '#1a252f'] }
    const [color, colorDark] = colors[type] || ['#1a7a4a', '#2d5a43']
    const data = { type, number: number.trim(), holder: holder.trim(), expiry: expiry.trim(), color, colorDark }
    if (editCard) {
      await updateDoc(doc(db, 'cards', editCard.id), data)
    } else {
      await addDoc(collection(db, 'cards'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editCard) return
    if (!confirm('Excluir este cartão?')) return
    await updateDoc(doc(db, 'cards', editCard.id), { deleted: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editCard ? 'Editar Cartão' : 'Adicionar Cartão'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Bandeira</label>
        <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="Elo">Elo</option>
          <option value="Amex">Amex</option>
        </select>
        <label className="field-label">Número do Cartão</label>
        <input className="field-input" placeholder="**** **** **** 0000" maxLength={19} value={number} onChange={e => setNumber(e.target.value)} />
        <label className="field-label">Titular</label>
        <input className="field-input" placeholder="Nome do titular" value={holder} onChange={e => setHolder(e.target.value)} />
        <label className="field-label">Validade (MM/AA)</label>
        <input className="field-input" placeholder="12/28" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editCard && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Cartão</button>
        )}
      </div>
    </div>
  )
}

```

## src\components\ProfileEditModal.jsx
``$(@{True='jsx'}[src\components\ProfileEditModal.jsx.EndsWith('.jsx') -or src\components\ProfileEditModal.jsx.EndsWith('.js')])
import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export default function ProfileEditModal({ field, currentValue, onClose, onSave }) {
  const { user } = useAuth()
  const labels = { name: 'Nome', email: 'Email', username: 'Nome de usuário (@)' }
  const inputType = field === 'email' ? 'email' : 'text'
  const [value, setValue] = useState(currentValue ? currentValue.replace('@', '') : '')

  const handleSubmit = async () => {
    const val = value.trim()
    if (!val) return alert('Preencha o campo')
    const update = {}
    if (field === 'username') {
      update.username = '@' + val.replace('@', '')
      update.usernameChangedAt = serverTimestamp()
    } else if (field === 'name') {
      update.name = val
    } else if (field === 'email') {
      update.email = val
    }
    await setDoc(doc(db, 'profile', 'me'), update, { merge: true })
    if (user) await setDoc(doc(db, 'profile', user.uid), update, { merge: true })
    if (onSave) onSave()
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Editar {labels[field] || field}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">{labels[field] || field}</label>
        <input className="field-input" type={inputType} value={value} onChange={e => setValue(e.target.value)} placeholder={labels[field]} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}

```

## src\components\NotifModal.jsx
``$(@{True='jsx'}[src\components\NotifModal.jsx.EndsWith('.jsx') -or src\components\NotifModal.jsx.EndsWith('.js')])
import { collection, addDoc, doc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function NotifModal({ open, onClose }) {
  const { user } = useAuth()
  const { notifications, profile } = useData()

  const handleAccept = async (requestId, fromUid, fromName, amount, desc) => {
    const now = serverTimestamp()
    await addDoc(collection(db, 'transactions'), {
      name: desc || `Pagamento para ${fromName}`, cat: 'p2p', subcat: null, date: 'Agora', amount: -amount, type: 'saida', icon: 'ti-hand-stop',
      bg: '#e67e2222', color: '#e67e22', group: 'Hoje', status: 'prevista', uid: user.uid,
      p2pSenderUid: fromUid, p2pCounterpartName: fromName, createdAt: now,
    })
    await addDoc(collection(db, 'transactions'), {
      name: desc || `Recebido de ${profile.name}`, cat: 'p2p', subcat: null, date: 'Agora', amount: amount, type: 'entrada', icon: 'ti-hand-stop',
      bg: '#e67e2222', color: '#e67e22', group: 'Hoje', status: 'prevista', uid: fromUid,
      p2pTargetUid: user.uid, p2pCounterpartName: profile.name, createdAt: now,
    })
    await addDoc(collection(db, 'notifications'), {
      uid: fromUid, message: `${profile.name} aceitou sua cobrança de R$ ${formatBRL(amount)}`, amount, type: 'recebido',
      from: profile.name, read: false, createdAt: now,
    })
    await deleteDoc(doc(db, 'p2p_requests', requestId))
    const notifSnap = await getDocs(query(collection(db, 'notifications'), where('p2pRequestId', '==', requestId)))
    notifSnap.forEach(d => deleteDoc(d.ref))
  }

  const handleReject = async (requestId) => {
    await deleteDoc(doc(db, 'p2p_requests', requestId))
    const notifSnap = await getDocs(query(collection(db, 'notifications'), where('p2pRequestId', '==', requestId)))
    notifSnap.forEach(d => deleteDoc(d.ref))
  }

  const handleMarkRead = async (id) => {
    const { updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={e => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2>
          Notificações
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <div id="notif-list">
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma notificação</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="tx-item" style={n.read && n.type !== 'p2p_request' ? { opacity: 0.5 } : {}}>
                <div className="tx-logo" style={{
                  background: n.type === 'recebido' ? 'var(--primary-light)' : n.type === 'p2p_request' ? '#fff3e0' : '#f0e8fa',
                  color: n.type === 'recebido' ? 'var(--primary)' : n.type === 'p2p_request' ? '#e67e22' : '#7a4ab0'
                }}>
                  <i className={'ti ' + (n.type === 'recebido' ? 'ti-arrow-down-left' : n.type === 'p2p_request' ? 'ti-hand-stop' : 'ti-arrow-up-right')} />
                </div>
                <div className="tx-info" style={{ flex: 1 }}>
                  <div className="tx-name" onClick={() => handleMarkRead(n.id)}>{n.message}</div>
                  <div className="tx-date">{n.createdAt?.toDate?.()?.toLocaleString('pt-BR') || ''}</div>
                  {n.type === 'p2p_request' && (
                    <div className="notif-actions" style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button className="accept" onClick={() => handleAccept(n.p2pRequestId, n.fromUid, n.fromName, n.amount, n.desc)}
                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Aceitar
                      </button>
                      <button className="reject" onClick={() => handleReject(n.p2pRequestId)}
                        style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
                {!n.read && n.type !== 'p2p_request' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

```

## src\components\AccountModal.jsx
``$(@{True='jsx'}[src\components\AccountModal.jsx.EndsWith('.jsx') -or src\components\AccountModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

const BANKS = [
  { value: 'nubank', label: 'Nubank' }, { value: 'inter', label: 'Banco Inter' }, { value: 'caixa', label: 'Caixa' },
  { value: 'bb', label: 'Banco do Brasil' }, { value: 'bradesco', label: 'Bradesco' }, { value: 'santander', label: 'Santander' },
  { value: 'itau', label: 'Itaú' }, { value: 'c6', label: 'C6 Bank' }, { value: 'original', label: 'Banco Original' },
  { value: 'pagbank', label: 'PagBank' }, { value: 'picpay', label: 'PicPay' }, { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'neon', label: 'Neon' }, { value: 'next', label: 'Next' }, { value: 'sofisa', label: 'Sofisa' },
]

export default function AccountModal({ editAccount, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('carteira')
  const [bank, setBank] = useState('')
  const [color, setColor] = useState('#1a7a4a')
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name || '')
      setType(editAccount.type || 'carteira')
      setBank(editAccount.bank || '')
      setColor(editAccount.color || '#1a7a4a')
      setBalance(editAccount.balance?.toString() || '')
    } else {
      setType('carteira')
      setBank('')
      setColor('#1a7a4a')
      setBalance('')
    }
  }, [editAccount])

  const showBank = type === 'corrente' || type === 'digital'

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Nome obrigatório')
    const data = { name: name.trim(), type, color, balance: parseFloat(balance) || 0 }
    if (bank) data.bank = bank
    if (editAccount) {
      await updateDoc(doc(db, 'accounts', editAccount.id), data)
    } else {
      await addDoc(collection(db, 'accounts'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editAccount) return
    if (editAccount.name === 'Carteira') { alert('A conta Carteira não pode ser excluída'); return }
    if (!confirm('Excluir?')) return
    await updateDoc(doc(db, 'accounts', editAccount.id), { deleted: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editAccount ? 'Editar' : 'Adicionar'} Conta
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Nome</label>
        <input className="field-input" placeholder="Ex: Carteira, Nubank" value={name} onChange={e => setName(e.target.value)} />
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => { setType(e.target.value); if (e.target.value === 'carteira') setBank('') }}>
          <option value="carteira">Carteira</option>
          <option value="corrente">Conta Corrente</option>
          <option value="poupanca">Poupança</option>
          <option value="digital">Conta Digital</option>
        </select>
        {showBank && (
          <>
            <label className="field-label">Banco</label>
            <select className="field-input" value={bank} onChange={e => setBank(e.target.value)}>
              <option value="">Selecione</option>
              {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </>
        )}
        <label className="field-label">Cor</label>
        <input className="field-input" type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 44, padding: 4 }} />
        <label className="field-label">Saldo Inicial (R$)</label>
        <input className="field-input" type="number" step="0.01" placeholder="0,00" value={balance} onChange={e => setBalance(e.target.value)} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editAccount && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Conta</button>
        )}
      </div>
    </div>
  )
}

```

## src\components\GoalModal.jsx
``$(@{True='jsx'}[src\components\GoalModal.jsx.EndsWith('.jsx') -or src\components\GoalModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function GoalModal({ editGoal, onClose }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name || '')
      setTarget(editGoal.target?.toString() || '')
      setSaved(editGoal.saved?.toString() || '')
    }
  }, [editGoal])

  const handleSubmit = async () => {
    if (!name.trim() || !target || parseFloat(target) <= 0) return alert('Preencha nome e valor alvo')
    const data = { name: name.trim(), target: parseFloat(target), saved: parseFloat(saved) || 0 }
    if (editGoal) {
      await updateDoc(doc(db, 'goals', editGoal.id), data)
    } else {
      await addDoc(collection(db, 'goals'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editGoal || !confirm('Excluir meta?')) return
    await deleteDoc(doc(db, 'goals', editGoal.id))
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editGoal ? 'Editar Meta' : 'Nova Meta'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Nome da Meta</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem para Europa" />
        <label className="field-label">Valor Alvo (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={target} onChange={e => setTarget(e.target.value)} placeholder="10000" />
        <label className="field-label">Já guardado (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar Meta</button>
        {editGoal && <button className="submit-btn" style={{ background: '#c0392b', marginTop: 10 }} onClick={handleDelete}>Excluir Meta</button>}
      </div>
    </div>
  )
}

```

## src\components\BudgetLimitModal.jsx
``$(@{True='jsx'}[src\components\BudgetLimitModal.jsx.EndsWith('.jsx') -or src\components\BudgetLimitModal.jsx.EndsWith('.js')])
import { useState } from 'react'

export default function BudgetLimitModal({ currentLimit, onClose, onSave }) {
  const [limit, setLimit] = useState(currentLimit?.toString() || '')

  const handleSubmit = () => {
    onSave(parseFloat(limit) || 0)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Limite Mensal Total
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Limite (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}

```

## src\components\BudgetCatModal.jsx
``$(@{True='jsx'}[src\components\BudgetCatModal.jsx.EndsWith('.jsx') -or src\components\BudgetCatModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'

export default function BudgetCatModal({ categories, editBudgetCat, onClose, onSave }) {
  const [catId, setCatId] = useState('')
  const [limit, setLimit] = useState('')

  useEffect(() => {
    if (editBudgetCat) {
      setCatId(editBudgetCat.catId || '')
      setLimit(editBudgetCat.limit?.toString() || '')
    } else {
      setCatId(categories[0]?.id || '')
      setLimit('')
    }
  }, [editBudgetCat, categories])

  const handleSubmit = () => {
    if (!catId) return alert('Selecione uma categoria')
    onSave({ catId, limit: parseFloat(limit) || 0 })
    onClose()
  }

  const handleDelete = () => {
    if (!editBudgetCat || !confirm('Excluir?')) return
    onSave({ catId: editBudgetCat.catId, limit: 0, delete: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editBudgetCat ? 'Editar Categoria' : 'Nova Categoria'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Categoria (Despesa)</label>
        <select className="field-input" value={catId} onChange={e => setCatId(e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="field-label">Limite (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={limit} onChange={e => setLimit(e.target.value)} placeholder="1000" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editBudgetCat && <button className="submit-btn" style={{ background: '#c0392b', marginTop: 10 }} onClick={handleDelete}>Excluir</button>}
      </div>
    </div>
  )
}

```

## src\components\VehicleConfigModal.jsx
``$(@{True='jsx'}[src\components\VehicleConfigModal.jsx.EndsWith('.jsx') -or src\components\VehicleConfigModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function VehicleConfigModal({ vehicle, onClose }) {
  const [type, setType] = useState('carro')
  const [name, setName] = useState('')
  const [oilKm, setOilKm] = useState('')
  const [oilInterval, setOilInterval] = useState('')
  const [plateEnd, setPlateEnd] = useState('')
  const [consumo, setConsumo] = useState('')

  useEffect(() => {
    if (vehicle) {
      setType(vehicle.type || 'carro')
      setName(vehicle.name || '')
      setOilKm(vehicle.oilKm?.toString() || '')
      setOilInterval(vehicle.oilInterval?.toString() || '')
      setPlateEnd(vehicle.plateEnd?.toString() ?? '')
      setConsumo(vehicle.consumo?.toString() || '')
    }
  }, [vehicle])

  const handleSubmit = async () => {
    const data = {
      type,
      name: name.trim(),
      oilKm: parseInt(oilKm) || 0,
      oilInterval: parseInt(oilInterval) || 0,
      plateEnd: parseInt(plateEnd) || 0,
      consumo: parseFloat(consumo) || 0,
    }
    await setDoc(doc(db, 'vehicle', 'config'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Configurar Veículo
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
        <label className="field-label">Nome / Apelido</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Civic" />
        <label className="field-label">KM da Última Troca de Óleo</label>
        <input className="field-input" type="number" min="0" value={oilKm} onChange={e => setOilKm(e.target.value)} placeholder="5000" />
        <label className="field-label">Trocar Óleo a Cada (KM)</label>
        <input className="field-input" type="number" min="0" value={oilInterval} onChange={e => setOilInterval(e.target.value)} placeholder="10000" />
        <label className="field-label">Final da Placa (0-9)</label>
        <input className="field-input" type="number" min="0" max="9" value={plateEnd} onChange={e => setPlateEnd(e.target.value)} placeholder="5" />
        <label className="field-label">Consumo Manual (km/L, opcional)</label>
        <input className="field-input" type="number" step="0.1" min="0" value={consumo} onChange={e => setConsumo(e.target.value)} placeholder="12" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}

```

## src\components\RefuelModal.jsx
``$(@{True='jsx'}[src\components\RefuelModal.jsx.EndsWith('.jsx') -or src\components\RefuelModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RefuelModal({ accounts, onClose }) {
  const [fuelType, setFuelType] = useState('gasolina')
  const [price, setPrice] = useState('')
  const [liters, setLiters] = useState('')
  const [total, setTotal] = useState('')
  const [km, setKm] = useState('')
  const [fullTank, setFullTank] = useState(false)
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id)
  }, [accounts])

  const calc = (changed) => {
    const p = parseFloat(price) || 0
    const l = parseFloat(liters) || 0
    const t = parseFloat(total) || 0
    if (changed === 'price' && l > 0) setTotal((p * l).toFixed(2))
    else if (changed === 'liters' && p > 0) setTotal((p * l).toFixed(2))
    else if (changed === 'total' && p > 0) setLiters((t / p).toFixed(2))
    else if (changed === 'total' && l > 0) setPrice((t / l).toFixed(3))
    else if (changed === 'price' && t > 0) setLiters((t / p).toFixed(2))
    else if (changed === 'liters' && t > 0) setPrice((t / l).toFixed(3))
  }

  const handleOcr = () => {
    console.log('OCR')
  }

  const handleSubmit = async () => {
    const val = parseFloat(total) || (parseFloat(price) || 0) * (parseFloat(liters) || 0)
    const odometer = parseInt(km) || 0
    if (!val || !odometer) return alert('Preencha valor e km')
    const data = {
      type: fuelType,
      price: parseFloat(price) || 0,
      liters: parseFloat(liters) || (parseFloat(price) > 0 ? val / parseFloat(price) : 0),
      value: val,
      km: odometer,
      tanqueCheio: fullTank,
      accountId: accountId || null,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_refuels'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Abastecimento
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Combustível</label>
        <select className="field-input" value={fuelType} onChange={e => setFuelType(e.target.value)}>
          <option value="gasolina">Gasolina</option>
          <option value="etanol">Etanol</option>
          <option value="diesel">Diesel</option>
          <option value="gnv">GNV</option>
        </select>
        <label className="field-label">Preço por Litro (R$)</label>
        <input className="field-input" type="number" step="0.001" min="0" value={price} onChange={e => { setPrice(e.target.value); calc('price') }} placeholder="5,49" />
        <label className="field-label">Litros</label>
        <input className="field-input" type="number" step="0.01" min="0" value={liters} onChange={e => { setLiters(e.target.value); calc('liters') }} placeholder="40" />
        <label className="field-label">Valor Total (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={total} onChange={e => { setTotal(e.target.value); calc('total') }} placeholder="0" />
        <label className="field-label">Hodômetro (KM)</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Tanque Cheio?</label>
        <div className={'toggle-switch' + (fullTank ? ' active' : '')} onClick={() => setFullTank(!fullTank)} style={{ margin: '4px 0 10px' }} />
        <label className="field-label">Conta (opcional)</label>
        <select className="field-input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">Nenhuma</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button className="submit-btn" style={{ flex: 0, padding: '10px 16px', fontSize: 12 }} onClick={handleOcr}><i className="ti ti-paperclip" /> Câmera</button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>fotografe a bomba para preenchimento automático</span>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>Registrar Abastecimento</button>
      </div>
    </div>
  )
}

```

## src\components\MaintModal.jsx
``$(@{True='jsx'}[src\components\MaintModal.jsx.EndsWith('.jsx') -or src\components\MaintModal.jsx.EndsWith('.js')])
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function MaintModal({ accounts, onClose }) {
  const [type, setType] = useState('oleo')
  const [desc, setDesc] = useState('')
  const [km, setKm] = useState('')
  const [value, setValue] = useState('')
  const [accountId, setAccountId] = useState('')
  const [oilFlag, setOilFlag] = useState(false)

  useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id)
  }, [accounts])

  const handleSubmit = async () => {
    if (!desc.trim()) return alert('Preencha a descrição')
    const data = {
      type,
      desc: desc.trim(),
      km: parseInt(km) || 0,
      value: parseFloat(value) || 0,
      oilFlag,
      accountId: accountId || null,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_maintenance'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Manutenção
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => { setType(e.target.value); if (e.target.value === 'oleo') setOilFlag(true) }}>
          <option value="oleo">Troca de Óleo</option>
          <option value="pneus">Pneus</option>
          <option value="corrente">Corrente</option>
          <option value="freios">Freios</option>
          <option value="filtros">Filtros</option>
          <option value="suspensao">Suspensão</option>
          <option value="outro">Outro</option>
        </select>
        <label className="field-label">Descrição</label>
        <input className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Troca de óleo 5w30" />
        <label className="field-label">KM</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Valor (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="250" />
        <label className="field-label">Conta (opcional)</label>
        <select className="field-input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">Nenhuma</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sec)', margin: '8px 0' }}>
          <input type="checkbox" checked={oilFlag} onChange={e => setOilFlag(e.target.checked)} />
          Esta manutenção é troca de óleo
        </label>
        <button className="submit-btn" onClick={handleSubmit}>Registrar Manutenção</button>
      </div>
    </div>
  )
}

```

## src\components\RouteModal.jsx
``$(@{True='jsx'}[src\components\RouteModal.jsx.EndsWith('.jsx') -or src\components\RouteModal.jsx.EndsWith('.js')])
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RouteModal({ onClose }) {
  const [km, setKm] = useState('')
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')
  const [reason, setReason] = useState('')
  const [distance, setDistance] = useState('')

  const handleCalcDistance = () => {
    const dist = Math.floor(Math.random() * 491) + 10
    setDistance(dist.toString())
  }

  const handleSubmit = async () => {
    if (!origin.trim() || !dest.trim()) return alert('Preencha origem e destino')
    if (!reason) return alert('Selecione o motivo')
    const data = {
      km: parseInt(km) || 0,
      origin: origin.trim(),
      dest: dest.trim(),
      reason,
      distance: parseFloat(distance) || 0,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_routes'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Registrar Rota
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Hodômetro (KM)</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Origem</label>
        <input className="field-input" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Ex: Fortaleza, CE" />
        <label className="field-label">Destino</label>
        <input className="field-input" value={dest} onChange={e => setDest(e.target.value)} placeholder="Ex: São Paulo, SP" />
        <label className="field-label">Motivo</label>
        <select className="field-input" value={reason} onChange={e => setReason(e.target.value)}>
          <option value="">Selecione</option>
          <option value="trabalho">Trabalho</option>
          <option value="lazer">Lazer</option>
          <option value="viagem">Viagem</option>
          <option value="diaadia">Dia a Dia</option>
        </select>
        <label className="field-label">Distância (km)</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="field-input" type="number" step="0.1" min="0" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0" style={{ flex: 1, marginBottom: 0 }} />
          <button className="submit-btn" style={{ flex: 0, padding: '10px 16px', fontSize: 12, width: 'auto' }} onClick={handleCalcDistance}><i className="ti ti-map-pin" /> Calcular</button>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>Salvar Rota</button>
      </div>
    </div>
  )
}

```

## src\components\IconPicker.jsx
``$(@{True='jsx'}[src\components\IconPicker.jsx.EndsWith('.jsx') -or src\components\IconPicker.jsx.EndsWith('.js')])
const ICONS = [
  'ti-home', 'ti-building', 'ti-building-store', 'ti-briefcase', 'ti-wallet', 'ti-coin', 'ti-credit-card', 'ti-cash',
  'ti-shopping-cart', 'ti-shopping-bag', 'ti-gift', 'ti-tag', 'ti-discount', 'ti-percentage',
  'ti-car', 'ti-motorbike', 'ti-bus', 'ti-plane', 'ti-ship', 'ti-truck', 'ti-gas-station', 'ti-tool', 'ti-settings',
  'ti-heart', 'ti-medical-cross', 'ti-pill', 'ti-stethoscope',
  'ti-book', 'ti-graduation-cap', 'ti-pencil', 'ti-code', 'ti-devices',
  'ti-phone', 'ti-device-mobile', 'ti-laptop', 'ti-wifi', 'ti-battery', 'ti-plug',
  'ti-music', 'ti-video', 'ti-camera', 'ti-photo', 'ti-movie', 'ti-headphones',
  'ti-tv', 'ti-player-play', 'ti-news', 'ti-newspaper', 'ti-cloud', 'ti-download',
  'ti-umbrella', 'ti-sun', 'ti-moon', 'ti-flame', 'ti-snowflake', 'ti-droplet',
  'ti-leaf', 'ti-tree', 'ti-flower', 'ti-paw',
  'ti-shirt', 'ti-shoe', 'ti-ring', 'ti-diamond', 'ti-clock', 'ti-calendar',
  'ti-cup', 'ti-glass', 'ti-bottle', 'ti-meat', 'ti-apple', 'ti-cake',
  'ti-users', 'ti-user', 'ti-crown', 'ti-flag', 'ti-star',
  'ti-plane-tilt', 'ti-luggage', 'ti-map', 'ti-map-pin', 'ti-compass', 'ti-road',
  'ti-lock', 'ti-shield', 'ti-eye', 'ti-bell', 'ti-speakerphone', 'ti-alarm',
  'ti-wash', 'ti-soap', 'ti-trash', 'ti-cleaning', 'ti-brush',
  'ti-pet', 'ti-dog-bowl', 'ti-cat',
  'ti-fence', 'ti-roof', 'ti-window', 'ti-lamp',
  'ti-chart-bar', 'ti-chart-pie', 'ti-chart-line', 'ti-report', 'ti-file-invoice', 'ti-file-text',
  'ti-activity', 'ti-trending-up', 'ti-trending-down', 'ti-arrows-exchange',
  'ti-food', 'ti-tools-kitchen-2', 'ti-glass-full',
]

export default function IconPicker({ selected, onSelect }) {
  return (
    <div className="icon-picker-grid">
      {ICONS.map(icon => (
        <div key={icon} className={'ip-item' + (selected === icon ? ' selected' : '')} onClick={() => onSelect(icon)}>
          <i className={'ti ' + icon} />
        </div>
      ))}
    </div>
  )
}

```

## src\pages\LoginPage.jsx
``$(@{True='jsx'}[src\pages\LoginPage.jsx.EndsWith('.jsx') -or src\pages\LoginPage.jsx.EndsWith('.js')])
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou senha inválidos')
      } else {
        setError(err.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-mark">M</div>
        </div>
        <h1 className="login-title">Mu Finance</h1>
        <p className="login-sub">Acesse sua carteira</p>
        <form onSubmit={handleSubmit}>
          <input className="field-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          <input className="field-input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ marginTop: 8 }} />
          {error && <p className="login-error">{error}</p>}
          <button className="submit-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

```

## src\pages\HomePage.jsx
``$(@{True='jsx'}[src\pages\HomePage.jsx.EndsWith('.jsx') -or src\pages\HomePage.jsx.EndsWith('.js')])
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function HomePage({ onNavigate, onOpenTx, onOpenNotif }) {
  const { user } = useAuth()
  const { transactions, categories, notifications } = useData()
  const balance = transactions.reduce((s, t) => s + (t.amount || 0), 0)
  const unreadNotifs = notifications.filter(n => !n.read).length
  const [localTxType, setLocalTxType] = useState(null)

  const openTx = type => {
    if (onOpenTx) onOpenTx(type)
    else setLocalTxType(type)
  }

  const handleOpenNotif = () => { if (onOpenNotif) onOpenNotif() }

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="greeting">
          <div className="greeting-left">
            <div className="profile-avatar-top">M</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Olá!</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bem-vindo à sua carteira</span>
            </div>
          </div>
          <div className="icons">
            <NotifBell count={unreadNotifs} onClick={handleOpenNotif} />
          </div>
        </div>
        <div className="balance-section">
          <div className="currency-badge"><i className="ti ti-coin" style={{ fontSize: 13 }} /> BRL</div>
          <div className="balance">
            <sup>R$</sup>
            {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
            <small>,{balance.toFixed(2).split('.')[1]}</small>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <TxButton label="Receita" icon="ti-plus" type="receive" onOpen={openTx} />
        <TxButton label="Transferir" icon="ti-arrows-exchange" type="transfer" onOpen={openTx} />
        <TxButton label="Despesa" icon="ti-minus" type="send" onOpen={openTx} />
      </div>

      {/* Content */}
      <div className="content">
        <IncomeExpenseCards transactions={transactions} />
        <MiniChart transactions={transactions} />
        <RecentTransactions transactions={transactions} />
      </div>

      {localTxType && <TxModal type={localTxType} onClose={() => setLocalTxType(null)} />}
    </div>
  )
}

function NotifBell({ count, onClick }) {
  return (
    <button className="icon-btn" style={{ position: 'relative' }} onClick={onClick}>
      <i className="ti ti-bell" />
      <span className={'notif-badge' + (count > 0 ? ' show' : '')} />
    </button>
  )
}

function TxButton({ label, icon, type, onOpen }) {
  return (
    <button className={'action-btn ' + (label === 'Transferir' ? 'center-btn' : 'side')} onClick={() => { if (type !== 'transfer') onOpen(type) }}>
      <i className={'ti ' + icon} />
    </button>
  )
}

function IncomeExpenseCards({ transactions }) {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  return (
    <div className="two-col" style={{ marginBottom: 8 }}>
      <div className="income-card">
        <div className="income-label">Receitas</div>
        <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>R$ {formatBRL(income)}</div>
      </div>
      <div className="income-card">
        <div className="income-label">Despesas</div>
        <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>R$ {formatBRL(expense)}</div>
      </div>
    </div>
  )
}

function MiniChart({ transactions }) {
  const now = new Date()
  const monthIncome = transactions.filter(t => t.amount > 0 && t.createdAt?.toDate?.()?.getMonth() === now.getMonth()).reduce((s, t) => s + t.amount, 0)
  return (
    <div className="income-card" style={{ marginTop: 12 }}>
      <div className="income-label">Sua renda · Este mês</div>
      <div className="income-amount">R$ {formatBRL(monthIncome)}</div>
    </div>
  )
}

function RecentTransactions({ transactions }) {
  const recent = transactions.slice(0, 5)
  return (
    <div style={{ marginTop: 16 }}>
      <div className="section-title-new"><i className="ti ti-history" /> Recentes</div>
      {recent.map(t => (
        <div key={t.id} className="tx-item" style={{ opacity: t.status === 'prevista' ? 0.6 : 1 }}>
          <div className="tx-logo" style={{ background: t.bg || 'var(--card-bg)', color: t.color || 'var(--text-sec)' }}>
            <i className={'ti ' + (t.icon || 'ti-receipt')} />
          </div>
          <div className="tx-info">
            <div className="tx-name">{t.name || 'Transação'}</div>
            <div className="tx-cat">{t.status === 'prevista' ? 'Previsto' : 'Hoje'}</div>
          </div>
          <div className="tx-amount" style={{ color: t.amount < 0 ? '#c0392b' : 'var(--primary)' }}>
            {t.amount < 0 ? '-' : '+'}R$ {formatBRL(Math.abs(t.amount))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ===== TRANSACTION MODAL WITH P2P =====
function TxModal({ type, onClose }) {
  const { user } = useAuth()
  const { categories, profile } = useData()
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSubcat, setSelectedSubcat] = useState(null)
  const [status, setStatus] = useState('efetivada')
  const [p2pOn, setP2pOn] = useState(false)
  const [p2pQuery, setP2pQuery] = useState('')
  const [p2pUser, setP2pUser] = useState(null)
  const [p2pResults, setP2pResults] = useState([])
  const [searching, setSearching] = useState(false)

  const isSend = type === 'send'
  const catType = isSend ? 'saida' : 'entrada'
  const catList = categories[catType] || []

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!selectedCat || !amt || amt <= 0) return alert('Preencha os campos obrigatórios')
    const cat = catList.find(c => c.id === selectedCat)
    if (!cat) return

    let displayName = desc || cat.name
    if (selectedSubcat) {
      const sub = cat.subcats?.find(s => s.id === selectedSubcat)
      if (sub) displayName = desc ? `${desc} (${sub.name})` : sub.name
    }

    const txAmt = isSend ? -amt : amt
    const txData = {
      name: displayName,
      cat: selectedCat,
      subcat: selectedSubcat || null,
      date: 'Agora',
      amount: txAmt,
      type: catType,
      icon: cat.icon || 'ti-receipt',
      bg: (cat.color || '#888') + '22',
      color: cat.color || '#888',
      group: 'Hoje',
      status,
      uid: user.uid,
      createdAt: serverTimestamp(),
    }

    if (p2pUser) {
      txData.p2pCounterpartName = p2pUser.name
      if (isSend) txData.p2pTargetUid = p2pUser.uid
      else txData.p2pSenderUid = p2pUser.uid
    }

    await addDoc(collection(db, 'transactions'), txData)

    if (p2pUser) {
      if (isSend) {
        await addDoc(collection(db, 'transactions'), {
          name: displayName,
          cat: selectedCat,
          subcat: selectedSubcat || null,
          date: 'Agora',
          amount: amt,
          type: 'entrada',
          icon: cat.icon || 'ti-receipt',
          bg: (cat.color || '#888') + '22',
          color: cat.color || '#888',
          group: 'Hoje',
          status: 'prevista',
          uid: p2pUser.uid,
          p2pCounterpartName: profile.name,
          p2pSenderUid: user.uid,
          createdAt: serverTimestamp(),
        })
        await addDoc(collection(db, 'notifications'), {
          uid: p2pUser.uid,
          message: `${profile.name} enviou R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`,
          amount: amt,
          type: 'recebido',
          from: profile.name,
          read: false,
          createdAt: serverTimestamp(),
        })
      } else {
        const reqRef = await addDoc(collection(db, 'p2p_requests'), {
          fromUid: user.uid,
          fromName: profile.name,
          fromEmail: user.email || '',
          toUid: p2pUser.uid,
          toEmail: '',
          amount: amt,
          desc: desc || `Cobrança de ${profile.name}`,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
        await addDoc(collection(db, 'notifications'), {
          uid: p2pUser.uid,
          type: 'p2p_request',
          fromUid: user.uid,
          fromName: profile.name,
          amount: amt,
          desc: desc || `Cobrança de ${profile.name}`,
          message: `${profile.name} está cobrando R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`,
          p2pRequestId: reqRef.id,
          read: false,
          createdAt: serverTimestamp(),
        })
      }
    }

    onClose()
  }

  const handleP2pSearch = async val => {
    setP2pQuery(val)
    setP2pUser(null)
    if (!val || val.length < 1) { setP2pResults([]); return }
    setSearching(true)
    const q = val.startsWith('@') ? val : '@' + val
    try {
      const { query, where, collection: col, getDocs, limit } = await import('firebase/firestore')
      const snap = await getDocs(
        query(col(db, 'profile'), where('username', '>=', q.toLowerCase()), where('username', '<=', q.toLowerCase() + '\uf8ff'), limit(5))
      )
      const users = []
      snap.forEach(d => { if (d.id !== user.uid) users.push({ uid: d.id, ...d.data() }) })
      setP2pResults(users)
    } catch (e) { console.error(e) }
    setSearching(false)
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {isSend ? 'Nova Despesa' : 'Nova Receita'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>

        <div className="tx-val-wrap">
          <input className="tx-val-input" type="number" placeholder="0,00" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <span className="tx-val-currency">R$</span>
        </div>

        <label className="field-label">Categoria</label>
        <div className="category-scroll">
          {catList.map(c => (
            <div key={c.id} className={'cat-item' + (selectedCat === c.id ? ' selected' : '')} onClick={() => { setSelectedCat(c.id); setSelectedSubcat(null) }}>
              <div className="cat-icon"><i className={'ti ' + (c.icon || 'ti-question-mark')} /></div>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>

        {selectedCat && (catList.find(c => c.id === selectedCat)?.subcats?.length > 0) && (
          <>
            <label className="field-label">Subcategoria</label>
            <div className="category-scroll">
              {catList.find(c => c.id === selectedCat).subcats.map(sub => (
                <div key={sub.id} className={'cat-item' + (selectedSubcat === sub.id ? ' selected' : '')} onClick={() => setSelectedSubcat(sub.id)}>
                  <div className="cat-icon" style={{ fontSize: 14, width: 32, height: 32, borderRadius: 8 }}><i className="ti ti-corner-down-right" /></div>
                  <div className="cat-name">{sub.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <label className="field-label">Descrição</label>
        <input className="field-input" placeholder="Ex: Salário, Aluguel" value={desc} onChange={e => setDesc(e.target.value)} />

        {/* P2P Toggle */}
        <div className="p2p-toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className={'toggle-switch' + (p2pOn ? ' active' : '')} onClick={() => { setP2pOn(!p2pOn); setP2pUser(null); setP2pQuery(''); setP2pResults([]) }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
            {isSend ? 'Enviar para amigo' : 'Cobrar de amigo'}
          </span>
        </div>
        {p2pOn && (
          <div style={{ marginBottom: 12 }}>
            <input className="field-input" placeholder="@usuario" value={p2pQuery} onChange={e => handleP2pSearch(e.target.value)} autoComplete="off" />
            {p2pResults.length > 0 && p2pResults.map(u => (
              <div key={u.uid} className={'p2p-search-result' + (p2pUser?.uid === u.uid ? ' selected' : '')}
                onClick={() => setP2pUser({ uid: u.uid, name: u.name || '', username: u.username || '' })}>
                <div className="av">{(u.name || '?').charAt(0).toUpperCase()}</div>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.username}</div></div>
              </div>
            ))}
            {p2pUser && (
              <div className="p2p-search-result selected" style={{ marginTop: 6 }}>
                <div className="av" style={{ background: 'var(--primary)', color: '#fff' }}>{p2pUser.name.charAt(0).toUpperCase()}</div>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{p2pUser.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p2pUser.username}</div></div>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="filter-row" style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <button className={'filter-chip' + (status === 'efetivada' ? ' active' : '')} onClick={() => setStatus('efetivada')} style={{ fontSize: 11, padding: '5px 10px' }}>Efetivada</button>
          <button className={'filter-chip' + (status === 'prevista' ? ' active' : '')} onClick={() => setStatus('prevista')} style={{ fontSize: 11, padding: '5px 10px' }}>Prevista</button>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Confirmar</button>
      </div>
    </div>
  )
}

```

## src\pages\TransactionsPage.jsx
``$(@{True='jsx'}[src\pages\TransactionsPage.jsx.EndsWith('.jsx') -or src\pages\TransactionsPage.jsx.EndsWith('.js')])
import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function TransactionsPage({ onNavigate, onEditTransaction }) {
  const { transactions } = useData()
  const [filter, setFilter] = useState('all')
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthLabel = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const monthTxs = useMemo(() => {
    return transactions.filter(t => {
      const d = t.createdAt?.toDate?.()
      if (!d) return false
      return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear()
    })
  }, [transactions, targetDate])

  const filtered = filter === 'all' ? monthTxs : monthTxs.filter(t => t.type === filter)
  const groups = [...new Set(filtered.map(t => t.group || 'Geral'))]

  const income = monthTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expense = monthTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const balance = income - expense

  return (
    <div className="app page" id="transactions-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Extrato</span>
      </div>

      <div className="filter-row" id="filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card-bg)', borderRadius: 10, padding: '2px 6px' }}>
          <button className="icon-btn" onClick={() => setMonthOffset(m => m - 1)}><i className="ti ti-chevron-left" style={{ fontSize: 14 }} /></button>
          <span style={{ fontSize: 11, fontWeight: 700, minWidth: 100, textAlign: 'center', color: 'var(--text-main)' }}>{monthLabel}</span>
          <button className="icon-btn" onClick={() => setMonthOffset(m => m + 1)}><i className="ti ti-chevron-right" style={{ fontSize: 14 }} /></button>
        </div>
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>Todas</button>
        <button className={'filter-chip' + (filter === 'entrada' ? ' active' : '')} onClick={() => setFilter('entrada')}>Entradas</button>
        <button className={'filter-chip' + (filter === 'saída' ? ' active' : '')} onClick={() => setFilter('saída')}>Saídas</button>
        <button className="filter-chip" onClick={() => onNavigate('reports')} style={{ marginLeft: 'auto' }}><i className="ti ti-report" style={{ fontSize: 13 }}></i> Relatórios</button>
      </div>

      <div className="page-content" id="all-tx-list">
        {groups.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Nenhuma transação neste mês</p>
        ) : groups.map(g => (
          <div key={g}>
            <div className="tx-group-label">{g}</div>
            {filtered.filter(t => (t.group || 'Geral') === g).map(tx => (
              <div key={tx.id} className="tx-item" style={{ opacity: tx.status === 'prevista' ? 0.6 : 1 }} onClick={() => onEditTransaction(tx)}>
                <div className="tx-logo" style={{ background: tx.bg || 'var(--card-bg)', color: tx.color || 'var(--text-sec)' }}>
                  <i className={'ti ' + (tx.icon || 'ti-receipt')}></i>
                </div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name || 'Transação'}</div>
                  <div className="tx-date">{tx.date || (tx.status === 'prevista' ? 'Previsto' : 'Hoje')}</div>
                </div>
                <div className="tx-amount" style={{ color: tx.amount < 0 ? '#c0392b' : 'var(--primary)' }}>
                  {tx.amount < 0 ? '-' : '+'}R$ {formatBRL(Math.abs(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {monthTxs.length > 0 && (
          <div className="income-card" style={{ marginTop: 20, padding: 16 }}>
            <div className="section-label">Balanço do Mês</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>Receitas</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>R$ {formatBRL(income)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>Despesas</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#c0392b' }}>R$ {formatBRL(expense)}</span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Saldo</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: balance >= 0 ? 'var(--primary)' : '#c0392b' }}>R$ {formatBRL(balance)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

```

## src\pages\CardsPage.jsx
``$(@{True='jsx'}[src\pages\CardsPage.jsx.EndsWith('.jsx') -or src\pages\CardsPage.jsx.EndsWith('.js')])
import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function CardsPage({ onNavigate, onEditCard }) {
  const { cards, transactions, accounts } = useData()

  const cardSpending = useMemo(() => {
    const map = {}
    cards.forEach(c => { map[c.id] = 0 })
    transactions.forEach(t => {
      const acc = accounts.find(a => a.name === t.account || a.cardId === t.cat)
      if (!acc) return
      const card = cards.find(c => c.id === acc.cardId || c.name === acc.name)
      if (card && t.amount < 0) map[card.id] = (map[card.id] || 0) + Math.abs(t.amount)
    })
    return map
  }, [cards, transactions, accounts])

  const totalSpent = Object.values(cardSpending).reduce((s, v) => s + v, 0)

  return (
    <div className="app page" id="cards-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Cartões de Crédito</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" onClick={() => onEditCard(null)} title="Adicionar Cartão"><i className="ti ti-plus" /></button>
      </div>
      <div className="page-content">
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}><i className="ti ti-credit-card" /></div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nenhum cartão cadastrado</div>
            <div style={{ fontSize: 12, marginBottom: 20 }}>Adicione seus cartões de crédito para controlar gastos.</div>
            <button className="submit-btn" onClick={() => onEditCard(null)} style={{ width: 'auto', padding: '10px 24px' }}><i className="ti ti-plus" /> Adicionar</button>
          </div>
        ) : (
          <>
            <div className="card-carousel-wrapper" style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '4px 0 12px', scrollSnapType: 'x mandatory' }}>
              {cards.map(c => (
                <div key={c.id}
                  className="card-item"
                  style={{
                    background: `linear-gradient(135deg, ${c.color || '#1a7a4a'}, ${c.colorDark || '#2d5a43'})`,
                    minWidth: 240, padding: 18, borderRadius: 16, cursor: 'pointer', scrollSnapAlign: 'start',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onClick={() => onEditCard(c)}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 16 }}>{c.type || 'Visa'}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{c.number || '**** **** **** 0000'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 8, opacity: 0.6, textTransform: 'uppercase' }}>Titular</div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{(c.holder || '').toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{c.expiry || '00/00'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="income-card" style={{ padding: 16 }}>
              <div className="section-label">Resumo de Gastos</div>
              {cards.map(c => {
                const spent = cardSpending[c.id] || 0
                const pct = cards.reduce((s, cc) => s + (cardSpending[cc.id] || 0), 0) > 0
                  ? (spent / totalSpent) * 100 : 0
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || '#1a7a4a', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ fontWeight: 600 }}>{c.holder || c.type}</span>
                        <span style={{ fontWeight: 700 }}>R$ {formatBRL(spent)}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: pct + '%', height: '100%', background: c.color || '#1a7a4a', borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {cards.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>Nenhum gasto registrado</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

```

## src\pages\ProfilePage.jsx
``$(@{True='jsx'}[src\pages\ProfilePage.jsx.EndsWith('.jsx') -or src\pages\ProfilePage.jsx.EndsWith('.js')])
import { useData } from '../context/DataContext'

export default function ProfilePage({ onNavigate, onEditProfile, onToggleTheme, onSignOut }) {
  const { profile } = useData()
  const canChangeUsername = !profile.usernameChangedAt || (Date.now() - (profile.usernameChangedAt?.toDate?.()?.getTime() || 0)) > 90 * 24 * 60 * 60 * 1000
  const daysLeft = profile.usernameChangedAt ? Math.ceil(90 - (Date.now() - (profile.usernameChangedAt?.toDate?.()?.getTime() || 0)) / (24 * 60 * 60 * 1000)) : 0

  return (
    <div className="app page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Perfil</span>
      </div>
      <div className="page-content">
        <div className="profile-header" id="profile-header">
          <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => onEditProfile('avatar')}>
            {profile.photoURL ? <img src={profile.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (profile.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-name" id="profile-name">{profile.name || 'Usuário'}</div>
          <div className="profile-email" id="profile-email">{profile.email || ''}</div>
        </div>
        <div id="profile-fields">
          <div className="profile-field">
            <label>Nome</label>
            <div className="value">
              <span>{profile.name}</span>
              <button className="edit-btn" onClick={() => onEditProfile('name')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Sobrenome</label>
            <div className="value">
              <span>{profile.lastName || ''}</span>
              <button className="edit-btn" onClick={() => onEditProfile('lastName')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <div className="value">
              <span>{profile.email}</span>
              <button className="edit-btn" onClick={() => onEditProfile('email')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Usuário</label>
            <div className="value">
              <span>{profile.username}</span>
              <div>
                {canChangeUsername ? (
                  <button className="edit-btn" onClick={() => onEditProfile('username')}>Editar</button>
                ) : (
                  <span className="restriction">Altere em {daysLeft} dias</span>
                )}
              </div>
            </div>
          </div>
          <div className="profile-field">
            <label>Cidade</label>
            <div className="value">
              <span>{profile.cidade || 'Não definida'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('cidade')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Estado</label>
            <div className="value">
              <span>{profile.estado || 'Não definido'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('estado')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Fuso Horário</label>
            <div className="value">
              <span>{profile.fuso || 'America/Fortaleza'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('fuso')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Nascimento</label>
            <div className="value">
              <span>{profile.birthDate || 'Não definido'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('birthDate')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Peso (kg)</label>
            <div className="value">
              <span>{profile.weight || '-'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('weight')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Meta Água (ml)</label>
            <div className="value">
              <span>{profile.waterGoal || '3500'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('waterGoal')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Limite Cafeína (mg)</label>
            <div className="value">
              <span>{profile.cafGoal || '400'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('cafGoal')}>Editar</button>
            </div>
          </div>
        </div>
        <div className="menu-list">
          <div className="menu-item" onClick={onToggleTheme}>
            <i className="ti ti-moon"></i>
            <span>Modo Escuro</span>
            <div className="toggle-switch"></div>
          </div>
          <div className="menu-item" style={{ border: 'none' }} onClick={onSignOut}>
            <i className="ti ti-logout" style={{ color: '#c0392b' }}></i>
            <span style={{ color: '#c0392b' }}>Sair da Conta</span>
          </div>
        </div>
      </div>
    </div>
  )
}

```

## src\pages\ReportsPage.jsx
``$(@{True='jsx'}[src\pages\ReportsPage.jsx.EndsWith('.jsx') -or src\pages\ReportsPage.jsx.EndsWith('.js')])
import { useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL, formatCurrency } from '../utils/format'

export default function ReportsPage({ onNavigate, onNavigateGoals, onNavigateBudget }) {
  const { transactions, categories } = useData()
  const canvasRef = useRef(null)

  const totalIncome = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === 'saída').reduce((s, t) => s + Math.abs(t.amount || 0), 0)

  const catTotals = {}
  transactions.forEach(t => {
    const allCats = [...(categories.saída || []), ...(categories.entrada || [])]
    const cat = allCats.find(c => c.id === t.cat)
    if (!cat) return
    const key = cat.id
    if (!catTotals[key]) catTotals[key] = { name: cat.name, icon: cat.icon, color: cat.color, total: 0, count: 0 }
    catTotals[key].total += Math.abs(t.amount || 0)
    catTotals[key].count += 1
  })
  const catEntries = Object.values(catTotals).sort((a, b) => b.total - a.total)
  const maxTotal = catEntries.length > 0 ? catEntries[0].total : 1

  const year = new Date().getFullYear()
  const monthly = {}
  for (let m = 0; m < 12; m++) monthly[m] = { income: 0, expense: 0 }
  transactions.forEach(t => {
    const d = t.createdAt ? t.createdAt.toDate() : new Date()
    if (d.getFullYear() !== year) return
    const m = d.getMonth()
    if (t.amount > 0) monthly[m].income += t.amount
    else monthly[m].expense += Math.abs(t.amount)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.parentElement.clientWidth || 320
    const h = 160
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const pad = { top: 16, bottom: 20, left: 4, right: 4 }
    const cw = w - pad.left - pad.right
    const ch = h - pad.top - pad.bottom

    const maxVal = Math.max(1, ...Object.values(monthly).map(m => Math.max(m.income, m.expense)))
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    const bodyStyle = getComputedStyle(document.body)
    const borderColor = bodyStyle.getPropertyValue('--border').trim() || '#eee'
    const textMuted = bodyStyle.getPropertyValue('--text-muted').trim() || '#999'
    const textMain = bodyStyle.getPropertyValue('--text-main').trim() || '#111'
    const colorIncome = bodyStyle.getPropertyValue('--primary').trim() || '#2ecc71'
    const colorExpense = '#c0392b'

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(w - pad.right, y)
      ctx.stroke()
      ctx.fillStyle = textMuted
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('R$' + Math.round(maxVal - (maxVal / 4) * i), pad.left - 2, y + 3)
    }

    ctx.fillStyle = textMuted
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    monthLabels.forEach((l, i) => ctx.fillText(l, pad.left + (cw / 11) * i, h - 4))

    function drawPoints(arr, color) {
      ctx.beginPath()
      arr.forEach((v, i) => {
        const x = pad.left + (cw / 11) * i
        const y = pad.top + ch - (v / maxVal) * ch
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.stroke()
      arr.forEach((v, i) => {
        const x = pad.left + (cw / 11) * i
        const y = pad.top + ch - (v / maxVal) * ch
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    }

    drawPoints(Object.values(monthly).map(m => m.income), colorIncome)
    drawPoints(Object.values(monthly).map(m => m.expense), colorExpense)

    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillStyle = colorIncome
    ctx.fillRect(w - 80, 4, 8, 8)
    ctx.fillStyle = textMain
    ctx.fillText('Receitas', w - 68, 12)
    ctx.fillStyle = colorExpense
    ctx.fillRect(w - 80, 18, 8, 8)
    ctx.fillStyle = textMain
    ctx.fillText('Despesas', w - 68, 26)
  }, [transactions])

  return (
    <div className="app page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Relatórios</span>
      </div>
      <div className="page-content">
        <div className="two-col" style={{ marginBottom: 16 }}>
          <div className="income-card">
            <div className="income-label">Receitas</div>
            <div className="income-amount" style={{ color: 'var(--primary)' }}>R$ {formatBRL(totalIncome)}</div>
          </div>
          <div className="income-card">
            <div className="income-label">Despesas</div>
            <div className="income-amount" style={{ color: '#c0392b' }}>R$ {formatBRL(totalExpense)}</div>
          </div>
        </div>
        <div className="annual-chart-wrap">
          <h4>Receitas vs Despesas · <span>{year}</span></h4>
          <canvas ref={canvasRef} id="annual-chart"></canvas>
        </div>
        <div className="section-row">
          <span className="section-label">Por categoria</span>
        </div>
        <div id="report-by-category">
          {catEntries.map(c => (
            <div key={c.name} className="report-cat-item">
              <div className="report-cat-icon" style={{ background: c.color + '22', color: c.color }}><i className={'ti ' + c.icon}></i></div>
              <div className="report-cat-info">
                <div className="report-cat-name">{c.name}</div>
                <div className="report-cat-count">{c.count} transação{c.count !== 1 ? 'ões' : ''}</div>
                <div className="report-cat-bar"><div className="report-cat-fill" style={{ width: ((c.total / maxTotal) * 100).toFixed(0) + '%', background: c.color }}></div></div>
              </div>
              <div className="report-cat-amount">R$ {formatBRL(c.total)}</div>
            </div>
          ))}
          {catEntries.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma transação</p>
          )}
        </div>
        <div className="section-title-new" style={{ marginTop: 16 }}><i className="ti ti-layers"></i> Ferramentas</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn side" style={{ flex: 1 }} onClick={onNavigateGoals}><i className="ti ti-target"></i> Metas</button>
          <button className="action-btn side" style={{ flex: 1 }} onClick={onNavigateBudget}><i className="ti ti-chart-pie"></i> Orçamento</button>
        </div>
      </div>
    </div>
  )
}

```

## src\pages\SettingsPage.jsx
``$(@{True='jsx'}[src\pages\SettingsPage.jsx.EndsWith('.jsx') -or src\pages\SettingsPage.jsx.EndsWith('.js')])
import { useState } from 'react'
import { doc, updateDoc, deleteDoc, collection, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useData } from '../context/DataContext'
import { useToast } from '../components/Toast'
import { formatBRL } from '../utils/format'

export default function SettingsPage({ onNavigate, onEditAccount, onEditCard, onToggleVehicleModule }) {
  const { accounts, cards, categories, modules, vehicle } = useData()
  const { showToast } = useToast()
  const [expAccordion, setExpAccordion] = useState(true)
  const [incAccordion, setIncAccordion] = useState(true)

  const handleAddCategory = async type => {
    const name = prompt(`Nome da nova categoria (${type === 'saída' ? 'Despesa' : 'Receita'}):`)
    if (!name) return
    const ref = await addDoc(collection(db, 'categories'), { name, type, icon: 'ti-category', color: '#888', isDefault: false })
    if (type === 'saída') await updateDoc(ref, { color: '#c0392b' })
    showToast('Categoria criada!')
  }

  const handleEditCategory = async c => {
    const name = prompt('Novo nome:', c.name)
    if (!name) return
    await updateDoc(doc(db, 'categories', c.id), { name })
    showToast('Renomeada!')
  }

  const handleDeleteCategory = async c => {
    if (!confirm(`Excluir categoria "${c.name}"?`)) return
    await deleteDoc(doc(db, 'categories', c.id))
    showToast('Excluída!')
  }

  const handleAddSubcat = async c => {
    const name = prompt('Nome da subcategoria:')
    if (!name) return
    const sub = { id: Date.now().toString(), name, icon: 'ti-corner-down-right' }
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayUnion(sub) })
    showToast('Subcategoria adicionada!')
  }

  const handleEditSubcat = async (c, sub) => {
    const name = prompt('Novo nome:', sub.name)
    if (!name) return
    const newSub = { ...sub, name }
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayRemove(sub) })
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayUnion(newSub) })
    showToast('Subcategoria renomeada!')
  }

  const handleDeleteSubcat = async (c, sub) => {
    if (!confirm(`Excluir subcategoria "${sub.name}"?`)) return
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayRemove(sub) })
    showToast('Subcategoria excluída!')
  }

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('profile')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Configurações</span>
      </div>
      <div className="page-content">
        <div className="section-title-new"><i className="ti ti-toggle-left"></i> Módulos</div>
        <div className="config-cat-item">
          <div className="cat-main" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><i className="ti ti-car"></i></div>
              <div>
                <div className="name" style={{ fontSize: 13 }}>Veículo</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Controle de abastecimento e manutenção</div>
              </div>
            </div>
            <div className={'toggle-switch' + (modules?.vehicleActive ? ' active' : '')} onClick={onToggleVehicleModule} style={{ flexShrink: 0 }}></div>
          </div>
        </div>

        <div className="section-title-new"><i className="ti ti-wallet"></i> Contas Bancárias</div>
        {accounts.length > 0 ? accounts.map(a => (
          <div key={a.id} className="config-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditAccount?.(a)}>
            <div className="ci-icon" style={{ background: (a.color || '#888') + '22', color: a.color || '#888' }}><i className="ti ti-wallet"></i></div>
            <div className="ci-info">
              <div className="ci-name">{a.name}</div>
              <div className="ci-sub">{a.type} · R$ {formatBRL(a.balance || 0)}</div>
            </div>
          </div>
        )) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 8 }}>Nenhuma conta</div>}

        <div className="section-title-new"><i className="ti ti-credit-card"></i> Cartões</div>
        {cards.length > 0 ? cards.map(c => (
          <div key={c.id} className="config-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditCard?.(c)}>
            <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className="ti ti-credit-card"></i></div>
            <div className="ci-info">
              <div className="ci-name">{c.name}</div>
              <div className="ci-sub">{c.brand || c.type}</div>
            </div>
          </div>
        )) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 8 }}>Nenhum cartão</div>}

        <div className="section-title-new"><i className="ti ti-category"></i> Categorias</div>

        <button className={'accordion-header' + (expAccordion ? ' open' : '')} onClick={() => setExpAccordion(!expAccordion)}>
          <i className="ti ti-minus-circle" style={{ color: '#c0392b' }} /> Despesas
          <span className="arrow"><i className="ti ti-chevron-down"></i></span>
        </button>
        <div className={'accordion-content' + (expAccordion ? ' open' : '')}>
          {(categories.saída || []).map(c => (
            <div key={c.id}>
              <div className="config-item-new">
                <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (c.icon || 'ti-category')}></i></div>
                <div className="ci-info">
                  <div className="ci-name">{c.name}{c.isDefault ? <span className="badge-default" style={{ fontSize: 8 }}>Padrão</span> : ''}</div>
                </div>
                <div className="ci-actions">
                  <button onClick={() => handleEditCategory(c)} title="Renomear"><i className="ti ti-edit"></i></button>
                  <button onClick={() => handleEditCategory(c)} title="Alterar ícone"><i className="ti ti-image"></i></button>
                  {!c.isDefault && <button className="del" onClick={() => handleDeleteCategory(c)} title="Excluir"><i className="ti ti-trash"></i></button>}
                  <button onClick={() => handleAddSubcat(c)} title="Adicionar subcategoria"><i className="ti ti-plus" style={{ fontSize: 15 }}></i></button>
                </div>
              </div>
              {(c.subcats || []).map(sub => (
                <div key={sub.id} className="config-item-new" style={{ marginLeft: 20, padding: '6px 10px' }}>
                  <div className="ci-icon" style={{ width: 24, height: 24, fontSize: 11, background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (sub.icon || 'ti-corner-down-right')}></i></div>
                  <div className="ci-info"><div className="ci-name" style={{ fontSize: 12 }}>{sub.name}</div></div>
                  <div className="ci-actions">
                    <button onClick={() => handleEditSubcat(c, sub)}><i className="ti ti-edit"></i></button>
                    <button className="del" onClick={() => handleDeleteSubcat(c, sub)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginTop: 6, fontSize: 13 }} onClick={() => handleAddCategory('saída')}><i className="ti ti-plus"></i> Nova Categoria</button>
        </div>

        <button className={'accordion-header' + (incAccordion ? ' open' : '')} onClick={() => setIncAccordion(!incAccordion)}>
          <i className="ti ti-plus-circle" style={{ color: 'var(--primary)' }} /> Receitas
          <span className="arrow"><i className="ti ti-chevron-down"></i></span>
        </button>
        <div className={'accordion-content' + (incAccordion ? ' open' : '')}>
          {(categories.entrada || []).map(c => (
            <div key={c.id}>
              <div className="config-item-new">
                <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (c.icon || 'ti-category')}></i></div>
                <div className="ci-info">
                  <div className="ci-name">{c.name}{c.isDefault ? <span className="badge-default" style={{ fontSize: 8 }}>Padrão</span> : ''}</div>
                </div>
                <div className="ci-actions">
                  <button onClick={() => handleEditCategory(c)} title="Renomear"><i className="ti ti-edit"></i></button>
                  <button onClick={() => handleEditCategory(c)} title="Alterar ícone"><i className="ti ti-image"></i></button>
                  {!c.isDefault && <button className="del" onClick={() => handleDeleteCategory(c)} title="Excluir"><i className="ti ti-trash"></i></button>}
                  <button onClick={() => handleAddSubcat(c)} title="Adicionar subcategoria"><i className="ti ti-plus" style={{ fontSize: 15 }}></i></button>
                </div>
              </div>
              {(c.subcats || []).map(sub => (
                <div key={sub.id} className="config-item-new" style={{ marginLeft: 20, padding: '6px 10px' }}>
                  <div className="ci-icon" style={{ width: 24, height: 24, fontSize: 11, background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (sub.icon || 'ti-corner-down-right')}></i></div>
                  <div className="ci-info"><div className="ci-name" style={{ fontSize: 12 }}>{sub.name}</div></div>
                  <div className="ci-actions">
                    <button onClick={() => handleEditSubcat(c, sub)}><i className="ti ti-edit"></i></button>
                    <button className="del" onClick={() => handleDeleteSubcat(c, sub)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginTop: 6, fontSize: 13 }} onClick={() => handleAddCategory('entrada')}><i className="ti ti-plus"></i> Nova Categoria</button>
        </div>
      </div>
    </div>
  )
}

```

## src\pages\BudgetPage.jsx
``$(@{True='jsx'}[src\pages\BudgetPage.jsx.EndsWith('.jsx') -or src\pages\BudgetPage.jsx.EndsWith('.js')])
import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function BudgetPage({ onNavigate, onEditBudgetLimit, onEditBudgetCat }) {
  const { budget, transactions, categories } = useData()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthSpent = useMemo(() => {
    return transactions.filter(t => {
      const d = t.createdAt ? t.createdAt.toDate() : null
      return d && t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).reduce((s, t) => s + Math.abs(t.amount), 0)
  }, [transactions, currentMonth, currentYear])

  const totalLimit = budget?.totalLimit || 0
  const pct = totalLimit > 0 ? Math.min((monthSpent / totalLimit) * 100, 100) : 0
  const barColor = pct > 90 ? '#c0392b' : pct > 70 ? '#e07a3a' : 'var(--primary)'
  const available = totalLimit - monthSpent

  const allCats = [...(categories.saída || []), ...(categories.entrada || [])]
  const budgetCats = budget?.cats || {}

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Orçamento</span>
        <div style={{ flex: 1 }}></div>
        <button className="icon-btn" onClick={onEditBudgetLimit} title="Limite Total"><i className="ti ti-settings"></i></button>
      </div>
      <div className="page-content">
        <div className="income-card">
          <div className="section-row">
            <span className="section-label">Limite Mensal Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>R$ {formatBRL(totalLimit)}</span>
          </div>
          <div className="progress-bar-new">
            <div className="progress-fill-new" style={{ width: pct + '%', background: barColor }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>Gasto: <strong>R$ {formatBRL(monthSpent)}</strong></span>
            <span>Disponível: <strong>R$ {formatBRL(available)}</strong></span>
          </div>
        </div>

        <div className="section-title-new"><i className="ti ti-category"></i> Por Categoria</div>

        {Object.keys(budgetCats).length > 0 ? Object.entries(budgetCats).map(([catId, lim]) => {
          const cat = allCats.find(c => c.id === catId)
          const spent = transactions.filter(t => {
            const d = t.createdAt ? t.createdAt.toDate() : null
            return d && t.cat === catId && t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear
          }).reduce((s, t) => s + Math.abs(t.amount), 0)
          const cp = lim > 0 ? Math.min((spent / lim) * 100, 100) : 0
          const col = cp > 90 ? '#c0392b' : cp > 70 ? '#e07a3a' : 'var(--primary)'
          return (
            <div key={catId} className="budget-item-new">
              <div className="budget-header-new">
                <span className="b-name"><i className={'ti ' + (cat?.icon || 'ti-category')} style={{ color: cat?.color || '#888', marginRight: 4 }}></i> {cat?.name || catId}</span>
                <span className="b-amt"><span className="spent">R$ {formatBRL(spent)}</span> / R$ {formatBRL(lim)}</span>
              </div>
              <div className="progress-bar-new"><div className="progress-fill-new" style={{ width: cp + '%', background: col }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>{cp.toFixed(0)}%</span>
                <button className="section-link" onClick={() => onEditBudgetCat?.(catId)}>Editar</button>
              </div>
            </div>
          )
        }) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>Nenhum orçamento por categoria</div>}

        <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', fontSize: 13 }} onClick={() => onEditBudgetCat?.(null)}><i className="ti ti-plus"></i> Adicionar Categoria</button>
      </div>
    </div>
  )
}

```

## src\pages\GoalsPage.jsx
``$(@{True='jsx'}[src\pages\GoalsPage.jsx.EndsWith('.jsx') -or src\pages\GoalsPage.jsx.EndsWith('.js')])
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function GoalsPage({ onNavigate, onEditGoal }) {
  const { goals } = useData()

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Metas de Economia</span>
        <div style={{ flex: 1 }}></div>
        <button className="icon-btn" onClick={() => onEditGoal?.(null)} title="Nova Meta"><i className="ti ti-plus"></i></button>
      </div>
      <div className="page-content">
        {goals.length > 0 ? goals.map(g => {
          const pct = g.target > 0 ? Math.min((g.saved || 0) / g.target * 100, 100) : 0
          return (
            <div key={g.id} className="goal-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditGoal?.(g)}>
              <div className="g-name">{g.name}</div>
              <div className="goal-progress-new">
                <div className="gp-bar"><div className="gp-fill" style={{ width: pct + '%' }}></div></div>
                <span className="gp-pct">{pct.toFixed(0)}%</span>
              </div>
              <div className="goal-values-new">R$ {formatBRL(g.saved || 0)} de R$ {formatBRL(g.target || 0)}</div>
            </div>
          )
        }) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhuma meta</div>}
      </div>
    </div>
  )
}

```

## src\pages\VehiclePage.jsx
``$(@{True='jsx'}[src\pages\VehiclePage.jsx.EndsWith('.jsx') -or src\pages\VehiclePage.jsx.EndsWith('.js')])
import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useData } from '../context/DataContext'
import { formatCurrency, formatBRL } from '../utils/format'

Chart.register(...registerables)

export default function VehiclePage({ onNavigate, onEditVehicle, onRefuel, onMaint, onRoute, onCalcTrip }) {
  const { vehicle, refuels, maintenances, routes, vehicleHistory, accounts } = useData()
  const [tab, setTab] = useState('resumo')

  const consumptionRef = useRef(null)
  const weeklyRef = useRef(null)
  const consumoChartRef = useRef(null)
  const gastosChartRef = useRef(null)
  const consumptionChart = useRef(null)
  const weeklyChart = useRef(null)
  const evoChart = useRef(null)
  const gastosChart = useRef(null)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  function calcOilHealth() {
    if (!vehicle || !vehicle.oilKm) return { pct: 100, color: 'var(--primary)' }
    const lastOil = maintenances.filter(m => m.oilFlag || m.type === 'oleo')
      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
    const lastKm = lastOil?.km || vehicle.oilKm
    const currentKm = refuels[0]?.km || 0
    const diff = currentKm - lastKm
    const ideal = vehicle.oilInterval || 10000
    const pct = Math.max(0, Math.min(100, 100 - (diff / ideal) * 100))
    return { pct: Math.round(pct), color: pct > 50 ? 'var(--primary)' : pct > 25 ? '#e07a3a' : '#c0392b' }
  }

  function calcConsumivelHealth(tipo) {
    const intervals = { oleo: vehicle?.oilInterval || 10000, corrente: vehicle?.correnteInterval || 20000, pneus: vehicle?.pneusInterval || 15000 }
    const ultima = maintenances.filter(m => m.type === tipo || m.oilFlag && tipo === 'oleo')
      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
    const ultimoKm = ultima?.km || vehicle?.[tipo === 'oleo' ? 'oilKm' : tipo === 'pneus' ? 'pneusKm' : 'correnteKm'] || 0
    const currentKm = refuels[0]?.km || 0
    const diff = currentKm - ultimoKm
    const ideal = intervals[tipo] || 10000
    const pct = Math.max(0, Math.min(100, 100 - (diff / ideal) * 100))
    return { pct: Math.round(pct), color: pct > 50 ? 'var(--primary)' : pct > 25 ? '#e07a3a' : '#c0392b' }
  }

  function calcMedia() {
    if (vehicle?.consumo) return vehicle.consumo
    const fulls = refuels.filter(r => r.full)
    if (fulls.length < 2) return vehicle?.consumo || 0
    const last = fulls[0], prev = fulls[1]
    const kmDiff = last.km - prev.km
    if (kmDiff <= 0) return vehicle?.consumo || 0
    return kmDiff / (prev.liters || 1)
  }

  const health = {
    oleo: { label: 'Óleo', ...calcConsumivelHealth('oleo') },
    corrente: { label: 'Corrente/Relação', ...calcConsumivelHealth('corrente') },
    pneus: { label: 'Pneus', ...calcConsumivelHealth('pneus') },
  }

  const totalKm = refuels[0]?.km || 0
  const totalGasto = [...refuels, ...maintenances].reduce((s, i) => s + Math.abs(i.total ?? i.value ?? 0), 0)
  const media = calcMedia()
  const ultimoAbast = refuels[0]
  const lastOilMaint = maintenances.filter(m => m.oilFlag || m.type === 'oleo')
    .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
  const nextOilKm = lastOilMaint ? (lastOilMaint.km || 0) + (vehicle?.oilInterval || 10000) : (vehicle?.oilKm || 0) + (vehicle?.oilInterval || 10000)

  const gastoRefuelMensal = refuels.filter(r => {
    const d = r.createdAt?.toDate?.()
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, r) => s + Math.abs(r.total || 0), 0)
  const gastoMaintMensal = maintenances.filter(m => {
    const d = m.createdAt?.toDate?.()
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, m) => s + Math.abs(m.value || 0), 0)
  const gastoMensal = gastoRefuelMensal + gastoMaintMensal

  const cpk = totalKm > 0 ? (refuels.reduce((s, r) => s + Math.abs(r.total || 0), 0) / totalKm) : 0

  const kmPorDia = Array(7).fill(0)
  routes.forEach(r => {
    const d = r.createdAt?.toDate?.()
    if (d) kmPorDia[d.getDay()] += r.distance || r.km || 0
  })
  const diasComRota = kmPorDia.filter(v => v > 0).length
  const mediaDiaria = diasComRota > 0 ? Math.round(routes.reduce((s, r) => s + (r.distance || r.km || 0), 0) / Math.max(1, diasComRota)) : 0
  const picoDia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][kmPorDia.indexOf(Math.max(...kmPorDia))]

  useEffect(() => {
    if (!vehicle || !consumptionRef.current || !weeklyRef.current) return
    if (consumptionChart.current) { consumptionChart.current.destroy(); consumptionChart.current = null }
    if (weeklyChart.current) { weeklyChart.current.destroy(); weeklyChart.current = null }

    const fulls = [...refuels].filter(r => r.full).reverse()
    if (fulls.length >= 2) {
      const labels = fulls.slice(1).map((_, i) => '#' + (i + 2))
      const data = []
      for (let i = 1; i < fulls.length; i++) {
        const kmDiff = fulls[i].km - fulls[i - 1].km
        const litros = fulls[i - 1].liters || 1
        data.push(kmDiff > 0 ? kmDiff / litros : 0)
      }
      consumptionChart.current = new Chart(consumptionRef.current, {
        type: 'line',
        data: { labels, datasets: [{ label: 'km/L', data, borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      })
    }

    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    weeklyChart.current = new Chart(weeklyRef.current, {
      type: 'bar',
      data: { labels: dias, datasets: [{ label: 'km', data: kmPorDia, backgroundColor: '#7C3AED' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    })

    return () => {
      if (consumptionChart.current) consumptionChart.current.destroy()
      if (weeklyChart.current) weeklyChart.current.destroy()
    }
  }, [vehicle, refuels, routes])

  useEffect(() => {
    if (tab !== 'relatorio') return
    if (evoChart.current) { evoChart.current.destroy(); evoChart.current = null }
    if (gastosChart.current) { gastosChart.current.destroy(); gastosChart.current = null }

    const fulls = [...refuels].filter(r => r.full).reverse()
    if (fulls.length >= 2 && consumoChartRef.current) {
      const labels = fulls.slice(1).map((_, i) => '#' + (i + 2))
      const data = []
      for (let i = 1; i < fulls.length; i++) {
        const kmDiff = fulls[i].km - fulls[i - 1].km
        const litros = fulls[i - 1].liters || 1
        data.push(kmDiff > 0 ? kmDiff / litros : 0)
      }
      evoChart.current = new Chart(consumoChartRef.current, {
        type: 'line',
        data: { labels, datasets: [{ label: 'km/L', data, borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      })
    }

    if (gastosChartRef.current) {
      const totalComb = refuels.reduce((s, r) => s + Math.abs(r.total || 0), 0)
      const totalMaint = maintenances.reduce((s, m) => s + Math.abs(m.value || 0), 0)
      gastosChart.current = new Chart(gastosChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Combustível', 'Manutenção'],
          datasets: [{ data: [totalComb, totalMaint], backgroundColor: ['#e07a3a', '#7C3AED'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      })
    }

    return () => {
      if (evoChart.current) evoChart.current.destroy()
      if (gastosChart.current) gastosChart.current.destroy()
    }
  }, [tab, refuels, maintenances])

  function getHistoryDate(t) {
    const d = t.createdAt?.toDate?.()
    if (!d) return ''
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatValue(v) {
    return Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  if (!vehicle) {
    return (
      <div className="app page" id="vehicle-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left" /></button>
          <span className="page-title">Veículo</span>
          <div style={{ flex: 1 }} />
        </div>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}><i className="ti ti-car" /></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Nenhum veículo cadastrado</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Adicione um veículo para começar a controlar abastecimentos, manutenções e rotas.</div>
          <button className="submit-btn" onClick={onEditVehicle}><i className="ti ti-plus" /> Adicionar Veículo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app page" id="vehicle-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left" /></button>
        <div>
          <div className="page-title">{vehicle.name || 'Veículo'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total: {totalKm.toLocaleString('pt-BR')} km</div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" onClick={onEditVehicle} title="Configurar Veículo"><i className="ti ti-settings" /></button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 18px', marginBottom: 8 }}>
        <button className={'filter-chip' + (tab === 'resumo' ? ' active' : '')} onClick={() => setTab('resumo')}>Resumo</button>
        <button className={'filter-chip' + (tab === 'relatorio' ? ' active' : '')} onClick={() => setTab('relatorio')}>Relatório</button>
      </div>

      <div className="page-content">
        {tab === 'resumo' && (
          <>
            <div className="income-card">
              <div className="section-label">Saúde do Veículo</div>
              <div className="v-health">
                {Object.entries(health).map(([key, h]) => (
                  <div key={key} className="v-health-item">
                    <span className="v-lbl">{h.label}</span>
                    <div className="v-bar">
                      <div className="v-fill" style={{ width: h.pct + '%', background: h.color }} />
                    </div>
                    <span className="v-pct" style={{ color: h.color }}>{h.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Média km/L</span>
                <div className="income-amount" style={{ color: '#e07a3a', fontSize: 16 }}>{media.toFixed(1)}</div>
              </div>
              <div className="income-card">
                <span className="income-label">Próx. Manutenção</span>
                <div className="income-amount" style={{ color: '#3b82f6', fontSize: 16 }}>{nextOilKm.toLocaleString('pt-BR')} km</div>
              </div>
            </div>

            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Total Gasto</span>
                <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>{formatCurrency(totalGasto)}</div>
              </div>
              <div className="income-card">
                <span className="income-label">KM Total</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{totalKm.toLocaleString('pt-BR')} <small style={{ fontSize: 12, fontWeight: 400 }}>km</small></div>
              </div>
              <div className="income-card">
                <span className="income-label">Consumo Médio</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{media.toFixed(1)} <small style={{ fontSize: 12, fontWeight: 400 }}>km/L</small></div>
              </div>
              <div className="income-card">
                <span className="income-label">Último Abastecimento</span>
                <div className="income-amount" style={{ color: 'var(--text-sec)', fontSize: 14 }}>
                  {ultimoAbast ? (ultimoAbast.createdAt?.toDate?.() || new Date()).toLocaleDateString('pt-BR') : '---'}
                </div>
              </div>
            </div>

            <div className="action-row" style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onRefuel}><i className="ti ti-gas-station" /> <span style={{ fontSize: 10 }}>Abastecer</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onMaint}><i className="ti ti-tool" /> <span style={{ fontSize: 10 }}>Manutenção</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onRoute}><i className="ti ti-map-2" /> <span style={{ fontSize: 10 }}>Rota</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onCalcTrip}><i className="ti ti-map-pin" /> <span style={{ fontSize: 10 }}>Viajar</span></button>
            </div>

            {routes.length > 0 && (
              <div className="income-card">
                <div className="section-row">
                  <span className="section-label">Inteligência de Rodagem</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                  <span>Média Diária: <strong>{mediaDiaria} km/dia</strong></span>
                  <span>Pico: <strong>{picoDia}</strong></span>
                </div>
                <div className="chart-wrap-new" style={{ marginTop: 8 }}>
                  <canvas ref={weeklyRef} style={{ height: 120 }} />
                </div>
                <div className="income-card" style={{ marginTop: 8, padding: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="ti ti-calendar" style={{ color: '#7C3AED' }} />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#7C3AED' }}>Previsão de Manutenção</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Próxima troca de óleo estimada para: <span style={{ color: '#7C3AED' }}>~{nextOilKm.toLocaleString('pt-BR')} km</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="chart-wrap-new">
              <h4>Evolução do Consumo (km/L) · Meta: {vehicle.consumo || 29} km/L</h4>
              <div className="chart-canvas-box">
                <canvas ref={consumptionRef} />
              </div>
            </div>
          </>
        )}

        {tab === 'relatorio' && (
          <>
            <div className="section-title-new"><i className="ti ti-report" /> Relatório de Inteligência</div>
            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Média Real</span>
                <div className="income-amount" style={{ color: '#e07a3a', fontSize: 16 }}>{media.toFixed(1)} km/L</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Meta: {vehicle.consumo || 29} km/L</div>
              </div>
              <div className="income-card">
                <span className="income-label">Custo por KM</span>
                <div className="income-amount" style={{ color: '#3b82f6', fontSize: 16 }}>R$ {cpk.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>R$ por km</div>
              </div>
              <div className="income-card">
                <span className="income-label">Próx. Troca Óleo</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{nextOilKm.toLocaleString('pt-BR')} km</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>km restantes</div>
              </div>
              <div className="income-card">
                <span className="income-label">Gasto Mensal</span>
                <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>R$ {formatCurrency(gastoMensal)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Combustível + Manutenção</div>
              </div>
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Evolução do Consumo (km/L)</span>
              <div className="chart-canvas-box" style={{ height: 100 }}>
                <canvas ref={consumoChartRef} />
              </div>
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Saúde dos Consumíveis</span>
              {Object.entries(health).map(([key, h]) => (
                <div key={key} style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-sec)' }}>{h.label}</span>
                    <span style={{ fontWeight: 700, color: h.color }}>{h.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: h.pct + '%', height: '100%', background: h.color, borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Distribuição de Gastos</span>
              <div className="chart-canvas-box" style={{ height: 120 }}>
                <canvas ref={gastosChartRef} />
              </div>
            </div>
          </>
        )}

        <div className="section-title-new" style={{ marginTop: 16 }}><i className="ti ti-history" /> Histórico</div>
        <div id="v-timeline">
          {vehicleHistory.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: 8, fontSize: 13 }}>Nenhum registro</div>
          ) : (
            vehicleHistory.slice(0, 50).map(item => {
              const icons = { refuel: 'ti-gas-station', maintenance: 'ti-tool', route: 'ti-map-2' }
              const colors = { refuel: '#e07a3a', maintenance: '#c0392b', route: 'var(--primary)' }
              const titles = {
                refuel: 'Abastecimento',
                maintenance: 'Manutenção: ' + (item.desc || item.type || ''),
                route: 'Rota: ' + (item.origin || '') + ' → ' + (item.dest || '')
              }
              const isFin = item._type === 'refuel' || item._type === 'maintenance'
              return (
                <div key={item.id + '-' + item._type} className="v-hist-item">
                  <div className="v-hist-icon" style={{ background: colors[item._type] + '22', color: colors[item._type] }}>
                    <i className={'ti ' + (icons[item._type] || 'ti-car')} />
                  </div>
                  <div className="v-hist-info">
                    <div className="vh-t">{titles[item._type] || ''}</div>
                    <div className="vh-s">
                      {isFin ? 'R$ ' + formatValue(item.total ?? item.value ?? 0) + ' · ' : ''}
                      {item.km || ''} km · {getHistoryDate(item)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

```

## src\utils\format.js
``$(@{True='jsx'}[src\utils\format.js.EndsWith('.jsx') -or src\utils\format.js.EndsWith('.js')])
export function formatBRL(v) {
  if (v == null || isNaN(v)) return '0,00'
  const abs = Math.abs(v)
  return abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatCurrency(v) {
  const sign = v < 0 ? '-' : ''
  return sign + 'R$ ' + formatBRL(v)
}

```

