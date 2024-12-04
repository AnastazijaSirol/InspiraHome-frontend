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
          <button @click="navigateTo('/competitions')">Competitions</button>
          <button @click="navigateTo('/quiz')">Quiz</button>
        </div>
      </div>
      <button v-if="isAuthenticated" class="logout-btn" @click="handleLogout">Log Out</button>
    </div>
    <div class="competitions">
      <h1>Competitions</h1>
      <button v-if="isDesigner" @click="openAddCompetitionModal">Add Competition</button>
      <h2>Participate in the competition by writing what you see in the picture.</h2>
      <div v-if="isAddCompetitionModalOpen" class="modal" @click="closeAddCompetitionModal">
        <div class="modal-content" @click.stop>
          <form @submit.prevent="submitCompetition">
            <div class="form-group">
              <label for="competitionName">Name:</label>
              <input type="text" id="competitionName" v-model="newCompetition.name" required />
            </div>
            <div class="form-group">
              <label for="competitionDate">End date:</label>
              <input type="date" id="competitionDate" v-model="newCompetition.date" required />
            </div>
            <div class="form-group">
              <label for="competitionImage">Image:</label>
              <input type="file" id="competitionImage" @change="handleImageUpload" accept="image/*" required />
            </div>
            <button type="submit" class="submit-btn">Submit</button>
            <button type="button" class="cancel-btn" @click="closeAddCompetitionModal">Cancel</button>
          </form>
        </div>
      </div>
      <div class="competition-list">
        <div v-for="competition in competitions" :key="competition.id" class="competition-box">
          <h3>{{ competition.name }}</h3>
          <p>Open until: {{ formatDate(competition.date) }}</p>
          <div class="image-container">
            <img v-if="competition.image" :src="'data:image/jpeg;base64,' + competition.image" alt="Competition Image" width="100" @click="openImageModal(competition.image)" />
          </div>
          <button v-if="isCompetitionOpen(competition.date)" class="join-btn" @click="openJoinModal(competition.id)"> Join competition </button>
          <button v-if="!isCompetitionOpen(competition.date) && isDesigner && !competition.winner" @click="openPickWinnerModal(competition)">
            Pick Winner
          </button>
          <div v-if="competition.winner">
            <h4>Winning description:</h4>
            <p>
              <strong>{{ competition.winner.User.username }}:</strong> {{ competition.winner.description }}
            </p>
          </div>
          <div v-else-if="competition.descriptions && competition.descriptions.length > 0">
            <p v-for="desc in competition.descriptions" :key="desc.id">
              <strong>{{ desc.User.username }}:</strong> {{ desc.description }}
            </p>
          </div>
          <p v-else>No descriptions yet.</p>
        </div>
      </div>
      <div v-if="isJoinModalOpen" class="modal" @click="closeJoinModal">
        <div class="modal-content" @click.stop>
          <form @submit.prevent="submitJoinCompetition">
            <div class="form-group">
              <label for="competitionDescription">Description:</label>
              <textarea id="competitionDescription" v-model="joinDescription" required></textarea>
            </div>
            <button type="submit" class="submit-btn">Submit</button>
            <button type="button" class="cancel-btn" @click="closeJoinModal">Cancel</button>
          </form>
        </div>
      </div>
      <div v-if="isPickWinnerModalOpen" class="modal" @click="closePickWinnerModal">
        <div class="modal-content" @click.stop>
          <h2>Select the Winner</h2>
          <div class="form-group" v-if="selectedCompetition">
            <label for="winnerDescription">Select Description:</label>
            <select id="winnerDescription" v-model="selectedDescription">
              <option v-for="desc in selectedCompetition.descriptions" :key="desc.id" :value="desc.id">
                {{ desc.User.username }}: {{ desc.description }}
              </option>
            </select>
          </div>
          <button @click="submitWinner">Submit</button>
          <button @click="closePickWinnerModal">Cancel</button>
        </div>
      </div>
      <div v-if="isImageModalOpen" class="image-modal" @click="closeImageModal">
        <div class="modal-content" @click.stop>
          <img :src="'data:image/jpeg;base64,' + selectedImage" alt="Competition Image" class="modal-image" />
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import axios from "axios";

export default {
  name: "CompetitionsPage",
  data() {
    return {
      isAuthenticated: false,
      isDesigner: false,
      isAddCompetitionModalOpen: false,
      isImageModalOpen: false,
      isJoinModalOpen: false,
      isPickWinnerModalOpen: false,
      selectedImage: null,
      joinDescription: "",
      competitionIdToJoin: null,
      selectedCompetition: null,
      selectedDescription: null,
      newCompetition: {
        name: "",
        date: "",
        image: null,
      },
      competitions: [],
    };
  },
  methods: {
    isCompetitionOpen(date) {
      const currentDate = new Date();
      const competitionDate = new Date(date);
      return competitionDate >= currentDate;
    },
    async checkIfDesigner() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("http://localhost:3000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.isDesigner = response.data.isDesigner || false;
      } catch (error) {
        console.error("Error checking designer status:", error);
      }
    },
    async fetchCompetitions() {
      try {
        const response = await axios.get("http://localhost:3000/api/competitions");
        const competitions = response.data;
        for (const competition of competitions) {
          competition.descriptions = await this.fetchDescriptions(competition.id);
          if (competition.winner) {
            competition.winner = await this.fetchWinnerDescription(competition.winner);
          }
        }
        this.competitions = competitions;
      } catch (error) {
        console.error("Error fetching competitions:", error);
      }
    },
    async fetchDescriptions(competitionId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/competitions/${competitionId}/descriptions`);
        return response.data;
      } catch (error) {
        console.error("Error fetching descriptions:", error);
        alert("Failed to load descriptions for the competition.");
        return [];
      }
    },
    async fetchWinnerDescription(winnerId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/descriptions/${winnerId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching winner description:", error);
        return null;
      }
    },
    openJoinModal(competitionId) {
      this.competitionIdToJoin = competitionId;
      this.isJoinModalOpen = true;
    },
    closeJoinModal() {
      this.isJoinModalOpen = false;
      this.joinDescription = "";
    },
    async submitJoinCompetition() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const data = {
          description: this.joinDescription,
        };
        console.log("Sending data:", data); 

        const response = await axios.post(
          `http://localhost:3000/api/competitions/${this.competitionIdToJoin}/join`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(response.data); 
        alert("You have successfully joined the competition!");
        this.fetchCompetitions();
        this.closeJoinModal();
      } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error("Error joining competition:", errorMessage);
        alert(`Failed to join the competition: ${errorMessage}`);
      }
    },

    openAddCompetitionModal() {
      this.isAddCompetitionModalOpen = true;
    },
    closeAddCompetitionModal() {
      this.isAddCompetitionModalOpen = false;
      this.newCompetition = { name: "", date: "", image: null };
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newCompetition.image = e.target.result.split(",")[1];
        };
        reader.readAsDataURL(file);
      }
    },
    async submitCompetition() {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:3000/api/competitions",
          {
            name: this.newCompetition.name,
            date: this.newCompetition.date,
            image: this.newCompetition.image,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Competition added successfully!");
        this.closeAddCompetitionModal();
        this.fetchCompetitions();
      } catch (error) {
        console.error("Error adding competition:", error);
        alert("Failed to add competition. Please try again.");
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    },
    openImageModal(image) {
      this.selectedImage = image;
      this.isImageModalOpen = true;
    },
    closeImageModal() {
      this.isImageModalOpen = false;
      this.selectedImage = null;
    },
    openPickWinnerModal(competition) {
      this.selectedCompetition = competition;
      this.isPickWinnerModalOpen = true;
    },
    closePickWinnerModal() {
      this.isPickWinnerModalOpen = false;
      this.selectedCompetition = null;
      this.selectedDescription = null;
    },
    async submitWinner() {
      if (this.selectedDescription) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(`http://localhost:3000/api/competitions/${this.selectedCompetition.id}/pick-winner`, {
            winner: this.selectedDescription
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert("Winner selected successfully!");
          this.closePickWinnerModal();
          this.fetchCompetitions(); 
        } catch (error) {
          console.error("Error selecting winner:", error);
          alert("Failed to select winner. Please try again.");
        }
      }
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    handleLogout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      alert("Logged out successfully!");
    },
  },
  created() {
    const token = localStorage.getItem("token");
    this.isAuthenticated = !!token;
    this.checkIfDesigner();
    this.fetchCompetitions();
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
    z-index: 1000;
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
    box-sizing: border-box;
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

  .header-dropdown-content button:hover {
    background-color: #333;
  }

  .header-dropdown:hover .header-dropdown-content {
    display: block;
  }

  .competitions {
    text-align: center;
    padding: 20px;
    color: white;
  }

  button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  .competition-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .competition-box {
    background-color: #f0f0f0;
    color: #333;
    margin: 15px;
    padding: 15px;
    border-radius: 8px;
    width: 250px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .competition-box h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .competition-box p {
    font-size: 14px;
    margin-bottom: 15px;
  }

  .image-container img {
    cursor: pointer;
    border-radius: 5px;
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
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
  }

  .modal-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .image-modal {
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

  .submit-btn {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .cancel-btn {
    background-color: #ccc;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
  }

  .submit-btn:hover {
    background-color: #0056b3;
  }

  .cancel-btn:hover {
    background-color: #999;
  }

  .join-btn {
    background-color: #28a745;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
  }

  .join-btn:hover {
    background-color: #218838;
  }
</style>
