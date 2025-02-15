<template>
  <div>
    <div class="header-menu">
      <div v-if="isAuthenticated" class="header-dropdown">
        <button class="header-dropdown-btn">Menu</button>
        <div class="header-dropdown-content">
          <button @click="navigateTo('/')">Home</button>
          <button @click="navigateTo('/profile')">Profile</button>
          <button @click="navigateTo('/group-chats')">Group Chats</button>
          <button @click="navigateTo('/designers')">Designers</button>
          <button @click="navigateTo('/quiz')">Quiz</button>
        </div>
      </div>
      <button v-if="isAuthenticated" class="logout-btn" @click="handleLogout">Log Out</button>
    </div>

    <h1 class="white-text">Inspirations</h1>
    <div v-if="isLoading" class="loading">
      <p class="white-text">Generating your image, please wait...</p>
      <div class="spinner"></div>
    </div>
    <div v-else-if="image">
      <h2 class="white-text">Inspirational Image</h2>
      <p class="prompt-text">{{ prompt }}</p>
      <div class="image-gallery">
        <div class="image-item">
          <img :src="image" alt="Inspiration" />
        </div>
      </div>
      <div class="download-container">
        <button @click="downloadImage" class="download-button">
          <i class="download-icon"></i> Download Image
        </button>
        <button @click="shareImage" class="share-button">
          <i class="share-icon"></i> Share Image
        </button>
        <button v-if="isLiked" class="like-button liked" disabled>
          <i class="like-icon"></i> Liked
        </button>
        <button v-else class="like-button" @click="toggleLike">
          <i class="like-icon"></i> Like
        </button>
      </div>
    </div>
    <div v-else>
      <p class="white-text">No images found based on your selection.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const VUE_APP_API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'AboutPage',
  data() {
    return {
      image: null,
      prompt: '',
      isLoading: false,
      isAuthenticated: false,
      isLiked: false,
    };
  },
  mounted() {
    this.fetchImage();
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated = true;
    }
  },
  methods: {
    async fetchImage() {
      this.isLoading = true;
      this.isLiked = false;
      try {
        const token = localStorage.getItem('token');
        const generateResponse = await fetch(`${VUE_APP_API_URL}/images`, {
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
        this.prompt = generateData.prompt;

        await this.checkIfLiked(this.image);
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async checkIfLiked(imageUrl) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${VUE_APP_API_URL}/likes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            imageUrl,
          },
        });
        console.log(response);
        this.isLiked = response.data.liked;
      } catch (error) {
        console.error('Error checking if liked:', error);
      }
    },


    async downloadImage() {
      try {
        let imageUrl = this.image;
        if (imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }
        
        const response = await axios.get(imageUrl, { responseType: 'blob' });

        const url = URL.createObjectURL(new Blob([response.data]));
    
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inspiration.png');  
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download image:', error);
      }
    },

    shareImage() {
      if (this.image) {
        const subject = encodeURIComponent('Check out this inspirational image!');
        const body = encodeURIComponent('Here is an inspirational image I wanted to share with you: ') + this.image;

        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`;

        window.open(gmailLink, '_blank');
      } else {
        alert('No image to share!');
      }
    },

    handleLogout() {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      alert('Logged out successfully!');
      this.$router.push('/');
    },

    navigateTo(route) {
      this.$router.push(route);
    },

    async toggleLike() {
      const token = localStorage.getItem('token');
      const likePayload = {
        imageUrl: this.image,
      };

      try {
        const response = await axios.post(`${VUE_APP_API_URL}/likes`, likePayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          this.isLiked = true; 
        }
      } catch (error) {
        console.error('Error saving like:', error);
      }
    },
  },
};
</script>

<style>
.white-text {
  color: #f3f3f3;
  font-family: Arial, sans-serif;
  text-align: center;
}

.header-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 10px;
  position: absolute;
  top: 0;
  right: 0;
}

.logout-btn {
  padding: 10px 20px;
  background-color: #ff4500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-right: 20px;
}

.logout-btn:hover {
  background-color: #ff2e00;
}

.header-dropdown {
  position: relative;
  display: inline-block;
}

.header-dropdown-btn {
  background-color: #FFA500;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 10px 20px;
  box-sizing: border-box;
  width: 100%;
}

.header-dropdown-btn:hover {
  background-color: #ff8c00;
}

.header-dropdown-content {
  display: none;
  position: absolute;
  background-color: #333;
  color: white;
  min-width: 150px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.header-dropdown-content button {
  width: 100%;
  padding: 10px;
  color: white;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  box-sizing: border-box;
}

.header-dropdown:hover .header-dropdown-content {
  display: block;
}

.image-gallery {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.image-item img {
  max-width: 500px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.image-item img:hover {
  transform: scale(1.03);
}

.download-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.download-button {
  display: flex;
  align-items: center;
  background-color: #4a90e2;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s;
}

.download-button:hover {
  background-color: #3b7bbf;
  transform: translateY(-2px);
}

.download-button:active {
  background-color: #34689c;
  transform: translateY(0);
}

.download-icon {
  font-size: 18px;
  margin-right: 8px;
}

.share-button {
  display: flex;
  align-items: center;
  background-color: #28bc28;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s;
  margin-left: 10px; 
}

.share-button:hover {
  background-color: #26a926;
  transform: translateY(-2px);
}

.share-button:active {
  background-color: #26a926;
  transform: translateY(0);
}

.share-icon {
  font-size: 18px;
  margin-right: 8px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.spinner {
  border: 8px solid #f3f3f3; 
  border-top: 8px solid #3498db; 
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.prompt-text {
  color: #f3f3f3; 
  font-size: 1rem;
  margin: 10px 0;
  text-align: center;
  font-family: Arial, sans-serif;
}
.like-button {
  display: flex;
  align-items: center;
  background-color: #ff6b6b;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s;
  margin-left: 10px;
}

.like-button:hover {
  background-color: #ff4d4d;
  transform: translateY(-2px);
}

.like-button:active {
  background-color: #e60000;
  transform: translateY(0);
}

.like-icon {
  font-size: 18px;
  margin-right: 8px;
}

.liked {
  background-color: #d9534f;
}
</style>
