# The XRP Transaction Waterfall
## A vue.js plugin

[example gif]()

Implements a visual rendering of [XRP network](https://xrpl.org) transactions via a 'code waterfall'. Transactions that are sent across the live network will be displayed here, each assigned a color corresponding to its type, and streamed vertically in the viewing area. Individual transactions are also rendered via a horizontal marquee anchored to the bottom of the container. Settings controlling the waterfall may be set using the gear icon in the upper right.

## Table of Contents

- [Installation](#Installation)
- [Setup](#Setup)
- [License](#License)
- [Contributing](#Contributing)

## Installation

```bash
yarn add vue-xrp-waterfall
```

## Setup

```vue
<template>
  <div id="container">
    <XRPWaterfall />
  </div>
</template>

<script>
import XRPWaterfall from 'vue-xrp-waterfall'
Vue.use(XRPWaterfall)

export default {
}
</script>

<style scoped>
#container{
  /* style container appropriately */
}
</style>
```

## License

vue-xrp-waterfall is available under the MIT license.

## Contributing

Contributions are more than welcome! Just fork the repo and send a PR.
