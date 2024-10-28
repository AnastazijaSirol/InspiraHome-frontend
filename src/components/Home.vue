<template>
  <div id="app">
    <div class="content">
      <div class="header-menu">
        <div v-if="isAuthenticated" class="header-dropdown">
          <button class="header-dropdown-btn">Menu</button>
          <div class="header-dropdown-content">
            <a href="/">Home</a>
            <a href="/profile">Profile</a>
            <a href="/group-chats">Group Chats</a>
            <a href="/designers">Designers</a>
            <a href="/competitions">Competitions</a>
            <a href="/quiz">Quiz</a>
          </div>
        </div>
        <button v-if="isAuthenticated" class="logout-btn" @click="handleLogout">Log Out</button>
      </div>
      <h1 class="title">InspiraHome</h1>
      <h1>Let your creativity shine! Choose a style and get inspired.</h1>

      <div class="form-container">
        <div v-if="!isAuthenticated">
          <div v-if="isLogin" class="form">
            <h2>Login</h2>
            <form @submit.prevent="handleLogin">
              <input v-model="email" placeholder="Email" required />
              <input type="password" v-model="password" placeholder="Password" required />
              <button type="submit">Login</button>
              <span class="switch-text" @click="toggleForm">Switch to Sign Up</span>
            </form>
          </div>

          <div v-else class="form">
            <h2>Sign Up</h2>
            <form @submit.prevent="handleSignup">
              <input v-model="username" placeholder="Username" required />
              <input v-model="email" placeholder="Email" required />
              <input type="password" v-model="password" placeholder="Password" required />
              <button type="submit">Sign Up</button>
              <span class="switch-text" @click="toggleForm">Switch to Login</span>
            </form>
          </div>
        </div>

        <div v-if="isAuthenticated" class="dropdown-container">
          <h2>Find Your Inspiration</h2>

          <div class="dropdown">
            <label for="style">Choose a style:</label>
            <select id="style" v-model="selectedStyle">
              <option v-for="style in styleOptions" :key="style" :value="style">{{ style }}</option>
            </select>
          </div>

          <div class="dropdown">
            <label for="room">Choose a room:</label>
            <select id="room" v-model="selectedRoom">
              <option v-for="room in roomOptions" :key="room" :value="room">{{ room }}</option>
            </select>
          </div>

          <div class="dropdown">
            <label for="color">Choose a color:</label>
            <select id="color" v-model="selectedColor">
              <option v-for="color in colorOptions" :key="color" :value="color">{{ color }}</option>
            </select>
          </div>
          <button @click="confirmSelection" class="confirm-button">Confirm</button>
        </div>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { signup, login } from '../api';

export default {
  name: 'HomePage',
  data() {
    return {
      isLogin: true,
      isAuthenticated: false,
      username: '',
      email: '',
      password: '',
      styleOptions: ['Any', 'Modern', 'Minimalistic', 'Vintage', 'Boho', 'Scandinavian', 'Traditional'],
      roomOptions: ['Any room', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Hallway'],
      colorOptions: ['Any','Red', 'Blue', 'Green', 'Yellow', 'Beige', 'White', 'Black', 'Orange', 'Brown'],
      selectedStyle: '',
      selectedRoom: '',
      selectedColor: ''
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated = true;
    }
  },
  methods: {
    toggleForm() {
      this.isLogin = !this.isLogin;
    },
    async handleSignup() {
      try {
        await signup(this.username, this.email, this.password);
        alert('User registered successfully!');
        this.username = '';
        this.email = '';
        this.password = '';
        this.isAuthenticated = true;
      } catch (error) {
        console.error('Error during signup:', error.response.data);
        alert('Signup failed: ' + error.response.data);
      }
    },
    async handleLogin() {
      try {
        const response = await login(this.email, this.password);
        localStorage.setItem('token', response.token);
        alert('Login successful!');
        this.email = '';
        this.password = '';
        this.isAuthenticated = true;
      } catch (error) {
        console.error('Error during login:', error.response.data);
        alert('Login failed: ' + error.response.data);
      }
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      alert('Logged out successfully!');
    },
    async confirmSelection() {
    if (this.selectedStyle && this.selectedRoom && this.selectedColor) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save your selection.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,  
          },
          body: JSON.stringify({
            style: this.selectedStyle,
            room: this.selectedRoom,
            color: this.selectedColor,
          }),
        });

        if (response.ok) {
          alert('Selection saved!');
          this.$router.push('/about');
        } else {
          alert('Failed to save selection.');
        }
      } catch (error) {
        alert('Error saving selection.');
      }
    } else {
      alert('Please select a style, room, and color before confirming.');
    }
  }
  }
};
</script>

<style>
.content {
  position: relative;
  z-index: 1;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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
  padding: 10px 20px;
  background-color: #FFA500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.header-dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.header-dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.header-dropdown-content a:hover {
  background-color: #f1f1f1;
}

.header-dropdown:hover .header-dropdown-content {
  display: block;
}

.header-dropdown:hover .header-dropdown-btn {
  background-color: #ff8c00;
}

.title {
  font-size: 60px;
  color: #FFA500;
  text-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.7),
    4px 4px 0 rgba(0, 0, 0, 0.5),
    6px 6px 0 rgba(0, 0, 0, 0.3);
}

.form-container {
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 400px;
  margin-top: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 10px;
  border: none;
  border-radius: 4px;
  outline: none;
  margin-left: 10px;
}

button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #FFA500;
  color: white;
  cursor: pointer;
  margin-top: 20px;
  margin-right: 5px;
  margin-left: 10px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #ff8c00;
}

.switch-text {
  color: #FFA500;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 20px;
  transition: color 0.3s;
}

.switch-text:hover {
  color: #ff8c00;
}

.dropdown-container {
  margin-top: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: white;
}

.dropdown {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #FFA500;
}

select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: white;
  color: black;
  outline: none;
}

.confirm-button {
  padding: 10px;
  background-color: #32CD32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.confirm-button:hover {
  background-color: #28a428;
}
</style>
