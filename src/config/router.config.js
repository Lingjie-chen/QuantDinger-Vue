// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/ai-asset-analysis',
    children: [
      // 1. AI资产分析（首页）
      // keepAlive: true so the heavy market-data fetches (sentiment / indices /
      // heatmap / calendar / opportunities / watchlist prices) only run on the
      // first visit. The component handles its own "data is stale" refresh in
      // `activated()`. Disabling this again will reintroduce a 1~3s cold start
      // every time the user navigates back here.
      {
        path: '/ai-asset-analysis',
        name: 'AIAssetAnalysis',
        component: () => import('@/views/ai-asset-analysis'),
        meta: { title: 'menu.dashboard.aiAssetAnalysis', keepAlive: true, icon: 'appstore', permission: ['dashboard'] },
      },
      // 2. 指标市场（浏览/购买指标，排在图表页之上）
      {
        path: '/indicator-community',
        name: 'IndicatorCommunity',
        component: () => import('@/views/indicator-community'),
        meta: { title: 'menu.dashboard.community', keepAlive: false, icon: 'shop', permission: ['dashboard'] },
      },
      // 3. 指标 IDE（图表 + 代码编辑 + 回测一体化）
      {
        path: '/indicator-ide',
        name: 'IndicatorIDE',
        component: () => import('@/views/indicator-ide'),
        meta: { title: 'menu.dashboard.indicatorIde', keepAlive: true, icon: 'code', permission: ['dashboard'] },
      },
      // 4. 策略与实盘（指标信号策略：创建 / 管理 / 与实盘联动；不含 Python 脚本策略）
      {
        path: '/strategy-live',
        name: 'StrategyLive',
        component: () => import('@/views/trading-assistant'),
        meta: {
          title: 'menu.dashboard.tradingAssistant',
          keepAlive: true,
          icon: 'deployment-unit',
          permission: ['dashboard'],
          indicatorSignalOnly: true,
        },
      },
      // Python 脚本策略 — kept reachable only via the "Clone as Script"
      // button on the Trading Bot detail page and via deep links like
      // `/strategy-script?strategy_id=...&mode=edit`. We re-hide it from
      // the sidebar so that:
      //   1. Casual users don't see two near-duplicate strategy entries
      //      (Trading Bot + Script Strategies) and get confused about
      //      which one to start with.
      //   2. Power users can still land on this page directly when they
      //      explicitly opt in via the clone flow on a bot they already
      //      own. The route + view stay, only its prominence drops.
      // If you're tempted to flip `hidden: true` back, please also re-check
      // the discoverability promise in `views/trading-bot/index.vue`.
      {
        path: '/strategy-script',
        name: 'StrategyScript',
        component: () => import('@/views/trading-assistant'),
        hidden: true,
        meta: {
          title: 'menu.dashboard.scriptStrategies',
          keepAlive: false,
          icon: 'code-sandbox',
          permission: ['dashboard'],
          scriptStrategiesOnly: true,
        },
      },
      {
        path: '/strategy-scripts',
        redirect: '/strategy-live',
        hidden: true,
      },
      // 5. 交易机器人（实盘运维监控）
      {
        path: '/trading-bot',
        name: 'TradingBot',
        component: () => import('@/views/trading-bot'),
        meta: { title: 'menu.dashboard.tradingBot', keepAlive: true, icon: 'robot', permission: ['dashboard'] },
      },
      {
        path: '/factor-graph',
        name: 'FactorGraph',
        component: () => import('@/views/factor-graph'),
        meta: { title: 'menu.dashboard.factorGraph', keepAlive: false, icon: 'share-alt', permission: ['dashboard'] },
      },
      // 6. 自主交易控制台（Agent 状态 + 持仓 + 决策日志）
      {
        path: '/autonomous-trading',
        name: 'AutonomousTrading',
        component: () => import('@/views/autonomous-trading'),
        meta: {
          title: 'menu.dashboard.autonomousTrading',
          keepAlive: false,
          icon: 'cloud-server',
          permission: ['dashboard'],
        },
      },
      // 7. 风控面板（熔断 + 告警 + 规则）
      {
        path: '/risk-panel',
        name: 'RiskPanel',
        component: () => import('@/views/risk-panel'),
        meta: {
          title: 'menu.dashboard.riskPanel',
          keepAlive: false,
          icon: 'safety-certificate',
          permission: ['dashboard'],
        },
      },
      // 8. 策略进化引擎（超参优化 + A/B 测试 + 沙盒）
      {
        path: '/evolution',
        name: 'Evolution',
        component: () => import('@/views/evolution'),
        meta: { title: 'menu.dashboard.evolution', keepAlive: false, icon: 'experiment', permission: ['dashboard'] },
      },
      // 9. 交易记录
      {
        path: '/trade-records',
        name: 'TradeRecords',
        component: () => import('@/views/trade-records'),
        meta: { title: 'menu.dashboard.tradeRecords', keepAlive: false, icon: 'file-text', permission: ['dashboard'] },
      },
      // 10. 量化工作流（5阶段管道）
      {
        path: '/quant-workflow',
        name: 'QuantWorkflow',
        component: () => import('@/views/quant-workflow'),
        meta: { title: 'menu.dashboard.quantWorkflow', keepAlive: false, icon: 'apartment', permission: ['dashboard'] },
      },
      // 11. 实盘券商账户（Alpaca / IBKR / MT5 统一连接 + 账户/持仓/挂单）
      // ---- 中优先级页面 ----
      {
        path: '/performance',
        name: 'Performance',
        component: () => import('@/views/performance'),
        meta: { title: 'menu.dashboard.performance', keepAlive: false, icon: 'bar-chart', permission: ['dashboard'] },
      },
      {
        path: '/composite-indicators',
        name: 'CompositeIndicators',
        component: () => import('@/views/composite-indicators'),
        meta: {
          title: 'menu.dashboard.compositeIndicators',
          keepAlive: false,
          icon: 'pie-chart',
          permission: ['dashboard'],
        },
      },
      {
        path: '/hot-params',
        name: 'HotParams',
        component: () => import('@/views/hot-params'),
        meta: { title: 'menu.dashboard.hotParams', keepAlive: false, icon: 'tool', permission: ['admin'] },
      },
      {
        path: '/scheduler',
        name: 'Scheduler',
        component: () => import('@/views/scheduler'),
        meta: { title: 'menu.dashboard.scheduler', keepAlive: false, icon: 'schedule', permission: ['admin'] },
      },
      {
        path: '/reconciliation',
        name: 'Reconciliation',
        component: () => import('@/views/reconciliation'),
        meta: { title: 'menu.dashboard.reconciliation', keepAlive: false, icon: 'audit', permission: ['admin'] },
      },
      {
        path: '/news-sentiment',
        name: 'NewsSentiment',
        component: () => import('@/views/news-sentiment'),
        meta: { title: 'menu.dashboard.newsSentiment', keepAlive: false, icon: 'read', permission: ['dashboard'] },
      },
      {
        path: '/market-situation',
        name: 'MarketSituation',
        component: () => import('@/views/market-situation'),
        meta: { title: 'menu.dashboard.marketSituation', keepAlive: false, icon: 'compass', permission: ['dashboard'] },
      },
      {
        path: '/journal',
        name: 'Journal',
        component: () => import('@/views/journal'),
        meta: { title: 'menu.dashboard.journal', keepAlive: false, icon: 'edit', permission: ['dashboard'] },
      },
      // 12. 实盘券商账户（Alpaca / IBKR / MT5 统一连接 + 账户/持仓/挂单）
      {
        path: '/broker-accounts',
        name: 'BrokerAccounts',
        component: () => import('@/views/broker-accounts'),
        meta: { title: 'menu.dashboard.brokerAccounts', keepAlive: true, icon: 'bank', permission: ['dashboard'] },
      },
      // 13. 外汇交易（MT5 Bridge）
      {
        path: '/forex',
        name: 'Forex',
        component: () => import('@/views/forex'),
        meta: { title: 'menu.dashboard.forex', keepAlive: false, icon: 'dollar', permission: ['dashboard'] },
      },
      // 14. A股市场
      {
        path: '/a-stock',
        name: 'AStock',
        component: () => import('@/views/a-stock'),
        meta: { title: 'menu.dashboard.aStock', keepAlive: false, icon: 'stock', permission: ['dashboard'] },
      },
      // 15. 理财产品（OKX Earn）
      {
        path: '/earn',
        name: 'Earn',
        component: () => import('@/views/earn'),
        meta: { title: 'menu.dashboard.earn', keepAlive: false, icon: 'fund', permission: ['dashboard'] },
      },
      // 16. 多市场
      {
        path: '/multi-market',
        name: 'MultiMarket',
        component: () => import('@/views/multi-market'),
        meta: { title: 'menu.dashboard.multiMarket', keepAlive: false, icon: 'global', permission: ['dashboard'] },
      },
      // 17. 策略库
      {
        path: '/strategy-library',
        name: 'StrategyLibrary',
        component: () => import('@/views/strategy-library'),
        meta: {
          title: 'menu.dashboard.strategyLibrary',
          keepAlive: false,
          icon: 'experiment',
          permission: ['dashboard'],
        },
      },
      // 旧路由兼容：图表与指标 → 指标 IDE
      {
        path: '/indicator-analysis',
        name: 'Indicator',
        redirect: '/indicator-ide',
        hidden: true,
        meta: { title: 'menu.dashboard.indicator', keepAlive: false, icon: 'line-chart', permission: ['dashboard'] },
      },
      // 旧路由兼容：回测中心 → 指标 IDE
      {
        path: '/backtest-center',
        name: 'BacktestCenter',
        redirect: '/indicator-ide',
        hidden: true,
        meta: {
          title: 'menu.dashboard.backtestCenter',
          keepAlive: false,
          icon: 'experiment',
          permission: ['dashboard'],
        },
      },
      // 旧路由兼容：交易助手 → 策略与实盘
      {
        path: '/trading-assistant',
        name: 'TradingAssistant',
        redirect: '/strategy-live',
        hidden: true,
        meta: {
          title: 'menu.dashboard.tradingAssistant',
          keepAlive: false,
          icon: 'deployment-unit',
          permission: ['dashboard'],
        },
      },
      // 原仪表盘路由保留兼容，重定向到交易助手
      {
        path: '/dashboard',
        name: 'Dashboard',
        redirect: '/trading-bot',
        hidden: true,
        meta: { title: 'menu.dashboard', keepAlive: false, icon: 'dashboard', permission: ['dashboard'] },
      },
      // AI 分析（隐藏）
      {
        path: '/ai-analysis/:pageNo([1-9]\\d*)?',
        name: 'Analysis',
        component: () => import('@/views/ai-analysis'),
        hidden: true,
        meta: { title: 'menu.dashboard.analysis', keepAlive: false, icon: 'thunderbolt', permission: ['dashboard'] },
      },
      // 资产监测（隐藏）
      {
        path: '/portfolio',
        name: 'Portfolio',
        component: () => import('@/views/portfolio'),
        hidden: true,
        meta: { title: 'menu.dashboard.portfolio', keepAlive: true, icon: 'fund', permission: ['dashboard'] },
      },
      // 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile'),
        meta: { title: 'menu.myProfile', keepAlive: false, icon: 'user', permission: ['dashboard'] },
      },
      // 会员/充值
      {
        path: '/billing',
        name: 'Billing',
        component: () => import('@/views/billing'),
        meta: { title: 'menu.billing', keepAlive: false, icon: 'wallet', permission: ['dashboard'] },
      },
      // 用户管理 (admin only)
      {
        path: '/user-manage',
        name: 'UserManage',
        component: () => import('@/views/user-manage'),
        meta: { title: 'menu.userManage', keepAlive: false, icon: 'team', permission: ['admin'] },
      },
      // Agent Tokens (admin only) — issue/revoke tokens for AI agents and view audit log
      {
        path: '/agent-tokens',
        name: 'AgentTokens',
        component: () => import('@/views/agent-tokens'),
        meta: { title: 'menu.agentTokens', keepAlive: false, icon: 'api', permission: ['admin'] },
      },
      // 系统设置 (admin only) - 放在最后
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/settings'),
        meta: { title: 'menu.settings', keepAlive: false, icon: 'setting', permission: ['admin'] },
      },

      // other
      /*
      {
        path: '/other',
        name: 'otherPage',
        component: PageView,
        meta: { title: '其他组件', icon: 'slack', permission: [ 'dashboard' ] },
        redirect: '/other/icon-selector',
        children: [
          {
            path: '/other/icon-selector',
            name: 'TestIconSelect',
            component: () => import('@/views/other/IconSelectorView'),
            meta: { title: 'IconSelector', icon: 'tool', keepAlive: true, permission: [ 'dashboard' ] }
          },
          {
            path: '/other/list',
            component: RouteView,
            meta: { title: '业务布局', icon: 'layout', permission: [ 'support' ] },
            redirect: '/other/list/tree-list',
            children: [
              {
                path: '/other/list/tree-list',
                name: 'TreeList',
                component: () => import('@/views/other/TreeList'),
                meta: { title: '树目录表格', keepAlive: true }
              },
              {
                path: '/other/list/edit-table',
                name: 'EditList',
                component: () => import('@/views/other/TableInnerEditList'),
                meta: { title: '内联编辑表格', keepAlive: true }
              },
              {
                path: '/other/list/user-list',
                name: 'UserList',
                component: () => import('@/views/other/UserList'),
                meta: { title: '用户列表', keepAlive: true }
              },
              {
                path: '/other/list/role-list',
                name: 'RoleList',
                component: () => import('@/views/other/RoleList'),
                meta: { title: '角色列表', keepAlive: true }
              },
              {
                path: '/other/list/system-role',
                name: 'SystemRole',
                component: () => import('@/views/role/RoleList'),
                meta: { title: '角色列表2', keepAlive: true }
              },
              {
                path: '/other/list/permission-list',
                name: 'PermissionList',
                component: () => import('@/views/other/PermissionList'),
                meta: { title: '权限列表', keepAlive: true }
              }
            ]
          }
        ]
      }
      */
    ],
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true,
  },
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login'),
      },
    ],
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  },
]
