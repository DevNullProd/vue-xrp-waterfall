# The XRP Transaction Waterfall
## A vue.js plugin

![](vue-xrp-waterfall2.gif)

Implements a visual rendering of [XRP network](https://xrpl.org) transactions via a 'code waterfall'. Transactions that are sent across the live network will be displayed here, each assigned a color corresponding to its type, and streamed vertically in the viewing area. Individual transactions are also rendered via a horizontal marquee anchored to the bottom of the container. Settings controlling the waterfall may be set using the gear icon in the upper right.

## Table of Contents

- [Installation](#Installation)
- [Setup](#Setup)
- [License](#License)
- [Contributing](#Contributing)

## Installation

Run the following to import vue-xrp-waterfall into an existing Vue.js project:

```bash
$ yarn add vue-xrp-waterfall
```

## Setup

Once installed, the transaction waterfall can be included simply by using & adding the component:

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
  /* Style container appropriately,
     set dimensions or full screen.
   */
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
```
See **example/** directory for demo application. Run with:

```
$ yarn example
```

## License

vue-xrp-waterfall is available under the **MIT license**.

## Contributing

Contributions are more than welcome! Just fork the repo and send a pull request.
