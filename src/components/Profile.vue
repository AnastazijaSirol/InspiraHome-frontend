<template>
  <div class="profile-page">
    <div class="header-menu" v-if="isAuthenticated">
      <div class="header-dropdown">
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
      <button class="logout-btn" @click="handleLogout">Log Out</button>
    </div>

    <!-- Profil podaci -->
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
      isAuthenticated: !!localStorage.getItem('token')  // Proverava da li je korisnik prijavljen
    };
  },
  async created() {
    await this.fetchProfileData();
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
/* Stajling za stranicu profila */
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
}

label {
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
  font-size: 0.9em;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1em;
}

span {
  font-size: 1em;
  color: #666;
  padding: 10px 0;
  display: block;
  width: 100%;
}

.buttons {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  font-size: 0.95em;
  cursor: pointer;
}

button.edit { background-color: #007bff; color: #fff; }
button.save { background-color: #28a745; color: #fff; }
button.cancel { background-color: #6c757d; color: #fff; }
button:hover { opacity: 0.9; }

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
.designer-checkbox.checked { background-color: #28a745; }

/* Stajling za navigacijski meni */
.header-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 10px;
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
.logout-btn:hover { background-color: #ff2e00; }

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
  padding: 10px 20px;
}
.header-dropdown-content {
  display: none;
  position: absolute;
  background-color: #333;
  color: white;
  min-width: 150px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.header-dropdown-content button {
  width: 100%;
  padding: 10px;
  color: white;
  background-color: transparent;
  border: none;
  text-align: left;
}
.header-dropdown:hover .header-dropdown-content { 
  display: block; 
}
</style>
