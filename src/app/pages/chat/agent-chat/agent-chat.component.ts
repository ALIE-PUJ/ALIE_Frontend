import { Component, ElementRef, HostListener, inject, ViewChild, AfterViewChecked  } from '@angular/core';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../services/chat/agent.service';
import { Router } from '@angular/router';
import { TaggingService } from '../../../services/tagging/tagging.service';
import { AlieService } from '../../../services/alie/alie.service';
import { AuthService } from '../../../services/authentication/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './agent-chat.component.html',
  styleUrls: ['./agent-chat.component.scss'],
  
})


export class AgentChatComponent {

  // Inject Services
  private chatService = inject(AgentService);
  private router = inject(Router);
  private taggingService = inject(TaggingService);
  private alieService = inject(AlieService);
  private authService = inject(AuthService); 

  // Loading variables
  isLoading: boolean = false;
  loadingMessage: string = 'ALIE está encontrando la información que necesitas';
  loadingDots: string = ''; // Para almacenar los puntos de carga
  loadingIndex: number = 0; // Para llevar la cuenta de la secuencia

  // Referencia al DIV de mensajes para hacer scroll automatico
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Variables
  activeChatId: string = '';
  chats: any[] = [];
  message: string = '';
  hasBotResponded: boolean = false;
  showConfirmation: boolean = false;
  messageToThumbDown: any;

  auth_token: string | null = null;
  user_id: string | null = null;
  isIntervened: boolean = false;
  isIntervenedFromDB: boolean = false;
  isIntervened_ShowChat: boolean = false;

  constructor() {
    this.initializeAuth();
    this.listChats();
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
      this.router.navigate(['/login']); // Redirect to login if not authenticated
    }
  }

  listChats() {

    // Limpiar los mensajes
    this.activeChatId = '';
    this.messages = [];


    if (this.user_id && this.auth_token) {
      this.chatService.listChatsByUser(this.user_id).subscribe((chats: any[]) => {
        console.log('Chats básicos recibidos:', chats);
  
        if (chats.length === 0) {
          this.chats = [];
          return;
        }
        this.showArchivedChats = false;
        // Obtener los detalles completos de cada chat
        const detailedChatRequests = chats.map(chat => this.chatService.getChat(chat.memory_key));
  
        forkJoin(detailedChatRequests).subscribe((fullChats) => {
          console.log('Detalles completos de los chats:', fullChats);
  
          // Aquí solo necesitamos invertir el orden de los chats
          this.chats = fullChats
            .filter(chat => chat.intervenido === false)  
            .map(chat => ({
              memory_key: chat.memory_key,
              title: chat.nombre || 'Chat sin título',
              messages: [],
              intervenido: chat.intervenido || false,
              showOptions: false
            }))
            .reverse(); // Invertir el orden para mostrar el último chat creado primero
  
          console.log('Chats en orden descendente (más reciente primero):', this.chats);
        }, (error) => {
          console.error('Error al obtener los detalles completos de los chats', error);
        });
      }, (error) => {
        console.error('Error al obtener los chats básicos', error);
      });
    } else {
      console.error('User ID or token is missing');
    }
  }
  
  
  list_Archive_Chats() {

    // Limpiar los mensajes
    this.activeChatId = '';
    this.messages = [];

    if (this.user_id && this.auth_token) {
      this.chatService.listChatsByUser(this.user_id).subscribe((chats: any[]) => {
        console.log('Chats ARCHIVADOS básicos recibidos:', chats);
  
        if (chats.length === 0) {
          this.chats = [];
          return;
        }
        this.showArchivedChats = true;
        // Obtener los detalles completos de cada chat
        const detailedChatRequests = chats.map(chat => this.chatService.getChat(chat.memory_key));
  
        forkJoin(detailedChatRequests).subscribe((fullChats) => {
          console.log('Detalles completos de los chats:', fullChats);
  
          this.chats = fullChats
            .filter(chat => chat.intervenido === true)  
            .map(chat => ({
              memory_key: chat.memory_key,
              title: chat.nombre || 'Chat sin título',
              messages: [],
              intervenido: chat.intervenido || false,
              showOptions: false
            }))
            .reverse(); 

          
  
          console.log('Chats en orden descendente (más reciente primero):', this.chats);
        }, (error) => {
          console.error('Error al obtener los detalles completos de los chats', error);
        });
      }, (error) => {
        console.error('Error al obtener los chats básicos', error);
      });
    } else {
      console.error('User ID or token is missing');
    }
  }

  isChatArchived(memoryKey: string): boolean {
    const chat = this.chats.find(c => c.memory_key === memoryKey);
    return chat ? chat.intervenido : false;
  }
  
  
  

  // Método para agregar un nuevo chat y abrirlo automáticamente
addNewChat() {
  const payload = {
    mensajes_agente: [],
    mensajes_usuario: [],
    mensajes_supervision: [],
    user_id: this.user_id
  };

  console.log("Payload being sent:", payload);

  // Guardar el nuevo chat en el backend
  this.chatService.guardarChat(payload).subscribe((response) => {
    const newChat = {
      memory_key: response.memory_key,
      title: response.nombre || 'Nuevo Chat', 
      messages: [],
      showOptions: false,
      isEditing: false 
    };
    

    this.chats.unshift(newChat);


    this.switchChat(newChat.memory_key);
    this.hasBotResponded = false; 

  }, (error) => {
    console.error('Error al crear el nuevo chat', error);
  });
}


checkInterventionStatus(chatId: string) {
  if (!chatId) {
    return;
  }

  this.chatService.getInterventionStatus(chatId).subscribe((response: any) => {
    if (response.success) {

      console.log("Verificando estado de intervención del chat:", chatId);
      console.log("Estado de intervención recibido del backend:", response.intervenido);
      
      this.isIntervened = response.intervenido;
      this.isIntervened_ShowChat = response.intervenido;
    } else {
      console.log('No se encontró el chat o hubo un error:', response.message);
    }
  }, (error) => {
    console.error('Error al consultar el estado de intervención', error);
  });
}




  // Cambiar el chat activo
  switchChat(chatId: string) {
    this.activeChatId = chatId;
    this.getMessagesByChatId(chatId); 
    this.checkInterventionStatus(chatId);

    console.log("Current selected chat:", this.getActiveChat());
    this.startPollingForMessages(); // Start polling for messages
  }


  loadChatMessages(chatId: string) {
    this.chatService.getChat(chatId).subscribe((chat) => {
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

 
  getActiveChatTitle() {
    const activeChat = this.chats.find(chat => chat.memory_key === this.activeChatId);
    return activeChat ? activeChat.nombre : 'Chat sin título';
  }


enableEditing(chat: any) {
  this.chats = this.chats.map(c => {
    if (c.memory_key === chat.memory_key) {
      return { ...c, isEditing: true };
    }
    return { ...c, isEditing: false }; 
  });
}


saveChatName(chat: any) {
  if (chat.isEditing) {
    chat.isEditing = false;  

    const payload = {
      memory_key: chat.memory_key,
      nombre: chat.title,  
      mensajes_agente: [],  
      mensajes_usuario: [],  
      mensajes_supervision: [],  
      user_id: this.user_id
    };

   
    this.chatService.guardarChat(payload).subscribe(() => {
      console.log('Nombre del chat actualizado correctamente');
    }, (error) => {
      console.error('Error al actualizar el nombre del chat', error);
    });
  }
}




  // Eliminar un chat
  deleteChat(chatId: string) {
    this.chats = this.chats.filter(chat => chat.memory_key !== chatId);
    this.chatService.deleteChat(chatId).subscribe(() => {
      console.log('Chat eliminado');

      // Limpiar los mensajes si el chat eliminado es el chat activo
      if (this.activeChatId === chatId) {
        this.activeChatId = '';
        this.messages = [];
      }

    }, (error) => {
      console.error('Error al eliminar el chat', error);
    });
  }

 
  

 // Obtener el chat activo por su memory_key
getActiveChat() {
  return this.chats.find((chat) => chat.memory_key === this.activeChatId);
}

// Enviar un mensaje al agente
sendMessageToAgent() {
  const chat = this.getActiveChat();
  if (chat && this.message.trim() !== '') {
    const userMessage = { content: this.message, sender: 'user' };
    const formattedUserMessage = JSON.stringify({ texto: this.message });

    chat.messages.push(userMessage);
    this.messages.push(userMessage);

    const payload = {
      memory_key: this.activeChatId,
      nombre: chat.title,
      mensajes_agente: [],
      mensajes_usuario: [formattedUserMessage],
      mensajes_supervision: [],
      user_id: this.user_id
    };

 
    this.chatService.guardarChat(payload).subscribe(
      async () => {
        this.message = ''; 
        await this.getAgentResponse(chat); 
      },
      (error) => {
        console.error('Error al guardar el mensaje del usuario', error);
      }
    );
  }
}

// Enviar un mensaje al supervisor si el chat está intervenido
sendMessageToSupervisor() {
  const chat = this.getActiveChat();
  if (chat && this.message.trim() !== '') {
    const userMessage = { content: this.message, sender: 'user' };
    const formattedUserMessage = JSON.stringify({ texto: this.message });

    chat.messages.push(userMessage);
    this.messages.push(userMessage);

    const payload = {
      memory_key: this.activeChatId,
      nombre: chat.title,
      mensajes_agente: [],
      mensajes_usuario: [formattedUserMessage],
      mensajes_supervision: [],
      user_id: this.user_id,
      intervenido: true 
    };

  
    this.chatService.guardarChat(payload).subscribe(
      () => {
        this.message = ''; // Limpiar el mensaje de entrada
        console.log('Mensaje enviado al supervisor.');
      },
      (error) => {
        console.error('Error al guardar el mensaje con intervención', error);
      }
    );
  }
}




  // Obtener la respuesta del agente y guardarla en la base de datos
  async getAgentResponse(chat: any): Promise <void> {
    try {
      console.log("Current chat: ", chat);
      let userMessage = chat.messages[chat.messages.length - 1].content;
      console.log("User message to send: ", userMessage);

      // Mensaje de carga
      this.isLoading = true;

      // Obtener respuesta del modelo ALIE con prioridad baja "False"
      this.startLoadingAnimation()
      let alie_answer = await this.getALIE_Response(userMessage, "False");
      // let alie_answer = await this.getALIE_Response(userMessage, "True"); // Si se quisiera prioridad alta
      this.stopLoadingAnimation()
      console.log("ALIE ANSWER = ", alie_answer);

      // Desactivar mensaje de carga
      this.isLoading = false;






      // Manejo del chat en la base de datos
      const agentMessage = { content: alie_answer || 'Lo siento, no tengo una respuesta en este momento.', sender: 'agent' };
      chat.messages.push(agentMessage);
      this.messages.push(agentMessage);

      const agentPayload = {
        auth_token: this.auth_token,
        memory_key: this.activeChatId,
        mensajes_agente: [JSON.stringify({ texto: agentMessage.content })],
        mensajes_usuario: [],
        mensajes_supervision: [],
        user_id: this.user_id
      };

      // Guardar la respuesta del agente
      await this.chatService.guardarChat(agentPayload).toPromise();
      console.log('Respuesta del agente guardada correctamente en la base de datos');
    } catch (error) {
      console.error('Error en getAgentResponse:', error);
    }
  }



  handleRetry() {
    const chat = this.chats.find((c) => c.memory_key === this.activeChatId);
  
    if (!chat) {
      console.error('Chat no encontrado');
      return;
    }
  
    // Obtener el chat desde la base de datos para asegurar que obtenemos el último mensaje del usuario
    this.chatService.getChat(this.activeChatId).subscribe(
      (chatData: any) => {
        const userMessages = chatData.mensajes_usuario;
  
        if (!userMessages || userMessages.length === 0) {
          console.error('No se encontraron mensajes del usuario en la base de datos para reenviar.');
          return;
        }
  
        // Obtener el último mensaje enviado por el usuario desde la base de datos
        const lastUserMessage = userMessages[userMessages.length - 1];
  
        // Asegurarse de que el último mensaje es un JSON válido
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(lastUserMessage);
        } catch (e) {
          parsedMessage = { texto: lastUserMessage };
        }
  
        // Volver a enviar el último mensaje del usuario al agente
        this.getAgentResponseRetry(parsedMessage.texto, chat);
      },
      (error) => {
        console.error('Error al obtener el chat desde la base de datos:', error);
      }
    );
  }
  

  async getAgentResponseRetry(userMessage: string, chat: any) {
    try {
      if (!userMessage) {
        throw new Error('El mensaje del usuario no contiene contenido válido.');
      }
  
      // Mostrar mensaje de carga mientras se obtiene la respuesta del agente
      this.isLoading = true;
      this.startLoadingAnimation();
  
      // Obtener la nueva respuesta del agente con el último mensaje del usuario
      let alie_answer = await this.getALIE_Response(userMessage, "True");
      this.stopLoadingAnimation();
  
      // Desactivar el mensaje de carga
      this.isLoading = false;
  
      // Añadir la nueva respuesta del agente a los mensajes del chat
      const agentMessage = { content: alie_answer || 'Lo siento, no tengo una respuesta en este momento.', sender: 'agent' };
      chat.messages.push(agentMessage); // Añadimos el nuevo mensaje del agente a los mensajes locales
      this.messages.push(agentMessage); // Actualizamos los mensajes en la interfaz
  
      // Guardar la respuesta del agente en la base de datos
      const agentPayload = {
        auth_token: this.auth_token,
        memory_key: this.activeChatId,
        mensajes_agente: [JSON.stringify({ texto: agentMessage.content })],
        mensajes_usuario: [],  // No guardamos mensajes de usuario en este payload
        mensajes_supervision: [],  // No guardamos mensajes de supervisión en este payload
        user_id: this.user_id
      };
  
      // Guardar la respuesta del agente en la base de datos
      await this.chatService.guardarChat(agentPayload).toPromise();
      console.log('Respuesta del agente guardada correctamente en la base de datos');
  
    } catch (error) {
      console.error('Error en getAgentResponseRetry:', error);
    }
  }
  
  
  
  


  handleThumbUp(message: any) {
    console.log('Mensaje marcado como "Me gusta"', message);
  

    console.log("Mensajes del chat: ", this.messages)
    let agentMessage = this.messages[this.messages.length - 1].content;
    let userMessage = this.messages[this.messages.length - 2].content;

    // Mensaje seleccionado, del agente
    console.log("Agent Message content: ", agentMessage)

    // Mensaje seleccionado, del usuario
    console.log("User Message content: ", userMessage)

    // Tagging positivo
    this.taggingService.tagMessage(userMessage, agentMessage, 'pos')
      .subscribe(
        (response) => {
          // Handle successful response
          if (response.success) {
            console.log('Success:', response.message);
            console.log('Tag Document:', response.tag_document);
          } else {
            // Handle case where the response is not successful but no error is thrown
            console.error('Error:', response.message);
          }
        },
        (error) => {
          // Handle any errors from the HTTP call
          console.error('HTTP Error:', error);
        }
      );

  }


  handleThumbDown(message: any) {
    this.messageToThumbDown = message;
    this.showConfirmation = true;

    console.log("Mensajes del chat: ", this.messages)
    let agentMessage = this.messages[this.messages.length - 1].content;
    let userMessage = this.messages[this.messages.length - 2].content;

    // Mensaje seleccionado, del agente
    console.log("Agent Message content: ", agentMessage)

    // Mensaje seleccionado, del usuario
    console.log("User Message content: ", userMessage)

    // Tagging negativo
    this.taggingService.tagMessage(userMessage, agentMessage, 'neg')
      .subscribe(
        (response) => {
          // Handle successful response
          if (response.success) {
            console.log('Success:', response.message);
            console.log('Tag Document:', response.tag_document);
          } else {
            // Handle case where the response is not successful but no error is thrown
            console.error('Error:', response.message);
          }
        },
        (error) => {
          // Handle any errors from the HTTP call
          console.error('HTTP Error:', error);
        }
      );

  }

  isChatIntervened(chatId: string): boolean {
    const chat = this.chats.find((c) => c.memory_key === chatId);
    return chat ? chat.intervenido : false;
  }
  


  handleYes() {
    const chat = this.chats.find((c) => c.memory_key === this.activeChatId);
    if (!chat) {
      console.error('Chat no encontrado');
      return;
    }
  
    // Crear el payload para cambiar solo el estado de intervenido, sin modificar los mensajes
    const payload = {
      memory_key: chat.memory_key,
      intervenido: true  
    };
  
    // Llamar al servicio para actualizar solo el estado de intervención del chat
    this.chatService.actualizarEstadoIntervenido(payload).subscribe(() => {

      chat.intervenido = true;

      this.isIntervened = true;
      // Añadir el mensaje de espera al array de mensajes del usuario
      this.messages.push({
        content: 'Un humano está en camino para ayudarte...',
        sender: 'system'
      });

      // Sleep to show the message
      this.sleep(5000).then(() => {
        console.log('Slept for 5 seconds, now executing further code...');
        // You can call other functions or execute code here after the sleep
      });  
  
      // Desactivar la caja de confirmación y cualquier respuesta del bot
      this.hasBotResponded = false;
      this.showConfirmation = false;

      // Marcar el chat como intervenido para la caja de chat
      this.isIntervened_ShowChat = true;

    }, (error) => {
      console.error('Error al marcar el chat como intervenido', error);
    });
  }
  
  
  // Sleep function that returns a Promise
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleNo() {
    this.isIntervened = false;
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
      memory_key: chatId
    };

    this.chatService.archiveChat(payload).subscribe(() => {

      this.chats = this.chats.filter(chat => chat.memory_key !== chatId);
      console.log('Chat archivado');
      // Limpiar los mensajes
      this.activeChatId = '';
      this.messages = [];

    }, (error) => {
      console.error('Error al archivar el chat', error);
    });
  }

 // Mensajes
messages: { content: string, sender: string }[] = [];
lastAgentMessageIndex: number | null = null;

ngOnInit() {
  this.startPollingForMessages();
}

ngOnDestroy() {
  console.log('AgentChatComponent destroyed. Clearing polling interval...');
  this.clearPollingInterval();
}

private clearPollingInterval() {
  if (this.pollingInterval) {
    clearInterval(this.pollingInterval);
    this.pollingInterval = null;
  }
}

ngAfterViewChecked() {
  this.scrollToBottom();
  const lastAgentIndex = this.messages.map(m => m.sender).lastIndexOf('agent');
  this.lastAgentMessageIndex = lastAgentIndex !== -1 ? lastAgentIndex : null;
}

pollingInterval: any;

startPollingForMessages() {
  if (this.activeChatId && this.auth_token) {
    this.pollingInterval = setInterval(() => {
      this.pollingFunction_Chat(this.activeChatId);
    }, 10000);
  } else {
    console.warn('No se pudo iniciar el polling porque faltan chatId o auth_token');
  }
}

pollingFunction_Chat(chatId: string){
  if (this.router.url !== '/chat') { // Verifica si no estás en la ruta /chat
    console.warn('No estás en la ruta /chat, deteniendo el polling de chats...');
    return; // Si no estás en /chat, retorna y no inicia el polling
  }

  else {
    console.log('Polling for messages for chat:', this.activeChatId);
    this.getMessagesByChatId(this.activeChatId);
  }
}

getMessagesByChatId(chatId: string) {
  const auth_token = this.auth_token;  

  if (this.auth_token === null) {
    console.error('Error: auth_token no encontrado.');
    return;
  }
  
  if (!chatId || !auth_token) {
    console.error('Error: Falta el chatId o auth_token');
    return;
  }

  this.chatService.getChat(chatId).subscribe((chat: any) => {
    this.messages = [];
    this.lastAgentMessageIndex = null;


    this.isIntervened = chat.intervenido;

   
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


    const supervisorMessages = chat.mensajes_supervision.map((msg: string) => {
      try {
        const parsedMsg = JSON.parse(msg);
        return { content: parsedMsg.texto || parsedMsg.content || msg, sender: 'supervisor' };
      } catch (error) {
        return { content: msg, sender: 'supervisor' };
      }
    });

   
    this.messages = this.alternateMessages(userMessages, agentMessages, supervisorMessages);


    const lastAgentIndex = this.messages.map(m => m.sender).lastIndexOf('agent');
    this.lastAgentMessageIndex = lastAgentIndex !== -1 ? lastAgentIndex : null;

  
    const chatToUpdate = this.chats.find(c => c.memory_key === chatId);
    if (chatToUpdate) {
      chatToUpdate.intervenido = this.isIntervened;  
    }

    this.messages = this.alternateMessages(userMessages, agentMessages, supervisorMessages);

// Recalcular el índice del último mensaje del agente
const lastAgentIndex1 = this.messages.map(m => m.sender).lastIndexOf('agent');
this.lastAgentMessageIndex = lastAgentIndex1 !== -1 ? lastAgentIndex1 : null;

  }, (error) => {
    // Manejo del error
    if (error.status === 404) {
      console.error('Error: Chat no encontrado', error);
      this.showUserMessage('Chat no encontrado.');
    } else {
      console.error('Error al obtener los mensajes del chat', error);
      // this.showUserMessage('Hubo un error al obtener los mensajes del chat.');
    }
  });
}

showUserMessage(message: string) {
  alert(message);  
}

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

public showArchivedChats: boolean = false;


toggleChatsView() {
  if (this.showArchivedChats) {
    // Mostrar chats activos
    this.showArchivedChats = false;
    this.listChats();  // Aquí debes tener el método que lista los chats activos
  } else {
    // Mostrar chats archivados
    this.showArchivedChats = true;
    this.list_Archive_Chats();  // Aquí debe estar el método que lista los chats archivados
  }
}




  // Mensaje de espera / carga

  startLoadingAnimation() {
    this.loadingDots = ''; // Resetea los puntos de carga
    this.loadingIndex = 0; // Resetea el índice
    
    // Inicia el intervalo para actualizar los puntos
    const interval = setInterval(() => {
      this.updateLoadingDots();
      
      // Para detener la animación cuando ya no se está cargando
      if (!this.isLoading) {
        clearInterval(interval);
        this.loadingDots = ''; // Limpia los puntos cuando termina
      }
    }, 500); // Cambia la velocidad aquí si es necesario
  }
  
  updateLoadingDots() {
    const sequences = ['', '.', '..', '...', '..', '.', '']; // La secuencia que deseas
    this.loadingDots = sequences[this.loadingIndex];
    this.loadingIndex = (this.loadingIndex + 1) % sequences.length; // Ciclo a través de las secuencias
  }
  
  stopLoadingAnimation() {
    this.isLoading = false;
    this.loadingDots = ''; // Limpia los puntos cuando se detiene la carga
  }

  

  scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }
  



  // Manejo ALIE (No tocar pls)

  // Debe ser una solicitud asincrona
  getALIE_Response(input: string, priority: string): Promise<string> {

    let user_data = "[USER ID = " + this.user_id + "]"; // Datos del usuario para el modelo
    input = user_data + "\n" + input; // Agregar los datos del usuario al mensaje de entrada

    console.log('getALIE_Response Input [Postprocess]:', input);

    return new Promise((resolve, reject) => {
      this.alieService.get_response_from_model(input, priority)
        .subscribe(
          (response) => {
            if (response.answer) {
              console.log('Success:', response.answer);
              resolve(response.answer); // Resuelve la promesa con el mensaje
            } else {
              console.error('Error:', response);
              resolve("Estamos teniendo problemas, intenta en unos momentos"); // Resuelve con un mensaje por defecto si no se responde la solicitud
            }
          },
          (error) => {
            console.error('HTTP Error:', error);
            resolve("Estamos teniendo problemas, intenta en unos momentos"); // Resuelve con un mensaje por defecto
          }
        );
    });
  }

  convertUrlsToLinks(text: string): string {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,\.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, '<span style="color: white; font-weight: bold;"><a href="$1" target="_blank" rel="noopener noreferrer">$1</a></span>');
  }

}
