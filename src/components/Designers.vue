<template>
  <div class="designers-page">
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
      <button
        v-if="isAuthenticated"
        class="logout-btn"
        @click="handleLogout"
      >
        Log Out
      </button>
    </div>

    <h1>Designers</h1>

    <div class="designers-list">
      <ul v-if="designers.length">
        <li
          v-for="designer in designers"
          :key="designer.id"
          class="designer-item"
          @click="showDesignerImages(designer)"
        >
          <h3>{{ designer.username }}</h3>
        </li>
      </ul>
      <p v-else>No designers found.</p>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>{{ selectedDesigner?.username }}'s Images</h2>
        <div v-if="designerImages.length" class="image-carousel">
          <button class="nav-btn left" @click="prevImage">&#8249;</button>
          <div class="image-container">
            <img
              :src="designerImages[currentImageIndex]?.url"
              alt="Designer upload"
              class="carousel-image"
            />
          </div>
          <button class="nav-btn right" @click="nextImage">&#8250;</button>
        </div>
        <p v-else>This designer hasn't uploaded any images.</p>

        <a 
          :href="generateEmailLink"
          target="_blank"
          class="email-btn"
        >
          Contact Designer
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const VUE_APP_API_URL = process.env.VUE_APP_API_URL;
export default {
  name: "DesignersPage",
  data() {
    return {
      isAuthenticated: !!localStorage.getItem("token"),
      designers: [],
      showModal: false,
      selectedDesigner: null,
      designerImages: [],
      currentImageIndex: 0,
      emailLink: "", 
    };
  },
  async created() {
    const token = localStorage.getItem("token");
    if (token) {
      this.isAuthenticated = true;
      await this.fetchDesigners(token);
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
    handleLogout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      alert("Logged out successfully!");
      this.$router.push("/");
    },
    async fetchDesigners(token) {
      try {
        const response = await axios.get(
          `${VUE_APP_API_URL}/designers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.designers = response.data;
      } catch (error) {
        console.error("Error fetching designers:", error);
        alert("Failed to load designers.");
      }
    },
    async showDesignerImages(designer) {
      this.selectedDesigner = designer;

      if (!designer || !designer.id || isNaN(designer.id)) {
        console.error("Invalid designer ID:", designer?.id);
        alert("Invalid designer selected.");
        return;
      }

      if (designer.email) {
        const subject = encodeURIComponent("Greetings!");
        this.emailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${designer.email}&su=${subject}`;
      } else {
        console.error("Designer email not available.");
        this.emailLink = ""; 
      }

      try {
        const response = await axios.get(
          `${VUE_APP_API_URL}/images/${designer.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.length === 0) {
          alert("This designer has no uploaded images.");
          this.designerImages = [];
          return;
        }

        this.designerImages = response.data;
        this.currentImageIndex = 0;
        this.showModal = true;
      } catch (error) {
        console.error("Error fetching designer images:", error);
        alert("Failed to load designer images.");
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedDesigner = null;
      this.designerImages = [];
      this.currentImageIndex = 0;
    },
    nextImage() {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.designerImages.length;
    },
    prevImage() {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.designerImages.length) %
        this.designerImages.length;
    },
  },
  computed: {
    generateEmailLink() {
      return this.emailLink;
    },
  },
};
</script>

<style scoped>
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
  background-color: #ffa500;
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
}

.header-dropdown:hover .header-dropdown-content {
  display: block;
}

.designers-page {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  font-size: 1.8em;
  color: #333;
  margin-bottom: 20px;
}

.designers-list {
  margin-top: 20px;
  text-align: left;
}

ul {
  list-style: none;
  padding: 0;
}

.designer-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

.designer-item h3 {
  font-size: 1.2em;
  color: #007bff;
}

.designer-item:hover {
  background-color: #f9f9f9;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  text-align: center;
  position: relative;
}

.modal-content .close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.image-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  max-width: 400px;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-image {
  width: 100%;
  object-fit: contain;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin: 0 10px;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: #0056b3;
}

.email-btn {
  display: inline-block;
  padding: 12px 25px;
  background-color: #ff4500;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.email-btn:hover {
  background-color: #ff2e00;
}

</style>
