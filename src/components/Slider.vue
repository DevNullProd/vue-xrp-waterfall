<template>
  <input type="range"
         v-bind:value="value"
         v-on:input="$emit('input', $event.target.value)"
         class="slider" />
</template>

<script>
export default {
  name: 'Slider',

  props : {
    // 0 = min, 100 = max
    value : Number
  }
}
</script>

<style scoped>
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: black;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: black;
  cursor: pointer;
}
</style>
