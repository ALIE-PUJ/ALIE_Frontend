import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './agent-chat.component.html',
  styleUrls: ['./agent-chat.component.scss'],
})
export class AgentChatComponent {
  activeChatId: string = '1';  
  chats: any[] = [
    {
      id: '1',
      title: 'ALIE',
      messages: [],
      showOptions: false,
    },
    {
      id: '2',
      title: 'Uso intranet',
      messages: [{ content: '¿Cómo puedo usar la intranet?', sender: 'user' }],
      showOptions: false,
    },
    {
      id: '3',
      title: 'Horarios inscripciones',
      messages: [{ content: '¿Cuándo empiezan las inscripciones?', sender: 'user' }],
      showOptions: false,
    },
  ];
  message: string = '';  
  hasBotResponded: boolean = false;  
  showOptionsModal: boolean = false; 
  nextChatId: number = 4; 

  constructor() {
    this.chats.reverse();  
  }

  // Obtener los mensajes por ID de chat
  getMessagesByChatId(chatId: string) {
    return this.chats.find((chat) => chat.id === chatId)?.messages || [];
  }

  // Obtener el título del chat activo (en el panel izquierdo)
  getActiveChatTitle(): string {
    return 'ALIE';  
  }

  // Obtener el título del chat en el panel izquierdo
  getLeftChatTitle(chatId: string): string {
    const chat = this.chats.find((chat) => chat.id === chatId);
    return chat ? chat.title : 'Chat';
  }

  // Cambiar el chat activo
  switchChat(chatId: string) {
    this.activeChatId = chatId;  // Cambiar el ID del chat activo
  }

  // Enviar un mensaje en el chat activo
  sendMessage() {
    if (this.message.trim() !== '') {
      const chat = this.chats.find((chat) => chat.id === this.activeChatId);
      if (chat) {
        chat.messages.push({ content: this.message, sender: 'user' });
        this.message = '';  // Limpiar el campo de entrada

        // Respuesta automática del bot si no ha respondido antes
        if (!this.hasBotResponded) {
          this.hasBotResponded = true;
          setTimeout(() => {
            chat.messages.push({ content: 'Hola, ¿en qué puedo ayudarte?', sender: 'agent' });
          }, 1000);
        }
      }
    }
  }

  // Añadir un nuevo chat al panel izquierdo
  addNewChat() {
    const newChatId = this.nextChatId.toString();  // Asignar el próximo ID disponible
    this.chats.unshift({
      id: newChatId,
      title: `Nuevo Chat ${newChatId}`,  
      messages: [],
      showOptions: false,
    });
    this.activeChatId = newChatId; 
    this.hasBotResponded = false;  
    this.nextChatId++;  
  }

  // Mostrar/ocultar las opciones de un chat
  toggleOptions(chatId: string) {
    this.chats = this.chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, showOptions: !chat.showOptions };
      }
      return { ...chat, showOptions: false };
    });
  }

  // Renombrar un chat
  renameChat(chatId: string) {
    const newTitle = prompt('Ingrese el nuevo nombre del chat:');
    if (newTitle) {
      this.chats = this.chats.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      this.closeAllMenus();
    }
  }

  // Eliminar un chat
  deleteChat(chatId: string) {
    this.chats = this.chats.filter((chat) => chat.id !== chatId);
    this.closeAllMenus();
  }

  // Escuchar clics fuera de los menús de opciones
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const menuElements = document.querySelectorAll('.menu, .menu-options');
    let isClickInside = false;

    menuElements.forEach(menu => {
      if (menu.contains(target)) {
        isClickInside = true;
      }
    });

    if (!isClickInside) {
      this.closeAllMenus();
    }
  }

  // Cerrar todos los menús de opciones
  closeAllMenus() {
    this.chats = this.chats.map(chat => ({ ...chat, showOptions: false }));
  }

  // Funciones de manejo de los botones de feedback
  handleThumbUp(message: any) {
    alert('¡Gracias por tu feedback positivo!');
  }

  handleThumbDown(message: any) {
    this.showOptionsModal = true;
  }

  handleRetry(message: any) {
    alert('Reintentando la acción...');
  }

  // Cierra la ventana emergente de opciones
  closeOptionsModal() {
    this.showOptionsModal = false;
  }

  // Acción para cuando se selecciona una opción en la ventana emergente
  selectOption(option: string) {
    alert(`Opción seleccionada: ${option}`);
    this.closeOptionsModal();
  }
}
