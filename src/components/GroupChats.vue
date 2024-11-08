<template>
    <div class="group-chats-page">
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
  
      <h1>Group Chats</h1>
      <button @click="openNewGroupModal" class="group-chat-btn">Create New Group</button>

      <div class="group-list">
        <h2>Existing Groups</h2>
        <ul v-if="groupChats.length" class="group-chat-list">
          <li v-for="chat in groupChats" :key="chat.id" @click="openChat(chat)" class="chat-item">
            <h3>{{ chat.name }}</h3>
          </li>
        </ul>
        <p v-else>No group chats available.</p>
      </div>

      <div v-if="isNewGroupModalOpen" class="modal" @click="closeNewGroupModal">
        <div class="modal-content" @click.stop>
          <h2>Create New Group</h2>
          <input v-model="newGroupName" placeholder="Enter group name" />
          <button @click="createGroup">Create Group</button>
        </div>
      </div>

      <div v-if="isChatOpen" class="modal" @click="closeChat">
        <div class="modal-content" @click.stop>
          <h2>{{ activeChat.name }}</h2>
          <div class="chat-messages">
            <div v-for="msg in messages" :key="msg.id" class="chat-message">
                <strong>{{ msg['User.username'] }}:</strong> {{ msg.text }}
            </div>
          </div>
          <input v-model="newMessage" placeholder="Type your message" @keyup.enter="sendMessage" />
          <button @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'GroupChatsPage',
    data() {
      return {
        isAuthenticated: !!localStorage.getItem('token'),
        isNewGroupModalOpen: false,
        isChatOpen: false,
        groupChats: [],
        activeChat: null,
        newGroupName: '',
        messages: [],
        newMessage: ''
      };
    },
    async created() {
      await this.fetchGroupChats();
    },
    methods: {
      async fetchGroupChats() {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:3000/api/groups', {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.groupChats = response.data;
        } catch (error) {
          console.error('Error fetching group chats:', error);
          alert('Failed to load group chats.');
        }
      },

      openNewGroupModal() {
        this.isNewGroupModalOpen = true;
      },

      closeNewGroupModal() {
        this.isNewGroupModalOpen = false;
        this.newGroupName = '';
      },

      async createGroup() {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.post(
            'http://localhost:3000/api/groups',
            { name: this.newGroupName },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.groupChats.push(response.data);
          this.closeNewGroupModal();
        } catch (error) {
          console.error('Error creating group:', error);
          alert('Failed to create group.');
        }
      },

      async openChat(chat) {
        this.activeChat = chat;
        this.isChatOpen = true;
        await this.fetchMessages();
      },
  
      closeChat() {
        this.isChatOpen = false;
        this.messages = [];
        this.newMessage = '';
      },

      async fetchMessages() {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(
            `http://localhost:3000/api/groups/${this.activeChat.id}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.messages = response.data;
        } catch (error) {
          console.error('Error fetching messages:', error);
          alert('Failed to load messages.');
        }
      },

      async sendMessage() {
        const token = localStorage.getItem('token');
        if (this.newMessage.trim() === '') return;
        try {
          const response = await axios.post(
            `http://localhost:3000/api/groups/${this.activeChat.id}/messages`,
            { text: this.newMessage },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.messages.push(response.data);
          this.newMessage = '';
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message.');
        }
      },

      handleLogout() {
        localStorage.removeItem('token');
        this.isAuthenticated = false;
        alert('Logged out successfully!');
      },

      navigateTo(route) {
        this.$router.push(route);
      }
    }
  };
  </script>
  
  <style scoped>
  .group-chats-page {
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
  
  .group-chat-btn {
    background-color: #007bff;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
  }
  
  .group-chat-btn:hover {
    background-color: #0056b3;
  }
  
  .group-list {
    margin-top: 20px;
    text-align: left;
  }
  
  .group-chat-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .chat-item {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
  }
  
  .chat-item:hover {
    background-color: #f1f1f1;
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
  
  .modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-height: 80%;
    overflow-y: auto;
  }
  
  .chat-messages {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  
  .chat-message {
    padding: 5px 0;
  }
  
  .chat-message strong {
    color: #007bff;
  }
  </style>
  
