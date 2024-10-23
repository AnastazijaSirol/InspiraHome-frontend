<template>
  <div id="app">
    <div class="background-wrapper">
      <div
        class="background"
        v-for="(background, index) in backgrounds"
        :key="index"
        :style="{ backgroundImage: 'url(' + background + ')' }"
        :class="{ active: currentBackgroundIndex === index }"
      ></div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      backgrounds: [
        require('./assets/background1.jpeg'),
        require('./assets/background2.jpg'),
        require('./assets/background3.jpg'),
      ],
      currentBackgroundIndex: 0,
      intervalId: null,
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
    }, 3000);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
};
</script>

<style>
.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 2s ease-in-out;
  filter: blur(2px) brightness(0.7);
}

.background.active {
  opacity: 1;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
}
</style>
