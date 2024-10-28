<template>
  <div>
    <h1 class="white-text">Inspirations</h1>
    <div v-if="isLoading" class="loading">
      <p class="white-text">Generating your image, please wait...</p>
      <div class="spinner"></div>
    </div>
    <div v-else-if="image">
      <h2 class="white-text">Inspirational Image</h2>
      <div class="image-gallery">
        <div class="image-item">
          <img :src="image" alt="Inspiration" />
        </div>
      </div>
    </div>
    <div v-else>
      <p class="white-text">No images found based on your selection.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      image: null,
      isLoading: false, 
    };
  },
  mounted() {
    this.fetchImage();
  },
  methods: {
    async fetchImage() {
      this.isLoading = true; 
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
      } finally {
        this.isLoading = false; 
      }
    },
  },
};
</script>

<style>

.white-text {
  color: white;
}

.image-gallery {
  display: flex;
  justify-content: center;
}

.image-item img {
  max-width: 600px; 
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 8px solid #f3f3f3; 
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
