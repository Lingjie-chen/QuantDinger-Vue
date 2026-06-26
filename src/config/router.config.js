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
      // ── 核心交易 ──────────────────────────────
      // 1. AI资产分析（首页）
      {
        path: '/ai-asset-analysis',
        name: 'AIAssetAnalysis',
        component: () => import('@/views/ai-asset-analysis'),
        meta: { title: 'menu.dashboard.aiAssetAnalysis', keepAlive: true, icon: 'appstore', permission: ['dashboard'] },
      },
      // 2. 指标 IDE（图表 + 代码编辑 + 回测一体化）
      {
        path: '/indicator-ide',
        name: 'IndicatorIDE',
        component: () => import('@/views/indicator-ide'),
        meta: { title: 'menu.dashboard.indicatorIde', keepAlive: true, icon: 'code', permission: ['dashboard'] },
      },
      // 3. 策略与实盘（含策略管理 + 交易机器人）
      {
        path: '/strategy-live',
        name: 'StrategyLive',
        component: () => import('@/views/trading-assistant'),
        meta: {
          title: 'menu.dashboard.tradingAssistant',
          keepAlive: true,
          icon: 'deployment-unit',
          permission: ['dashboard'],
        },
      },
      // 4. 自主交易控制台 — 已合并到 /strategy-live，保留 redirect 兼容旧链接
      {
        path: '/autonomous-trading',
        name: 'AutonomousTrading',
        redirect: '/strategy-live?tab=strategy&agent=true',
        hidden: true,
        meta: {
          title: 'menu.dashboard.autonomousTrading',
          keepAlive: false,
          icon: 'cloud-server',
          permission: ['dashboard'],
        },
      },

      // ── 数据洞察 ──────────────────────────────
      // 5. 新闻情绪
      {
        path: '/news-sentiment',
        name: 'NewsSentiment',
        component: () => import('@/views/news-sentiment'),
        meta: { title: 'menu.dashboard.newsSentiment', keepAlive: false, icon: 'read', permission: ['dashboard'] },
      },
      // 8. 交易记录
      {
        path: '/trade-records',
        name: 'TradeRecords',
        component: () => import('@/views/trade-records'),
        meta: { title: 'menu.dashboard.tradeRecords', keepAlive: false, icon: 'file-text', permission: ['dashboard'] },
      },

      // ── 策略进化 ──────────────────────────────
      // 9. 策略进化引擎
      {
        path: '/evolution',
        name: 'Evolution',
        component: () => import('@/views/evolution'),
        meta: { title: 'menu.dashboard.evolution', keepAlive: false, icon: 'experiment', permission: ['dashboard'] },
      },

      // ── 账户 ──────────────────────────────────
      // 10. 券商账户
      {
        path: '/broker-accounts',
        name: 'BrokerAccounts',
        component: () => import('@/views/broker-accounts'),
        meta: { title: 'menu.dashboard.brokerAccounts', keepAlive: true, icon: 'bank', permission: ['dashboard'] },
      },
      // 11. 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile'),
        meta: { title: 'menu.myProfile', keepAlive: false, icon: 'user', permission: ['dashboard'] },
      },

      // ── 管理员 ────────────────────────────────
      // 12. 用户管理 (admin only)
      {
        path: '/user-manage',
        name: 'UserManage',
        component: () => import('@/views/user-manage'),
        meta: { title: 'menu.userManage', keepAlive: false, icon: 'team', permission: ['admin'] },
      },
      // 13. Agent Tokens (admin only)
      {
        path: '/agent-tokens',
        name: 'AgentTokens',
        component: () => import('@/views/agent-tokens'),
        meta: { title: 'menu.agentTokens', keepAlive: false, icon: 'api', permission: ['admin'] },
      },
      // 14. 系统设置 (admin only)
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/settings'),
        meta: { title: 'menu.settings', keepAlive: false, icon: 'setting', permission: ['admin'] },
      },

      // ── 隐藏路由（保留访问，不在侧边栏显示）────
      // trading-bot 已合并到 /strategy-live 的 bot tab
      {
        path: '/trading-bot',
        redirect: '/strategy-live',
        hidden: true,
      },
      // quant-workflow 已合并到 /autonomous-trading 的 workflow tab
      {
        path: '/quant-workflow',
        redirect: '/autonomous-trading',
        hidden: true,
      },
      {
        path: '/indicator-community',
        name: 'IndicatorCommunity',
        component: () => import('@/views/indicator-community'),
        hidden: true,
        meta: { title: 'menu.dashboard.community', keepAlive: false, icon: 'shop', permission: ['dashboard'] },
      },
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
      {
        path: '/factor-graph',
        name: 'FactorGraph',
        component: () => import('@/views/factor-graph'),
        hidden: true,
        meta: { title: 'menu.dashboard.factorGraph', keepAlive: false, icon: 'share-alt', permission: ['dashboard'] },
      },
      {
        path: '/risk-panel',
        name: 'RiskPanel',
        component: () => import('@/views/risk-panel'),
        hidden: true,
        meta: {
          title: 'menu.dashboard.riskPanel',
          keepAlive: false,
          icon: 'safety-certificate',
          permission: ['dashboard'],
        },
      },
      {
        path: '/performance',
        name: 'Performance',
        component: () => import('@/views/performance'),
        hidden: true,
        meta: { title: 'menu.dashboard.performance', keepAlive: false, icon: 'bar-chart', permission: ['dashboard'] },
      },
      {
        path: '/composite-indicators',
        name: 'CompositeIndicators',
        component: () => import('@/views/composite-indicators'),
        hidden: true,
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
        hidden: true,
        meta: { title: 'menu.dashboard.hotParams', keepAlive: false, icon: 'tool', permission: ['admin'] },
      },
      {
        path: '/scheduler',
        name: 'Scheduler',
        component: () => import('@/views/scheduler'),
        hidden: true,
        meta: { title: 'menu.dashboard.scheduler', keepAlive: false, icon: 'schedule', permission: ['admin'] },
      },
      {
        path: '/reconciliation',
        name: 'Reconciliation',
        component: () => import('@/views/reconciliation'),
        hidden: true,
        meta: { title: 'menu.dashboard.reconciliation', keepAlive: false, icon: 'audit', permission: ['admin'] },
      },
      {
        path: '/market-situation',
        name: 'MarketSituation',
        component: () => import('@/views/market-situation'),
        hidden: true,
        meta: { title: 'menu.dashboard.marketSituation', keepAlive: false, icon: 'compass', permission: ['dashboard'] },
      },
      {
        path: '/journal',
        name: 'Journal',
        component: () => import('@/views/journal'),
        hidden: true,
        meta: { title: 'menu.dashboard.journal', keepAlive: false, icon: 'edit', permission: ['dashboard'] },
      },
      {
        path: '/forex',
        name: 'Forex',
        component: () => import('@/views/forex'),
        hidden: true,
        meta: { title: 'menu.dashboard.forex', keepAlive: false, icon: 'dollar', permission: ['dashboard'] },
      },
      {
        path: '/a-stock',
        name: 'AStock',
        component: () => import('@/views/a-stock'),
        hidden: true,
        meta: { title: 'menu.dashboard.aStock', keepAlive: false, icon: 'stock', permission: ['dashboard'] },
      },
      {
        path: '/earn',
        name: 'Earn',
        component: () => import('@/views/earn'),
        hidden: true,
        meta: { title: 'menu.dashboard.earn', keepAlive: false, icon: 'fund', permission: ['dashboard'] },
      },
      {
        path: '/multi-market',
        name: 'MultiMarket',
        component: () => import('@/views/multi-market'),
        hidden: true,
        meta: { title: 'menu.dashboard.multiMarket', keepAlive: false, icon: 'global', permission: ['dashboard'] },
      },
      {
        path: '/strategy-library',
        name: 'StrategyLibrary',
        component: () => import('@/views/strategy-library'),
        hidden: true,
        meta: {
          title: 'menu.dashboard.strategyLibrary',
          keepAlive: false,
          icon: 'experiment',
          permission: ['dashboard'],
        },
      },
      {
        path: '/billing',
        name: 'Billing',
        component: () => import('@/views/billing'),
        hidden: true,
        meta: { title: 'menu.billing', keepAlive: false, icon: 'wallet', permission: ['dashboard'] },
      },

      // ── 旧路由兼容重定向 ──────────────────────
      {
        path: '/indicator-analysis',
        name: 'Indicator',
        redirect: '/indicator-ide',
        hidden: true,
        meta: { title: 'menu.dashboard.indicator', keepAlive: false, icon: 'line-chart', permission: ['dashboard'] },
      },
      {
        path: '/backtest-center',
        name: 'BacktestCenter',
        component: () => import('@/views/backtest-center/index.vue'),
        meta: {
          title: 'menu.dashboard.backtestCenter',
          keepAlive: false,
          icon: 'experiment',
          permission: ['dashboard'],
        },
      },
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
      {
        path: '/dashboard',
        name: 'Dashboard',
        redirect: '/trading-bot',
        hidden: true,
        meta: { title: 'menu.dashboard', keepAlive: false, icon: 'dashboard', permission: ['dashboard'] },
      },
      {
        path: '/ai-analysis/:pageNo([1-9]\\d*)?',
        name: 'Analysis',
        component: () => import('@/views/ai-analysis'),
        hidden: true,
        meta: { title: 'menu.dashboard.analysis', keepAlive: false, icon: 'thunderbolt', permission: ['dashboard'] },
      },
      {
        path: '/portfolio',
        name: 'Portfolio',
        component: () => import('@/views/portfolio'),
        hidden: true,
        meta: { title: 'menu.dashboard.portfolio', keepAlive: true, icon: 'fund', permission: ['dashboard'] },
      },
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
