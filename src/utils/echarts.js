/**
 * Centralised ECharts entry — tree-shakeable, use-only-what-we-need.
 *
 * All app code should `import echarts from '@/utils/echarts'` instead of
 * `import * as echarts from 'echarts'` so the bundler can drop the ~700KB
 * of unused chart types/components.
 *
 * Usage in app files:
 *   line, bar, pie, scatter, radar           -> chart types
 *   tooltip, grid, legend, title             -> layout components
 *   axisPointer (axisPointer: {type:'shadow'}) -> AxisPointerComponent
 *   markLine / markPoint                     -> MarkLine/MarkPoint components
 *   echarts.graphic.LinearGradient           -> exposed by core
 *   CanvasRenderer                           -> required for `renderer: 'canvas'`
 */
import * as echarts from 'echarts/core'

import { LineChart, BarChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent,
  MarkLineComponent,
  MarkPointComponent,
  RadarComponent,
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  // charts
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  // components
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent,
  MarkLineComponent,
  MarkPointComponent,
  RadarComponent,
  // renderer
  CanvasRenderer,
])

export default echarts
export { echarts }
