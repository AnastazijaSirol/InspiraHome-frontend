<template>
  <div class="profile-page">
    <div class="header-menu">
      <div v-if="isAuthenticated" class="header-dropdown">
        <button class="header-dropdown-btn">Menu</button>
        <div class="header-dropdown-content">
          <button @click="navigateTo('/')">Home</button>
          <button @click="navigateTo('/profile')">Profile</button>
          <button @click="navigateTo('/group-chats')">Group Chats</button>
          <button @click="navigateTo('/designers')">Designers</button>
          <button @click="navigateTo('/competitions')">Competitions</button>
          <button @click="navigateTo('/quiz')">Quiz</button>
        </div>
      </div>
      <button v-if="isAuthenticated" class="logout-btn" @click="handleLogout">Log Out</button>
    </div>
    <h1>Profile</h1>
    <div class="profile-field">
      <label>Username:</label>
      <input v-model="username" :disabled="!isEditing" />
      <div class="buttons">
        <button v-if="!isEditing" @click="enableEditing" class="edit">Edit</button>
        <button v-else @click="saveChanges" class="save">Save</button>
        <button v-if="isEditing" @click="cancelEditing" class="cancel">Cancel</button>
      </div>
    </div>
    <div class="profile-field">
      <label>Email:</label>
      <span>{{ email }}</span>
    </div>
    <div class="profile-field">
      <label>Designer:</label>
      <div class="designer-checkbox" :class="{ checked: isDesigner }" @click="toggleDesigner" v-if="!isDesigner">
        <span v-if="isDesigner">✔</span>
      </div>
      <span v-else>✔ (You are a Designer)</span>
    </div>
    <div class="liked-images">
      <h2>Liked Images</h2>
      <div v-if="likedImages.length === 0">No liked images found.</div>
      <div v-else class="images-container">
        <div v-for="image in likedImages" :key="image.imageUrl" class="image-item">
          <img :src="image.imageUrl" @click="openImage(image.imageUrl)" alt="Liked image" />
          <button @click="unlikeImage(image.id)" class="unlike-btn">Unlike</button>
        </div>
      </div>
      <div v-if="isImageModalOpen" class="modal" @click="closeModal">
        <img :src="currentImageUrl" class="modal-image" />
      </div>
    </div>
    
    <!-- History Section -->
    <div class="history-section">
      <h2>Search History</h2>
      <div v-if="history.length === 0">No search history found.</div>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>Style</th>
            <th>Room</th>
            <th>Color</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.dateTime">
            <td>{{ item.style }}</td>
            <td>{{ item.room }}</td>
            <td>{{ item.color }}</td>
            <td>{{ formatDate(item.dateTime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProfilePage',
  data() {
    return {
      username: '',
      email: '',
      isEditing: false,
      isDesigner: false,
      isAuthenticated: !!localStorage.getItem('token'),
      likedImages: [],
      isImageModalOpen: false,
      currentImageUrl: null,
      history: []  
    };
  },
  async created() {
    await this.fetchProfileData();
    await this.fetchLikedImages();
    await this.fetchSearchHistory(); 
  },
  methods: {
    async fetchProfileData() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.username = response.data.username;
        this.email = response.data.email;
        this.isDesigner = response.data.isDesigner;
      } catch (error) {
        console.error('Error fetching profile data:', error);
        alert('Failed to load profile data.');
      }
    },
    async fetchLikedImages() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/likes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.likedImages = response.data.map(like => ({
          id: like.id,
          imageUrl: like.imageUrl,
          likedAt: like.likedAt,
        }));
      } catch (error) {
        console.error('Error fetching liked images:', error);
        alert('Failed to load liked images.');
      }
    },
    async fetchSearchHistory() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.history = response.data.map(item => ({
          style: item.style,
          room: item.room,
          color: item.color,
          dateTime: item.dateTime,
        }));
      } catch (error) {
        console.error('Error fetching search history:', error);
        alert('Failed to load search history.');
      }
    },
    formatDate(dateTime) {
      const date = new Date(dateTime);
      return date.toLocaleString();
    },
    async unlikeImage(likeId) { 
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:3000/api/likes/${likeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.likedImages = this.likedImages.filter(image => image.id !== likeId);
        alert('Image unliked successfully.');
      } catch (error) {
        console.error('Error unliking image:', error);
        alert('Failed to unlike image.');
      }
    },
    enableEditing() {
      this.isEditing = true;
    },
    cancelEditing() {
      this.isEditing = false;
      this.fetchProfileData();
    },
    async saveChanges() {
      const token = localStorage.getItem('token');
      try {
        await axios.put(
          'http://localhost:3000/api/profile',
          { username: this.username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Username updated successfully!');
        this.isEditing = false;
      } catch (error) {
        console.error('Error updating username:', error);
        alert('Failed to update username.');
      }
    },
    async toggleDesigner() {
      if (!confirm('By becoming a Designer, your profile will be public and this action cannot be undone. Proceed?')) {
        return;
      }
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          'http://localhost:3000/api/profile/designer',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.isDesigner = true;
        alert('You are now a Designer!');
      } catch (error) {
        console.error('Error setting designer status:', error);
        alert('Failed to set designer status.');
      }
    },
    openImage(imageUrl) {
      this.currentImageUrl = imageUrl;
      this.isImageModalOpen = true;
    },
    closeModal() {
      this.isImageModalOpen = false;
      this.currentImageUrl = null;
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      alert('Logged out successfully!');
    },
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  font-size: 1.6em;
  color: #333;
  margin-bottom: 20px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

label {
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
  font-size: 0.9em;
}

input {
  width: 100%;
  max-width: 100%; 
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1em;
  box-sizing: border-box;
}

span {
  font-size: 1em;
  color: #666;
  padding: 10px 0;
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.buttons {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  font-size: 0.95em;
  cursor: pointer;
  max-width: 100%; 
}

button.edit {
  background-color: #007bff;
  color: #fff;
}

button.save {
  background-color: #28a745;
  color: #fff;
}

button.cancel {
  background-color: #6c757d;
  color: #fff;
}

button:hover {
  opacity: 0.9;
}

.designer-checkbox {
  width: 20px;
  height: 20px;
  background-color: #ccc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 3px;
  font-size: 16px;
  color: white;
}

.designer-checkbox.checked {
  background-color: #28a745;
}

.liked-images {
  margin-top: 30px;
  text-align: left;
}

.liked-images h2 {
  font-size: 1.4em;
  color: #333;
  margin-bottom: 10px;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
}

.images-container img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.unlike-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  font-size: 12px;
}

.unlike-btn:hover {
  background-color: #ff2e2f;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
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
  background-color: #FF4500;
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
}

.header-dropdown:hover .header-dropdown-content {
  display: block;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
}

</style>
