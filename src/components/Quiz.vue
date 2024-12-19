<template>
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
  <div class="quiz-container">
    <h1>Style Quiz</h1>
    <div v-if="existingStyle">
      <h2>Your Style is: {{ existingStyle }}</h2>
      <p>{{ styleDescriptions[existingStyle] }}</p>
    </div>
    <div v-else-if="currentQuestionIndex < questions.length">
      <h2>{{ questions[currentQuestionIndex].question }}</h2>
      <ul v-for="(answer, index) in questions[currentQuestionIndex].answers" 
          :key="index" 
          @click="selectAnswer(index)"
          class="answer-option">
        {{ answer }}
      </ul>
    </div>
    <div class="result" v-else>
      <h2>Your Style is: {{ resultStyle }}</h2>
      <p>{{ styleDescriptions[resultStyle] }}</p>
      <button @click="saveResult(resultStyle)">Save Result</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const VUE_APP_API_URL = process.env.VUE_APP_API_URL;
export default {
  name: "QuizPage",
  data() {
    return {
      isAuthenticated: !!localStorage.getItem("token"),
      currentQuestionIndex: 0,
      answers: [],
      existingStyle: null,
      questions: [
        {
          question: "What's your ideal living room decor?",
          answers: [
            "Sleek furniture with clean lines and neutral tones",
            "Functional and clutter-free with few statement pieces",
            "Elegant furniture and warm, earthy tones",
            "Colorful textiles, eclectic patterns, and plants",
            "Rich wood furniture and classic decor",
            "Light colors, simple furniture, and cozy textiles"
          ]
        },
        {
          question: "What kind of art would you hang on your walls?",
          answers: [
            "Abstract, bold designs",
            "Minimalistic black-and-white photography",
            "Vintage posters or oil paintings",
            "Bohemian macrame or handcrafted art",
            "Traditional family portraits or landscapes",
            "Scandinavian geometric patterns or nature photography"
          ]
        },
        {
          question: "What's your preferred type of lighting?",
          answers: [
            "Recessed or track lighting for a sleek look",
            "Simple and functional with a focus on natural light",
            "Chandeliers or antique lamps",
            "Fairy lights, lanterns, or candles",
            "Classic lamps with elegant shades",
            "Pendant lighting with clean, modern lines"
          ]
        },
        {
          question: "What's your dream sofa?",
          answers: [
            "A sleek leather sectional",
            "A compact, simple gray or beige sofa",
            "A tufted velvet sofa in deep tones",
            "A colorful or patterned fabric sofa",
            "A high-back, classic-style sofa",
            "A soft, neutral, overstuffed sofa"
          ]
        },
        {
          question: "Which accessory would you add to your space?",
          answers: [
            "Metallic accents or a glass coffee table",
            "A statement vase or bowl",
            "Vintage clocks or ornate mirrors",
            "Woven rugs, dreamcatchers, or hanging plants",
            "Porcelain figurines or traditional sculptures",
            "Cozy blankets and minimalistic planters"
          ]
        }
      ],
      styles: ["Modern", "Minimalistic", "Vintage", "Boho", "Traditional", "Scandinavian"],
      styleDescriptions: {
        Modern: "You love sleek, clean designs with neutral tones and cutting-edge furniture.",
        Minimalistic: "You prefer simple, functional spaces with clutter-free designs.",
        Vintage: "You enjoy elegant, timeless decor with a nostalgic flair.",
        Boho: "You thrive in eclectic, colorful spaces filled with art and plants.",
        Traditional: "You favor rich, classic decor that exudes warmth and elegance.",
        Scandinavian: "You love light, airy spaces with cozy textiles and functional furniture."
      }
    };
  },
  computed: {
    resultStyle() {
      if (this.existingStyle) {
        return this.existingStyle; 
      }
      const styleCounts = this.answers.reduce((acc, answer) => {
        acc[answer] = (acc[answer] || 0) + 1;
        return acc;
      }, {});
      const mostFrequent = Object.keys(styleCounts).reduce((a, b) =>
        styleCounts[a] > styleCounts[b] ? a : b
      );
      return this.styles[mostFrequent];
    }
  },
  methods: {
    async fetchQuizResult() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${VUE_APP_API_URL}/get-quiz-result`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.data.length > 0) {
          this.existingStyle = response.data[0].style; 
        }
      } catch (error) {
        console.error("Error fetching quiz result:", error);
        alert("Failed to fetch quiz result.");
      }
    },
    selectAnswer(answerIndex) {
      if (this.existingStyle) return; 
      this.answers.push(answerIndex);
      this.currentQuestionIndex++;
      
      if (this.currentQuestionIndex === this.questions.length) {
        this.saveResult(this.resultStyle);
      }
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    handleLogout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      alert("Logged out successfully!");
      this.$router.push("/");
    },
    async saveResult(style) {
      if (this.existingStyle) return; 
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${VUE_APP_API_URL}/save-quiz-result`,
          { style },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        alert("Quiz result saved successfully!");
      } catch (error) {
        console.error("Error saving quiz result:", error);
        alert("Failed to save quiz result.");
      }
    }
  },
  async created() {
    if (this.isAuthenticated) {
      await this.fetchQuizResult(); 
    }
  }
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

  .quiz-container {
    font-family: Arial, sans-serif;
    text-align: center;
    margin: 20px auto;
    max-width: 600px;
    color: white;
    font-size: 1.5rem;
  }

  h1 {
    font-size: 2.5rem;
    color: red;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #ffffff;
  }

  .answer-option {
    cursor: pointer;
    background-color: #1f1d1d;
    margin: 10px 0;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #ddd;
    transition: background-color 0.3s;
    color: white;
  }

  .answer-option:hover {
    background-color: #323030;
  }

  .result {
    color: white;
  }
</style>
