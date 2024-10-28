<template>
  <div>
    <h1>About Page</h1>
    <div v-if="images.length">
      <h2>Inspirational Images</h2>
      <div class="image-gallery">
        <div v-for="image in images" :key="image" class="image-item">
          <img :src="image" alt="Inspiration" />
        </div>
      </div>
    </div>
    <div v-else>
      <p>No images found based on your selection.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      images: [],
      selectedStyle: localStorage.getItem('selectedStyle'),
      selectedRoom: localStorage.getItem('selectedRoom'),
      selectedColor: localStorage.getItem('selectedColor'),
    };
  },
  mounted() {
    this.fetchImages();
  },
  methods: {
    async fetchImages() {
      try {
        const response = await fetch('http://localhost:3000/api/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            style: this.selectedStyle,
            room: this.selectedRoom,
            color: this.selectedColor,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.images = data.images.slice(0, 3); 
        } else {
          console.error('Failed to fetch images');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }
  }
};
</script>

<style>
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.image-item img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
