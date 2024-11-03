<template>
    <div class="profile-page">
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
  box-sizing: border-box;
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
  box-sizing: border-box;
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
  transition: background-color 0.2s ease;
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

</style>
  
