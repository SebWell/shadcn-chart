<template>
  <div
    :class="[
      'chart-root',
      customClass
    ]"
    :style="customStyle"
  >
    <!-- Chart header -->
    <div v-if="title || description" class="chart-header">
      <h3 v-if="title" class="chart-title">
        {{ title }}
      </h3>
      <p v-if="description" class="chart-description">
        {{ description }}
      </p>
    </div>

    <!-- Chart container -->
    <div
      ref="chartContainer"
      :class="[
        'chart-container',
        {
          'chart-container-sm': height === 'sm',
          'chart-container-md': height === 'md' || !height,
          'chart-container-lg': height === 'lg',
          'chart-container-xl': height === 'xl'
        }
      ]"
    >
      <!-- Line Chart -->
      <svg
        v-if="type === 'line'"
        :width="chartWidth"
        :height="chartHeight"
        class="chart-svg"
      >
        <!-- Grid lines -->
        <g v-if="showGrid !== false" class="chart-grid">
          <line
            v-for="i in gridLinesY"
            :key="`grid-y-${i}`"
            :x1="0"
            :y1="i * (chartHeight / gridLinesY)"
            :x2="chartWidth"
            :y2="i * (chartHeight / gridLinesY)"
            class="chart-grid-line"
          />
          <line
            v-for="i in gridLinesX"
            :key="`grid-x-${i}`"
            :x1="i * (chartWidth / gridLinesX)"
            :y1="0"
            :x2="i * (chartWidth / gridLinesX)"
            :y2="chartHeight"
            class="chart-grid-line"
          />
        </g>

        <!-- Line path -->
        <path
          v-for="(series, index) in processedData"
          :key="`line-${index}`"
          :d="getLinePath(series.data)"
          fill="none"
          :stroke="series.color || `hsl(${index * 60}, 70%, 50%)`"
          :stroke-width="strokeWidth || 2"
          class="chart-line"
        />

        <!-- Data points -->
        <g v-if="showPoints !== false">
          <circle
            v-for="(point, pointIndex) in getAllPoints()"
            :key="`point-${point.seriesIndex}-${pointIndex}`"
            :cx="point.x"
            :cy="point.y"
            :r="pointSize || 3"
            :fill="point.color"
            class="chart-point"
            @mouseover="showTooltip(point, $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Bar Chart -->
      <svg
        v-else-if="type === 'bar'"
        :width="chartWidth"
        :height="chartHeight"
        class="chart-svg"
      >
        <!-- Grid lines -->
        <g v-if="showGrid !== false" class="chart-grid">
          <line
            v-for="i in gridLinesY"
            :key="`grid-y-${i}`"
            :x1="0"
            :y1="i * (chartHeight / gridLinesY)"
            :x2="chartWidth"
            :y2="i * (chartHeight / gridLinesY)"
            class="chart-grid-line"
          />
        </g>

        <!-- Bars -->
        <g v-for="(series, seriesIndex) in processedData" :key="`series-${seriesIndex}`">
          <rect
            v-for="(point, pointIndex) in series.data"
            :key="`bar-${seriesIndex}-${pointIndex}`"
            :x="getBarX(pointIndex, seriesIndex)"
            :y="getBarY(point.value)"
            :width="getBarWidth()"
            :height="getBarHeight(point.value)"
            :fill="series.color || `hsl(${seriesIndex * 60}, 70%, 50%)`"
            class="chart-bar"
            @mouseover="showTooltip(getBarPoint(point, seriesIndex), $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Area Chart -->
      <svg
        v-else-if="type === 'area'"
        :width="chartWidth"
        :height="chartHeight"
        class="chart-svg"
      >
        <!-- Area fills -->
        <path
          v-for="(series, index) in processedData"
          :key="`area-${index}`"
          :d="getAreaPath(series.data)"
          :fill="`url(#gradient-${index})`"
          class="chart-area"
        />

        <!-- Gradients -->
        <defs>
          <linearGradient
            v-for="(series, index) in processedData"
            :key="`gradient-${index}`"
            :id="`gradient-${index}`"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              :stop-color="series.color || `hsl(${index * 60}, 70%, 50%)`"
              stop-opacity="0.3"
            />
            <stop
              offset="100%"
              :stop-color="series.color || `hsl(${index * 60}, 70%, 50%)`"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <!-- Area border lines -->
        <path
          v-for="(series, index) in processedData"
          :key="`area-line-${index}`"
          :d="getLinePath(series.data)"
          fill="none"
          :stroke="series.color || `hsl(${index * 60}, 70%, 50%)`"
          :stroke-width="strokeWidth || 2"
          class="chart-area-line"
        />
      </svg>

      <!-- Pie Chart -->
      <svg
        v-else-if="type === 'pie'"
        :width="chartWidth"
        :height="chartHeight"
        class="chart-svg"
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      >
        <g :transform="`translate(${chartWidth / 2}, ${chartHeight / 2})`">
          <path
            v-for="(slice, index) in pieSlices"
            :key="`slice-${index}`"
            :d="slice.path"
            :fill="slice.color"
            class="chart-pie-slice"
            @mouseover="showTooltip(slice, $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        ref="tooltipRef"
        class="chart-tooltip"
        :style="tooltipStyle"
      >
        <div class="chart-tooltip-label">{{ tooltip.label }}</div>
        <div class="chart-tooltip-value">{{ tooltip.value }}</div>
      </div>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="chart-loading"
      >
        <div class="chart-loading-spinner"></div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && (!processedData || processedData.length === 0)"
        class="chart-empty"
      >
        <div class="chart-empty-content">
          <svg class="chart-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p class="chart-empty-text">{{ emptyText || 'No data available' }}</p>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="showLegend !== false && processedData && processedData.length > 1" class="chart-legend">
      <div
        v-for="(series, index) in processedData"
        :key="`legend-${index}`"
        class="chart-legend-item"
      >
        <div
          class="chart-legend-color"
          :style="{ backgroundColor: series.color || `hsl(${index * 60}, 70%, 50%)` }"
        ></div>
        <span class="chart-legend-label">{{ series.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Individual props will be auto-generated based on the component type
    // This is a placeholder that will be manually refined per component
  },
  data() {
    return {
      chartWidth: 400,
      chartHeight: 300,
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        label: '',
        value: ''
      },
      gridLinesX: 5,
      gridLinesY: 5
    }
  },
  computed: {
    processedData() {
      if (!this.data) return []
      
      return this.data.map((series, index) => ({
        ...series,
        color: series.color || `hsl(${index * 60}, 70%, 50%)`
      }))
    },

    dataRange() {
      if (!this.processedData.length) return { min: 0, max: 100 }
      
      const allValues = this.processedData.flatMap(series => 
        series.data.map(point => point.value)
      )
      
      return {
        min: Math.min(...allValues),
        max: Math.max(...allValues)
      }
    },

    pieSlices() {
      if (this.type !== 'pie' || !this.processedData.length) return []
      
      const data = this.processedData[0].data
      const total = data.reduce((sum, item) => sum + item.value, 0)
      const radius = Math.min(this.chartWidth, this.chartHeight) / 2 - 20
      
      let currentAngle = -Math.PI / 2 // Start at top
      
      return data.map((item, index) => {
        const angle = (item.value / total) * 2 * Math.PI
        const x1 = Math.cos(currentAngle) * radius
        const y1 = Math.sin(currentAngle) * radius
        const x2 = Math.cos(currentAngle + angle) * radius
        const y2 = Math.sin(currentAngle + angle) * radius
        
        const largeArcFlag = angle > Math.PI ? 1 : 0
        
        const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
        
        const slice = {
          path,
          color: item.color || `hsl(${index * 60}, 70%, 50%)`,
          label: item.label,
          value: item.value,
          percentage: ((item.value / total) * 100).toFixed(1)
        }
        
        currentAngle += angle
        
        return slice
      })
    },

    tooltipStyle() {
      return {
        left: `${this.tooltip.x}px`,
        top: `${this.tooltip.y}px`
      }
    }
  },
  mounted() {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateDimensions)
  },
  methods: {

    updateDimensions() {
      if (this.$refs.chartContainer) {
        const rect = this.$refs.chartContainer.getBoundingClientRect()
        this.chartWidth = rect.width - 32 // padding
        this.chartHeight = rect.height - 32 // padding
      }
    },

    getLinePath(data) {
      if (!data.length) return ''
      
      const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * this.chartWidth
        const y = this.chartHeight - ((point.value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      
      return points.join(' ')
    },

    getAreaPath(data) {
      if (!data.length) return ''
      
      const linePath = this.getLinePath(data)
      const lastX = ((data.length - 1) / (data.length - 1)) * this.chartWidth
      return `${linePath} L ${lastX} ${this.chartHeight} L 0 ${this.chartHeight} Z`
    },

    getAllPoints() {
      const points = []
      this.processedData.forEach((series, seriesIndex) => {
        series.data.forEach((point, pointIndex) => {
          const x = (pointIndex / (series.data.length - 1)) * this.chartWidth
          const y = this.chartHeight - ((point.value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
          
          points.push({
            x,
            y,
            color: series.color,
            label: point.label,
            value: point.value,
            seriesIndex,
            pointIndex
          })
        })
      })
      return points
    },

    getBarX(pointIndex, seriesIndex) {
      const barWidth = this.chartWidth / this.processedData[0].data.length
      const groupWidth = barWidth / this.processedData.length
      return pointIndex * barWidth + seriesIndex * groupWidth
    },

    getBarY(value) {
      return this.chartHeight - ((value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
    },

    getBarWidth() {
      return (this.chartWidth / this.processedData[0].data.length) / this.processedData.length * 0.8
    },

    getBarHeight(value) {
      return ((value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
    },

    getBarPoint(point, seriesIndex) {
      return {
        label: point.label,
        value: point.value,
        color: this.processedData[seriesIndex].color
      }
    },

    showTooltip(point, event) {
      this.tooltip = {
        visible: true,
        x: event.offsetX + 10,
        y: event.offsetY - 30,
        label: point.label,
        value: this.type === 'pie' ? 
          `${point.value} (${point.percentage}%)` : 
          point.value
      }
      
      this.$emit('data-point-hover', { point })
    },

    hideTooltip() {
      this.tooltip.visible = false
    }
  }
}
</script>

<style scoped>
/* Shadcn UI CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --ring: 212.7 26.8% 83.9%;
}

/* Root container */
.chart-root {
  width: 100%;
}

/* Header */
.chart-header {
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.025em;
  color: hsl(var(--foreground));
}

.chart-description {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}

/* Container */
.chart-container {
  position: relative;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) + 2px);
  padding: 1rem;
  background-color: hsl(var(--background));
}

.chart-container-sm {
  height: 12rem; /* 192px */
}

.chart-container-md {
  height: 16rem; /* 256px */
}

.chart-container-lg {
  height: 20rem; /* 320px */
}

.chart-container-xl {
  height: 24rem; /* 384px */
}

/* SVG */
.chart-svg {
  width: 100%;
  height: 100%;
}

/* Grid */
.chart-grid {
  opacity: 0.1;
}

.chart-grid-line {
  stroke: currentColor;
  stroke-width: 1;
}

/* Line chart */
.chart-line {
  transition: all 0.3s ease;
}

.chart-point {
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-point:hover {
  r: 5;
}

/* Bar chart */
.chart-bar {
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
}

/* Area chart */
.chart-area {
  transition: all 0.3s ease;
}

.chart-area-line {
  transition: all 0.3s ease;
}

/* Pie chart */
.chart-pie-slice {
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-pie-slice:hover {
  opacity: 0.8;
}

/* Tooltip */
.chart-tooltip {
  position: absolute;
  z-index: 10;
  padding: 0.5rem;
  font-size: 0.75rem;
  background-color: hsl(var(--popover));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  pointer-events: none;
  animation: tooltip-fade-in 0.15s ease-out;
}

.chart-tooltip-label {
  font-weight: 500;
  color: hsl(var(--popover-foreground));
}

.chart-tooltip-value {
  color: hsl(var(--muted-foreground));
}

/* Loading */
.chart-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: hsl(var(--background) / 0.8);
}

.chart-loading-spinner {
  animation: spin 1s linear infinite;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  border-bottom: 2px solid hsl(var(--primary));
}

/* Empty state */
.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
}

.chart-empty-content {
  text-align: center;
}

.chart-empty-icon {
  margin: 0 auto;
  height: 3rem;
  width: 3rem;
  opacity: 0.5;
}

.chart-empty-text {
  margin-top: 0.5rem;
}

/* Legend */
.chart-legend {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-legend-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.chart-legend-label {
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

/* Animations */
@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 