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
          <button @click="navigateTo('/competitions')">Competitions</button>
          <button @click="navigateTo('/quiz')">Quiz</button>
        </div>
      </div>
      <button v-if="isAuthenticated" class="logout-btn" @click="handleLogout">
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
        <div v-if="designerImages.length">
          <img
            v-for="image in designerImages"
            :key="image.id"
            :src="image.url"
            alt="Designer upload"
            class="designer-image"
          />
        </div>
        <p v-else>This designer hasn't uploaded any images.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DesignersPage",
  data() {
    return {
      isAuthenticated: !!localStorage.getItem("token"),
      designers: [],
      showModal: false,
      selectedDesigner: null,
      designerImages: [],
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
        const response = await axios.get("http://localhost:3000/api/designers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.designers = response.data;
      } catch (error) {
        console.error("Error fetching designers:", error);
        alert("Failed to load designers.");
      }
    },
    async showDesignerImages(designer) {
      this.selectedDesigner = designer;

      console.log("Selected designer:", designer);

      if (!designer || !designer.id || isNaN(designer.id)) {
        console.error("Invalid designer ID:", designer?.id);
        alert("Invalid designer selected.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/images/${designer.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.length === 0) {
          console.warn("No images found for this designer.");
          alert("This designer has no uploaded images.");
          this.designerImages = [];
          return;
        }

        this.designerImages = response.data;
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
}

.designer-item h3 {
  font-size: 1.2em;
  color: #007bff;
}

.designer-item:hover {
  background-color: #f9f9f9;
  cursor: pointer;
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
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
}

.modal-content .close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.designer-image {
  max-width: 100%;
  margin: 10px 0;
  border-radius: 8px;
}
</style>
