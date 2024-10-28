<template>
  <div>
    <h1>About Page</h1>
    <div v-if="image">
      <h2>Inspirational Image</h2>
      <div class="image-gallery">
        <div class="image-item">
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
      image: null,
    };
  },
  mounted() {
    this.fetchImage();
  },
  methods: {
    async fetchImage() {
      try {
        const token = localStorage.getItem('token');
        console.log('Retrieved token:', token);

        const generateResponse = await fetch(`http://localhost:3000/api/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!generateResponse.ok) {
          const errorData = await generateResponse.json();
          console.error('Failed to generate image', errorData);
          return; 
        }

        const generateData = await generateResponse.json();
        this.image = generateData.image; 
        
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    },
  },
};
</script>

<style>
.image-gallery {
  display: flex;
  justify-content: center;
}

.image-item img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
