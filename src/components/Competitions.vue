<template>
    <div class="competitions">
      <h1>Competitions</h1>
      <button v-if="isDesigner" @click="openAddCompetitionModal">Add Competition</button>
  
      <div v-if="isAddCompetitionModalOpen" class="modal" @click="closeAddCompetitionModal">
        <div class="modal-content" @click.stop>
          <h2>Add New Competition</h2>
          <form @submit.prevent="submitCompetition">
            <div class="form-group">
              <label for="competitionName">Name:</label>
              <input type="text" id="competitionName" v-model="newCompetition.name" required />
            </div>
  
            <div class="form-group">
              <label for="competitionDate">Date:</label>
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
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "CompetitionsPage",
    data() {
      return {
        isDesigner: false,
        isAddCompetitionModalOpen: false,
        newCompetition: {
          name: "",
          date: "",
          image: null, 
        },
      };
    },
    methods: {
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
            const response = await axios.post(
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
            console.log("Competition added successfully:", response.data);
            alert("Competition added successfully!");
            this.closeAddCompetitionModal();
        } catch (error) {
            console.error("Error adding competition:", error);
            alert("Failed to add competition. Please try again.");
        }
      },
    },
    created() {
      this.checkIfDesigner();
    },
  };
  </script>

<style scoped>
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
    width: 400px;
    }

    .form-group {
    margin-bottom: 15px;
    }

    label {
    display: block;
    margin-bottom: 5px;
    }

    input[type="text"],
    input[type="date"],
    input[type="file"] {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
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
</style>
    
