import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { AgentService } from '../../../services/chat/agent.service';

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './supervision.component.html',
  styleUrls: ['./supervision.component.scss']
})
export class SupervisionComponent {

  interventionChats: any[] = [];
  activeChats: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  messages: { content: string, sender: string, timestamp: number }[] = [];  

  private chatService = inject(AgentService);
  auth_token: string = 'your_auth_token_here';  
  user_id: string = '1';  
console: any;

  constructor() {
    this.loadInterventionChats();
    this.loadActiveChats();
  }
  chats: any[] = [];
  toggleOptions(chatId: string) {
    this.chats = this.chats.map(chat => {
      if (chat.memory_key === chatId) {
        return { ...chat, showOptions: !chat.showOptions };
      }
      return { ...chat, showOptions: false };
    });
  }

    // Eliminar un chat
    deleteChat(chatId: string) {
      this.chats = this.chats.filter(chat => chat.memory_key !== chatId);
      this.chatService.deleteChat(chatId).subscribe(() => {
        console.log('Chat eliminado');
      }, (error) => {
        console.error('Error al eliminar el chat', error);
      });
    }

  // Cargar chats que requieren intervención
  loadInterventionChats() {
    this.chatService.getInterventionChats().subscribe((chats: any[]) => {
      this.interventionChats = chats;
    }, (error) => {
      console.error('Error al cargar los chats de intervención', error);
    });
  }

  // Cargar chats activos (no intervenidos)
  loadActiveChats() {
    this.chatService.listAllChats().subscribe((chats: any[]) => {
      this.activeChats = chats.filter(chat => chat.intervenido !== true).map(chat => ({
        memory_key: chat.memory_key,
        nombre: chat.nombre || 'Chat sin título',
        messages: [],
        showOptions: false
      }));
    }, (error) => {
      console.error('Error al obtener los chats activos', error);
    });
  }

  // Seleccionar un chat de intervención
selectInterventionChat(chat: any) {
  this.chatService.getChat(chat.memory_key).subscribe((selectedChat) => {
    this.selectedChat = {
      ...selectedChat,
      mensajes_usuario: this.formatMessages(selectedChat.mensajes_usuario,'user'),
      mensajes_agente: this.formatMessages(selectedChat.mensajes_agente,'agent'),
      mensajes_supervision: this.formatMessages(selectedChat.mensajes_supervision,'supervisor'),
      canInteract: true  
    };
    this.messages = this.alternateMessages(
      this.selectedChat.mensajes_usuario,
      this.selectedChat.mensajes_agente,
      this.selectedChat.mensajes_supervision
    );  // Intercalar mensajes
  }, (error) => {
    console.error('Error al obtener los mensajes del chat', error);
  });
}

// Seleccionar un chat activo
selectActiveChat(chat: any) {
  this.chatService.getChat(chat.memory_key).subscribe((selectedChat) => {
    this.selectedChat = {
      ...selectedChat,
      mensajes_usuario: this.formatMessages(selectedChat.mensajes_usuario,'user'),
      mensajes_agente: this.formatMessages(selectedChat.mensajes_agente,'agent'),
      mensajes_supervision: this.formatMessages(selectedChat.mensajes_supervision,'supervisor'),
      canInteract: false  
    };
    this.messages = this.alternateMessages(
      this.selectedChat.mensajes_usuario,
      this.selectedChat.mensajes_agente,
      this.selectedChat.mensajes_supervision
    );  // Intercalar mensajes
  }, (error) => {
    console.error('Error al obtener los mensajes del chat', error);
  });
}



formatMessages(messages: string[], senderType: string) {
  return messages
    ? messages.map((msg: string) => {
        try {
          const parsedMsg = JSON.parse(msg);
          return { 
            content: parsedMsg.texto || parsedMsg.content || msg, 
            sender: senderType,  
            timestamp: parsedMsg.timestamp || Date.now() 
          };
        } catch (e) {
          return { content: msg, sender: senderType, timestamp: Date.now() };  
        }
      })
    : [];
}


  // Enviar mensaje como supervisor
  sendMessage() {
    if (this.selectedChat && this.newMessage.trim()) {
      const formattedSupervisorMessage = JSON.stringify({ texto: this.newMessage, timestamp: Date.now() });

      const payload = {
        memory_key: this.selectedChat.memory_key,
        nombre: this.selectedChat.nombre || 'Chat sin título', 
        mensajes_agente: [],  
        mensajes_usuario: [],  
        mensajes_supervision: [formattedSupervisorMessage],  
        user_id: this.user_id,  
        intervenido: true  
      };

      this.chatService.guardarChat(payload).subscribe(
        () => {
          console.log('Mensaje de intervención guardado correctamente.');
          this.newMessage = '';  
          this.getMessagesByChatId(this.selectedChat.memory_key);  
        },
        (error) => {
          console.error('Error al guardar el mensaje de intervención', error);
        }
      );
    }
  }

  getMessagesByChatId(chatId: string) {
    this.chatService.getChat(chatId).subscribe((chat: any) => {
      const userMessages = chat.mensajes_usuario.map((msg: string) => {
        try {
          const parsedMsg = JSON.parse(msg);
          return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'user', timestamp: parsedMsg.timestamp || Date.now() };
        } catch (error) {
          return { content: msg, sender: 'user', timestamp: Date.now() };
        }
      });
  
      const agentMessages = chat.mensajes_agente.map((msg: string) => {
        try {
          const parsedMsg = JSON.parse(msg);
          return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'agent', timestamp: parsedMsg.timestamp || Date.now() };
        } catch (error) {
          return { content: msg, sender: 'agent', timestamp: Date.now() };
        }
      });
  
      const supervisorMessages = chat.mensajes_supervision.map((msg: string) => {
        try {
          const parsedMsg = JSON.parse(msg);
          return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'supervisor', timestamp: parsedMsg.timestamp || Date.now() };
        } catch (error) {
          return { content: msg, sender: 'supervisor', timestamp: Date.now() };
        }
      });
  
      // Intercalar y ordenar los mensajes
      this.messages = this.alternateMessages(userMessages, agentMessages, supervisorMessages);
    }, (error) => {
      console.error('Error al obtener los mensajes del chat', error);
    });
  }
  


 // Función de intercalación de mensajes
alternateMessages(userMessages: any[], agentMessages: any[], supervisorMessages: any[]): any[] {
  const alternatedMessages = [];
  const maxLength = Math.max(userMessages.length, agentMessages.length, supervisorMessages.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < userMessages.length) {
      alternatedMessages.push(userMessages[i]);
    }
    if (i < agentMessages.length) {
      alternatedMessages.push(agentMessages[i]);
    }
    if (i < supervisorMessages.length) {
      alternatedMessages.push(supervisorMessages[i]);
    }
  }

  return alternatedMessages;
}



}
