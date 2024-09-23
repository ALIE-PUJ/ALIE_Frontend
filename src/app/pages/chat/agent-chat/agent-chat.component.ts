import { Component, HostListener, inject } from '@angular/core';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../services/chat/agent.service';  
import { Router } from '@angular/router';  

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './agent-chat.component.html',
  styleUrls: ['./agent-chat.component.scss'],
})
export class AgentChatComponent {

  private chatService = inject(AgentService);
  private router = inject(Router);  

  activeChatId: string = '';
  chats: any[] = [];
  message: string = '';
  hasBotResponded: boolean = false;
  showConfirmation: boolean = false;
  messageToThumbDown: any;

  auth_token: string = 'your_token_here';
  user_id: string = '1';  

  constructor() {
    this.listChats();
  }

  listChats() {
    const auth_token = this.auth_token;  
    const user_id = this.user_id; 
  
    this.chatService.listChatsByUser(user_id, auth_token).subscribe((chats: any[]) => {
      this.chats = chats.map(chat => ({
        memory_key: chat.memory_key,
        title: chat.nombre || 'Chat sin título',
        messages: [], 
        showOptions: false
      }));
    }, (error) => {
      console.error('Error al obtener los chats', error);
    });
  }
  
  

  // Método para agregar un nuevo chat
  addNewChat() {
    const payload = {
      auth_token: this.auth_token,
      mensajes_agente: [],
      mensajes_usuario: [],
      mensajes_supervision: [],
      user_id: this.user_id
    };

    this.chatService.guardarChat(payload).subscribe((response) => {
      const newChat = {
        memory_key: response.memory_key,
        nombre: response.nombre,
        messages: [],
        showOptions: false
      };
      this.chats.unshift(newChat);
      this.activeChatId = newChat.memory_key;
      this.hasBotResponded = false;
    }, (error) => {
      console.error('Error al crear el nuevo chat', error);
    });
  }

  // Cambiar el chat activo
  switchChat(chatId: string) {
    this.activeChatId = chatId;
    this.getMessagesByChatId(chatId);
  }

  // Cargar los mensajes de un chat desde el backend
  loadChatMessages(chatId: string) {
    this.chatService.getChat(this.auth_token, chatId).subscribe((chat) => {
      const selectedChat = this.chats.find((c) => c.memory_key === chatId);
      if (selectedChat) {
        selectedChat.messages = [
          ...chat.mensajes_usuario.map((msg: any) => ({ content: msg, sender: 'user' })),
          ...chat.mensajes_agente.map((msg: any) => ({ content: msg, sender: 'agent' }))
        ];
      }
    }, (error) => {
      console.error('Error al obtener el chat', error);
    });
  }

  // Obtener el nombre del chat activo
  getActiveChatTitle() {
    const activeChat = this.chats.find(chat => chat.memory_key === this.activeChatId);
    return activeChat ? activeChat.nombre : 'Chat sin título';
  }

  // Renombrar un chat
  renameChat(chatId: string) {
    const newTitle = prompt('Ingrese el nuevo nombre del chat:');
    if (newTitle) {
      const chat = this.chats.find(chat => chat.memory_key === chatId);
      if (chat) {
        chat.nombre = newTitle;
        const payload = {
          auth_token: this.auth_token,
          memory_key: chatId,
          nombre: newTitle,
          mensajes_agente: chat.messages.filter((msg: { sender: string; }) => msg.sender === 'agent').map((msg: { content: any; }) => msg.content),
          mensajes_usuario: chat.messages.filter((msg: { sender: string; }) => msg.sender === 'user').map((msg: { content: any; }) => msg.content),
          mensajes_supervision: [],
          user_id: this.user_id
        };

        this.chatService.guardarChat(payload).subscribe(() => {
          console.log('Nombre del chat actualizado');
        }, (error) => {
          console.error('Error al actualizar el nombre del chat', error);
        });
      }
    }
    this.closeAllMenus();
  }

  // Eliminar un chat
  deleteChat(chatId: string) {
    this.chats = this.chats.filter(chat => chat.memory_key !== chatId);
    this.chatService.deleteChat(this.auth_token, chatId).subscribe(() => {
      console.log('Chat eliminado');
    }, (error) => {
      console.error('Error al eliminar el chat', error);
    });
  }

// Enviar un mensaje
sendMessage() {
  if (this.message.trim() !== '') {
    const chat = this.chats.find((c) => c.memory_key === this.activeChatId);
    if (chat) {
  
      const userMessage = { content: this.message, sender: 'user' };
      const formattedUserMessage = JSON.stringify({ texto: this.message });  

      chat.messages.push(userMessage);
      this.messages.push(userMessage);  

      const payload = {
        auth_token: this.auth_token,
        memory_key: this.activeChatId,
        nombre: chat.nombre,
        mensajes_agente: [],
        mensajes_usuario: [formattedUserMessage], 
        mensajes_supervision: [],
        user_id: this.user_id
      };


      this.chatService.guardarChat(payload).subscribe(() => {

        this.message = '';

        this.getAgentResponse(chat);
      }, (error) => {
        console.error('Error al guardar el mensaje del usuario', error);
      });
    }
  }
}




// Obtener la respuesta del agente y guardarla en la base de datos
getAgentResponse(chat: any) {
 
  const agentResponse = 'Gracias por tu mensaje, estamos revisando tu solicitud.';

  const formattedAgentMessage = JSON.stringify({ texto: agentResponse });


  const agentMessage = { content: agentResponse, sender: 'agent' };
  chat.messages.push(agentMessage);
  this.messages.push(agentMessage); 

  const agentPayload = {
    auth_token: this.auth_token,           
    memory_key: this.activeChatId,           
    mensajes_agente: [formattedAgentMessage], 
    mensajes_usuario: [],                    
    mensajes_supervision: [],                
    user_id: this.user_id                     
  };


  this.chatService.guardarChat(agentPayload).subscribe(() => {
    console.log('Respuesta del agente guardada correctamente en la base de datos');
  }, (error) => {
    console.error('Error al guardar la respuesta del agente en la base de datos', error);
  });
}



  handleRetry(message: any) {
    this.getAgentResponse(message);
  }


  handleThumbUp(message: any) {
    console.log('Mensaje marcado como "Me gusta"', message);
  }

 
  handleThumbDown(message: any) {
    this.messageToThumbDown = message;
    this.showConfirmation = true;
  }


  handleYes() {
    this.router.navigate(['/supervision']);  
  }

  
  handleNo() {
    this.showConfirmation = false;
  }

  
  toggleOptions(chatId: string) {
    this.chats = this.chats.map(chat => {
      if (chat.memory_key === chatId) {
        return { ...chat, showOptions: !chat.showOptions };
      }
      return { ...chat, showOptions: false };
    });
  }

  closeAllMenus() {
    this.chats = this.chats.map(chat => ({ ...chat, showOptions: false }));
  }

  archiveChat(chatId: string) {
    const payload = {
      auth_token: this.auth_token,
      memory_key: chatId
    };
  
    this.chatService.archiveChat(payload).subscribe(() => {

      this.chats = this.chats.filter(chat => chat.memory_key !== chatId);
      console.log('Chat archivado');
    }, (error) => {
      console.error('Error al archivar el chat', error);
    });
  }

  messages: { content: string, sender: string }[] = [];  
 // Obtener mensajes del chat por ID
getMessagesByChatId(chatId: string) {
  const auth_token = this.auth_token;

  this.chatService.getChat(chatId, auth_token).subscribe((chat: any) => {

    const userMessages = chat.mensajes_usuario.map((msg: string) => {
      try {
        const parsedMsg = JSON.parse(msg);  
        return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'user' };  
      } catch (error) {
        return { content: msg, sender: 'user' };  
      }
    });

 
    const agentMessages = chat.mensajes_agente.map((msg: string) => {
      try {
        const parsedMsg = JSON.parse(msg);  
        return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'agent' };  
      } catch (error) {
        return { content: msg, sender: 'agent' };  
      }
    });

    this.messages = [...userMessages, ...agentMessages];
  }, (error) => {
    console.error('Error al obtener los mensajes del chat', error);
  });
}

  

  
}
