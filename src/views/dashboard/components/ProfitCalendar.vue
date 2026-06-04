<template>
  <div class="chart-card profit-calendar" :class="{ 'theme-dark': isDarkTheme }">
    <div class="chart-header">
      <div class="calendar-nav">
        <a-icon type="left" class="nav-btn" @click="prevMonth" />
        <span class="month-label">{{ currentMonthLabel }}</span>
        <a-icon type="right" class="nav-btn" @click="nextMonth" />
      </div>
    </div>
    <div class="calendar-body">
      <div class="weekday-row">
        <div class="weekday-cell" v-for="(w, i) in weekdays" :key="i">{{ w }}</div>
      </div>
      <div class="days-grid">
        <div
          class="day-cell empty-cell"
          v-for="n in firstDayOffset"
          :key="'empty-' + n"
        />
        <div
          v-for="(day, idx) in daysInMonth"
          :key="idx"
          :class="['day-cell', getDayCellClass(day)]"
          :title="getDayTitle(day)"
        >
          <div class="day-number">{{ day.day }}</div>
          <div v-if="hasProfit(day)" class="day-profit" v-text="getDayProfitText(day)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatProfitValue } from '../composables/dashboardData'

export default {
  name: 'ProfitCalendar',
  props: {
    calendarData: { type: Object, default: () => ({}) },
    isDarkTheme: { type: Boolean, default: false }
  },
  emits: ['update:calendarData'],
  data() {
    return {
      currentIndex: 0 // 0=this month, -1=last month, 1=next month
    }
  },
  computed: {
    calendarMonths() {
      return this.calendarData.months || []
    },
    currentMonth() {
      const idx = this.currentIndex
      if (idx >= 0 && idx < this.calendarMonths.length) {
        return this.calendarMonths[idx]
      }
      // Fallback: generate current month
      const now = new Date()
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        days: this.generateEmptyDays(now.getFullYear(), now.getMonth() + 1)
      }
    },
    currentMonthLabel() {
      const m = this.currentMonth
      if (!m) return ''
      return `${m.year}.${String(m.month).padStart(2, '0')}`
    },
    weekdays() {
      return ['一', '二', '三', '四', '五', '六', '日']
    },
    firstDayOfMonth() {
      // 0=Sun, 1=Mon ... 6=Sat. We want Mon=0 ... Sun=6
      const m = this.currentMonth
      const firstDay = new Date(m.year, m.month - 1, 1).getDay()
      return firstDay === 0 ? 6 : firstDay - 1
    },
    firstDayOffset() {
      return this.firstDayOfMonth
    },
    daysInMonth() {
      return this.currentMonth.days || []
    }
  },
  methods: {
    generateEmptyDays(year, month) {
      const count = new Date(year, month, 0).getDate()
      return Array.from({ length: count }, (_, i) => ({ day: i + 1 }))
    },
    prevMonth() {
      if (this.currentIndex > -2) {
        this.currentIndex--
      }
    },
    nextMonth() {
      if (this.currentIndex < 1) {
        this.currentIndex++
      }
    },
    hasProfit(day) {
      return day.pnl !== undefined || day.profit !== undefined || day.pnl_usdt !== undefined
    },
    getDayProfitValue(day) {
      return day.pnl ?? day.profit ?? day.pnl_usdt ?? 0
    },
    getDayProfitText(day) {
      if (!this.hasProfit(day)) return ''
      const { value } = formatProfitValue(this.getDayProfitValue(day))
      return value
    },
    getDayCellClass(day) {
      const classes = []
      if (!this.hasProfit(day)) return ''
      const profit = this.getDayProfitValue(day)
      if (profit > 0) classes.push('profit')
      else if (profit < 0) classes.push('loss')
      else classes.push('zero')
      return classes
    },
    getDayTitle(day) {
      if (!this.hasProfit(day)) return `${day.day}日`
      const profit = this.getDayProfitValue(day)
      return `${day.day}日 盈亏: ${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`
    }
  }
}
</script>

<style scoped lang="less">
.profit-calendar {
  .calendar-nav {
    display: flex;
    align-items: center;
    gap: 12px;

    .nav-btn {
      cursor: pointer;
      font-size: 14px;
      color: #8c8c8c;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      &:hover {
        color: #1890ff;
        background: #f0f0f0;
      }
    }

    .month-label {
      font-weight: 600;
      font-size: 14px;
      color: #262626;
      min-width: 80px;
      text-align: center;
    }
  }

  .calendar-body {
    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      margin-bottom: 4px;

      .weekday-cell {
        text-align: center;
        font-size: 11px;
        color: #8c8c8c;
        padding: 4px 0;
        font-weight: 500;
      }
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;

      .day-cell {
        text-align: center;
        padding: 6px 2px;
        border-radius: 4px;
        cursor: default;
        transition: background 0.2s;
        min-height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .day-number {
          font-size: 13px;
          font-weight: 500;
          color: #595959;
        }

        .day-profit {
          font-size: 10px;
          margin-top: 2px;
          font-weight: 600;
          white-space: nowrap;
        }

        &.empty-cell {
          cursor: default;
        }

        &.profit {
          background: #f6ffed;
          .day-profit { color: #52c41a; }
        }

        &.loss {
          background: #fff2f0;
          .day-profit { color: #ff4d4f; }
        }

        &.zero {
          background: #fafafa;
          .day-profit { color: #d9d9d9; }
        }

        &:hover:not(.empty-cell) {
          background: #e6f7ff;
        }
      }
    }
  }

  // dark theme
  &.theme-dark {
    .calendar-nav {
      .nav-btn:hover {
        color: #177ddc;
        background: #262626;
      }
      .month-label { color: #e6e6e6; }
    }

    .calendar-body {
      .days-grid .day-cell {
        .day-number { color: #a6a6a6; }

        &.profit {
          background: rgba(82, 196, 26, 0.15);
          .day-profit { color: #52c41a; }
        }
        &.loss {
          background: rgba(255, 77, 79, 0.15);
          .day-profit { color: #ff4d4f; }
        }
        &.zero {
          background: rgba(255, 255, 255, 0.04);
          .day-profit { color: #434343; }
        }
        &:hover:not(.empty-cell) {
          background: rgba(24, 144, 255, 0.1);
        }
      }
    }
  }
}
</style>
