import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { AgentService } from '../../../services/chat/agent.service';
import { AuthService } from '../../../services/authentication/auth.service';
import { Router } from '@angular/router';


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
  private authService = inject(AuthService); 
  private router = inject(Router);

  auth_token: string | null = null;
  user_id: string | null = null;
  console: any;

  constructor() {
    this.initializeAuth();
    this.loadInterventionChats();
    this.loadActiveChats();
  }

  ngOnInit() {
    this.startPollingForMessages();
  }
  
  ngOnDestroy() {
    console.log('SupervisionComponent destroyed. Clearing polling interval...');
    this.clearPollingInterval();
  }
  
  private clearPollingInterval() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
    
  pollingInterval: any;
  
  startPollingForMessages() {
    if (this.selectedChat && this.auth_token) {
      this.pollingInterval = setInterval(() => {
        this.pollingFunction_Supervision(this.selectedChat.memory_key);
      }, 1000);
    } else {
      console.warn('No se pudo iniciar el polling porque faltan selectedChat.memory_key o auth_token');
    }
  }

  pollingFunction_Supervision(chatId: string){
    if (this.router.url !== '/supervision') { // Verifica si no estás en la ruta /chat
      console.warn('No estás en la ruta /supervision, deteniendo el polling de chats...');
      return; // Si no estás en /chat, retorna y no inicia el polling
    }

    else {
      console.log('Polling for messages for chat:', this.selectedChat.memory_key);
      this.getMessagesByChatId(this.selectedChat.memory_key);
    }
  }

  initializeAuth() {
    const userId = localStorage.getItem('ActiveUserId');
    const token = localStorage.getItem('token');

    if (userId && token) {
      this.user_id = userId;
      this.auth_token = token;
      console.log('User authenticated with ID:', this.user_id);
    } else {
      console.error('User is not authenticated, redirecting to login...');
      this.router.navigate(['/login']); 
    }
  }

  chats: any[] = [];
  toggleOptions(chatId: string) {
    this.interventionChats = this.interventionChats.map(chat => {
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


loadInterventionChats() {
  this.chatService.getInterventionChats().subscribe((chats: any[]) => {
    console.log('Chats de intervención recibidos:', chats);
    this.interventionChats = chats
      .filter(chat => chat.archivado === false)  
      .map(chat => ({
        memory_key: chat.memory_key,
        nombre: chat.nombre || 'Chat sin título',
        messages: [],
        showOptions: false
      }));
  }, (error) => {
    console.error('Error al cargar los chats de intervención', error);
  });
}

archiveChat(chatId: string) {
  const payload = {
    memory_key: chatId
  };

  this.chatService.archiveChat(payload).subscribe(() => {

    this.interventionChats = this.interventionChats.filter(chat => chat.memory_key !== chatId);
    console.log('Chat archivado');
  }, (error) => {
    console.error('Error al archivar el chat', error);
  });
}

loadActiveChats() {
  this.chatService.listAllChats().subscribe((chats: any[]) => {
    console.log('Chats activos recibidos:', chats);
 
    this.activeChats = chats
      .filter(chat => chat.intervenido !== true && chat.archivado === false) 
      .map(chat => ({
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

    this.startPollingForMessages(); // Iniciar polling para mensajes

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

    if (this.auth_token === null) {
      console.error('Error: auth_token no encontrado.');
      return;
    }

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

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  ngAfterViewChecked() {
    // this.scrollToBottom();
  }
  
  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {
      console.error('Error scrolling to bottom', err);
    }
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

convertUrlsToLinks(text: string): string {
  // Patrón para detectar URLs
  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,\.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

  // Reemplaza los enlaces en texto con un formato HTML
  const replacedText = text.replace(urlPattern, '<span style="color: white; font-weight: bold;"><a href="$1" target="_blank" rel="noopener noreferrer">$1</a></span>');

  // Expresiones regulares para formatos de Markdown
  const boldPattern = /(\*\*|__)(.*?)\1/g; // **texto** o __texto__
  const italicPattern = /(\*|_)(.*?)\1/g; // *texto* o _texto_
  const headerPattern = /(^|\n)(#{1,6})\s*(.*?)(\n|$)/g; // # Título, ## Subtítulo, etc.

  // Reemplazar negritas
  const formattedBoldText = replacedText.replace(boldPattern, '<strong>$2</strong>');
  // Reemplazar cursivas
  const formattedItalicText = formattedBoldText.replace(italicPattern, '<em>$2</em>');
  // Reemplazar encabezados (hasta 6 niveles)
  const formattedHeaders = formattedItalicText.replace(headerPattern, (_, lineBreak, hashes, title) => {
      const level = hashes.length;
      return `${lineBreak}<h${level}>${title}</h${level}>`;
  });

  return formattedHeaders;
}


// Determinar el turno actual
determineTurn() {

  console.log("determineTurn... Current messages:", this.messages);

  // Verificar que haya mensajes
  if (!this.messages || this.messages.length === 0) {
    console.log("No hay mensajes, retornando 'user'");
    return "user"; // Retornar 'user' si no hay mensajes
  }

  // Obtener el último mensaje
  const lastMessage = this.messages[this.messages.length - 1];

  // Revisar si existen mensajes del supervisor en la conversación
  const hasSupervisorMessage = this.messages.some((message) => message.sender === 'supervisor');

  // Determinar el turno según las condiciones
  if (lastMessage.sender === 'user' && hasSupervisorMessage) { // SI el último mensaje es del usuario y hay mensajes del supervisor
    console.log("determineTurn: lastMessage.sender === 'user' && hasSupervisorMessage. return supervisor");
    return "supervisor";
  } else if (lastMessage.sender === 'user' && !hasSupervisorMessage) { // SI el último mensaje es del usuario y NO hay mensajes del supervisor
    console.log("determineTurn: lastMessage.sender === 'user' && !hasSupervisorMessage. return user");
    return "user";
  } else if (lastMessage.sender === 'agent') { // SI el último mensaje es del agente y el chat está intervenido, quiere decir que se acaba de pedir ayuda. Esperar
    console.log("determineTurn: lastMessage.sender === 'agent' && this.isIntervened_ShowChat. return supervisor");
    return "supervisor";
  } else { // En cualquier otro caso
    return "user"; // Default
  }
}


}
