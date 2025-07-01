<template>
  <div
    :class="cn(
      'w-full',
      content.customClass
    )"
    :style="content.customStyle"
  >
    <!-- Chart header -->
    <div v-if="content.title || content.description" class="mb-4">
      <h3 v-if="content.title" class="text-lg font-medium leading-none tracking-tight">
        {{ content.title }}
      </h3>
      <p v-if="content.description" class="text-sm text-muted-foreground mt-1">
        {{ content.description }}
      </p>
    </div>

    <!-- Chart container -->
    <div
      ref="chartContainer"
      :class="cn(
        'relative border rounded-lg p-4 bg-background',
        content.height === 'sm' ? 'h-48' : '',
        content.height === 'md' ? 'h-64' : '',
        content.height === 'lg' ? 'h-80' : '',
        content.height === 'xl' ? 'h-96' : '',
        !content.height ? 'h-64' : ''
      )"
    >
      <!-- Line Chart -->
      <svg
        v-if="content.type === 'line'"
        :width="chartWidth"
        :height="chartHeight"
        class="w-full h-full"
      >
        <!-- Grid lines -->
        <g v-if="content.showGrid !== false" class="opacity-10">
          <line
            v-for="i in gridLinesY"
            :key="`grid-y-${i}`"
            :x1="0"
            :y1="i * (chartHeight / gridLinesY)"
            :x2="chartWidth"
            :y2="i * (chartHeight / gridLinesY)"
            stroke="currentColor"
            stroke-width="1"
          />
          <line
            v-for="i in gridLinesX"
            :key="`grid-x-${i}`"
            :x1="i * (chartWidth / gridLinesX)"
            :y1="0"
            :x2="i * (chartWidth / gridLinesX)"
            :y2="chartHeight"
            stroke="currentColor"
            stroke-width="1"
          />
        </g>

        <!-- Line path -->
        <path
          v-for="(series, index) in processedData"
          :key="`line-${index}`"
          :d="getLinePath(series.data)"
          fill="none"
          :stroke="series.color || `hsl(${index * 60}, 70%, 50%)`"
          :stroke-width="content.strokeWidth || 2"
          class="transition-all duration-300"
        />

        <!-- Data points -->
        <g v-if="content.showPoints !== false">
          <circle
            v-for="(point, pointIndex) in getAllPoints()"
            :key="`point-${point.seriesIndex}-${pointIndex}`"
            :cx="point.x"
            :cy="point.y"
            :r="content.pointSize || 3"
            :fill="point.color"
            class="transition-all duration-300 hover:r-5"
            @mouseover="showTooltip(point, $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Bar Chart -->
      <svg
        v-else-if="content.type === 'bar'"
        :width="chartWidth"
        :height="chartHeight"
        class="w-full h-full"
      >
        <!-- Grid lines -->
        <g v-if="content.showGrid !== false" class="opacity-10">
          <line
            v-for="i in gridLinesY"
            :key="`grid-y-${i}`"
            :x1="0"
            :y1="i * (chartHeight / gridLinesY)"
            :x2="chartWidth"
            :y2="i * (chartHeight / gridLinesY)"
            stroke="currentColor"
            stroke-width="1"
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
            class="transition-all duration-300 hover:opacity-80"
            @mouseover="showTooltip(getBarPoint(point, seriesIndex), $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Area Chart -->
      <svg
        v-else-if="content.type === 'area'"
        :width="chartWidth"
        :height="chartHeight"
        class="w-full h-full"
      >
        <!-- Area fills -->
        <path
          v-for="(series, index) in processedData"
          :key="`area-${index}`"
          :d="getAreaPath(series.data)"
          :fill="`url(#gradient-${index})`"
          class="transition-all duration-300"
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
          :stroke-width="content.strokeWidth || 2"
        />
      </svg>

      <!-- Pie Chart -->
      <svg
        v-else-if="content.type === 'pie'"
        :width="chartWidth"
        :height="chartHeight"
        class="w-full h-full"
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      >
        <g :transform="`translate(${chartWidth / 2}, ${chartHeight / 2})`">
          <path
            v-for="(slice, index) in pieSlices"
            :key="`slice-${index}`"
            :d="slice.path"
            :fill="slice.color"
            class="transition-all duration-300 hover:opacity-80"
            @mouseover="showTooltip(slice, $event)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        ref="tooltipRef"
        :class="cn(
          'absolute z-10 px-2 py-1 text-xs bg-popover border rounded shadow-md pointer-events-none',
          'animate-in fade-in-0 zoom-in-95'
        )"
        :style="tooltipStyle"
      >
        <div class="font-medium">{{ tooltip.label }}</div>
        <div class="text-muted-foreground">{{ tooltip.value }}</div>
      </div>

      <!-- Loading state -->
      <div
        v-if="content.loading"
        class="absolute inset-0 flex items-center justify-center bg-background/80"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!content.loading && (!processedData || processedData.length === 0)"
        class="absolute inset-0 flex items-center justify-center text-muted-foreground"
      >
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p class="mt-2">{{ content.emptyText || 'No data available' }}</p>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="content.showLegend !== false && processedData && processedData.length > 1" class="mt-4 flex flex-wrap gap-4">
      <div
        v-for="(series, index) in processedData"
        :key="`legend-${index}`"
        class="flex items-center gap-2"
      >
        <div
          :class="cn('w-3 h-3 rounded-full')"
          :style="{ backgroundColor: series.color || `hsl(${index * 60}, 70%, 50%)` }"
        ></div>
        <span class="text-sm">{{ series.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: {
    content: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['data-point-click', 'data-point-hover'],
  setup(props, { emit }) {
    // Import utility function
    const cn = (...inputs) => {
      return inputs.filter(Boolean).join(' ')
    }

    const chartContainer = ref(null)
    const tooltipRef = ref(null)
    const chartWidth = ref(400)
    const chartHeight = ref(300)
    const tooltip = ref({
      visible: false,
      x: 0,
      y: 0,
      label: '',
      value: ''
    })

    const gridLinesX = 5
    const gridLinesY = 5

    const processedData = computed(() => {
      if (!props.content.data) return []
      
      return props.content.data.map((series, index) => ({
        ...series,
        color: series.color || `hsl(${index * 60}, 70%, 50%)`
      }))
    })

    const dataRange = computed(() => {
      if (!processedData.value.length) return { min: 0, max: 100 }
      
      const allValues = processedData.value.flatMap(series => 
        series.data.map(point => point.value)
      )
      
      return {
        min: Math.min(...allValues),
        max: Math.max(...allValues)
      }
    })

    const pieSlices = computed(() => {
      if (props.content.type !== 'pie' || !processedData.value.length) return []
      
      const data = processedData.value[0].data
      const total = data.reduce((sum, item) => sum + item.value, 0)
      const radius = Math.min(chartWidth.value, chartHeight.value) / 2 - 20
      
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
    })

    const tooltipStyle = computed(() => ({
      left: `${tooltip.value.x}px`,
      top: `${tooltip.value.y}px`
    }))

    const updateDimensions = () => {
      if (chartContainer.value) {
        const rect = chartContainer.value.getBoundingClientRect()
        chartWidth.value = rect.width - 32 // padding
        chartHeight.value = rect.height - 32 // padding
      }
    }

    const getLinePath = (data) => {
      if (!data.length) return ''
      
      const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * chartWidth.value
        const y = chartHeight.value - ((point.value - dataRange.value.min) / (dataRange.value.max - dataRange.value.min)) * chartHeight.value
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      
      return points.join(' ')
    }

    const getAreaPath = (data) => {
      if (!data.length) return ''
      
      const linePath = getLinePath(data)
      const lastX = ((data.length - 1) / (data.length - 1)) * chartWidth.value
      return `${linePath} L ${lastX} ${chartHeight.value} L 0 ${chartHeight.value} Z`
    }

    const getAllPoints = () => {
      const points = []
      processedData.value.forEach((series, seriesIndex) => {
        series.data.forEach((point, pointIndex) => {
          const x = (pointIndex / (series.data.length - 1)) * chartWidth.value
          const y = chartHeight.value - ((point.value - dataRange.value.min) / (dataRange.value.max - dataRange.value.min)) * chartHeight.value
          
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
    }

    const getBarX = (pointIndex, seriesIndex) => {
      const barWidth = chartWidth.value / processedData.value[0].data.length
      const groupWidth = barWidth / processedData.value.length
      return pointIndex * barWidth + seriesIndex * groupWidth
    }

    const getBarY = (value) => {
      return chartHeight.value - ((value - dataRange.value.min) / (dataRange.value.max - dataRange.value.min)) * chartHeight.value
    }

    const getBarWidth = () => {
      return (chartWidth.value / processedData.value[0].data.length) / processedData.value.length * 0.8
    }

    const getBarHeight = (value) => {
      return ((value - dataRange.value.min) / (dataRange.value.max - dataRange.value.min)) * chartHeight.value
    }

    const getBarPoint = (point, seriesIndex) => ({
      label: point.label,
      value: point.value,
      color: processedData.value[seriesIndex].color
    })

    const showTooltip = (point, event) => {
      tooltip.value = {
        visible: true,
        x: event.offsetX + 10,
        y: event.offsetY - 30,
        label: point.label,
        value: props.content.type === 'pie' ? 
          `${point.value} (${point.percentage}%)` : 
          point.value
      }
      
      emit('data-point-hover', { point })
    }

    const hideTooltip = () => {
      tooltip.value.visible = false
    }

    onMounted(() => {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateDimensions)
    })

    return {
      cn,
      chartContainer,
      tooltipRef,
      chartWidth,
      chartHeight,
      tooltip,
      tooltipStyle,
      processedData,
      pieSlices,
      gridLinesX,
      gridLinesY,
      getLinePath,
      getAreaPath,
      getAllPoints,
      getBarX,
      getBarY,
      getBarWidth,
      getBarHeight,
      getBarPoint,
      showTooltip,
      hideTooltip
    }
  }
}
</script>

<style>
/* Import global shadcn/ui styles */
@import './globals.css';
</style> 