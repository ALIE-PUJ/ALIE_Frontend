import { Component, HostListener, inject } from '@angular/core';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../services/chat/agent.service';
import { Router } from '@angular/router';
import { TaggingService } from '../../../services/tagging/tagging.service';
import { AlieService } from '../../../services/alie/alie.service';

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
  private alieService = inject(AlieService)

  // Loading variables
  isLoading: boolean = false;
  loadingMessage: string = 'ALIE está encontrando la información que necesitas';
  loadingDots: string = ''; // Para almacenar los puntos de carga
  loadingIndex: number = 0; // Para llevar la cuenta de la secuencia
  

  // Variables
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


        // Guardar el mensaje del usuario
        this.chatService.guardarChat(payload).subscribe(
          async () => {
            this.message = ''; // Limpiar el mensaje de entrada
            await this.getAgentResponse(chat); // Esperar la respuesta del agente
          },
          (error) => {
            console.error('Error al guardar el mensaje del usuario', error);
          }
        );

        /*
        this.chatService.guardarChat(payload).subscribe(() => {

          this.message = '';

          // Esperar la respuesta
          this.getAgentResponse(chat);
        }, (error) => {
          console.error('Error al guardar el mensaje del usuario', error);
        });
        */
      }
    }
  }




  // Obtener la respuesta del agente y guardarla en la base de datos
  async getAgentResponse(chat: any) {
    try {
      console.log("Current chat: ", chat);
      let userMessage = chat.messages[chat.messages.length - 1].content;
      console.log("User message to send: ", userMessage);

      // Mensaje de carga
      this.isLoading = true;

      // Obtener respuesta del modelo ALIE con prioridad baja "False"
      this.startLoadingAnimation()
      let alie_answer = await this.getALIE_Response(userMessage, "True");
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



  handleRetry(message: any) {
    this.getAgentResponse(message);
  }


  handleThumbUp(message: any) {
    console.log('Mensaje marcado como "Me gusta"', message);

    // Tagging positivo
    this.taggingService.tagMessage("authToken", "Mensaje de prueba de usuario", 'Mensaje de prueba de agente', 'pos')
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

    // Tagging negativo
    this.taggingService.tagMessage("authToken", "Mensaje de prueba de usuario", 'Mensaje de prueba de agente', 'neg')
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



  // Manejo ALIE (No tocar pls)

  // Debe ser una solicitud asincrona
  getALIE_Response(input: string, priority: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.alieService.get_response_from_model("authToken", input, priority)
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


}
