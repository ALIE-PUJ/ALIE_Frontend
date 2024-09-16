import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

// Interfaz para los mensajes
interface Message {
  text: string;
}

// Interfaz para el chat
interface Chat {
  id: number;
  name: string;
  agentMessages: Message[]; // Mensajes del agente
  userMessages: Message[];  // Mensajes del usuario
  interventionMessages: Message[];  // Mensajes de intervención
  canInteract: boolean;  // Controla si el agente puede intervenir
  showOptions?: boolean; // Para el menú de opciones
}

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './supervision.component.html',
  styleUrls: ['./supervision.component.scss']
})
export class SupervisionComponent {

  // Chats de intervención
  interventionChats: Chat[] = [
    {
      id: 1,
      name: 'Chat 1',
      agentMessages: [{ text: '¡Hola! ¿En qué puedo ayudarte hoy?' }],
      userMessages: [{ text: 'Hola' }],
      interventionMessages: [],  // Inicialmente vacío
      canInteract: true
    },
    {
      id: 2,
      name: 'Chat 2',
      agentMessages: [],
      userMessages: [{ text: '¿Qué opciones tengo para pagar?' }],
      interventionMessages: [],  // Inicialmente vacío
      canInteract: true
    },
    {
      id: 3,
      name: 'Chat 3',
      agentMessages: [],
      userMessages: [{ text: 'Tengo problemas para acceder a mi cuenta.' }],
      interventionMessages: [],  // Inicialmente vacío
      canInteract: true
    }
  ];

  // Chats activos (no se puede intervenir)
  activeChats: Chat[] = [
    {
      id: 4,
      name: 'Chat 4',
      agentMessages: [{ text: 'Claro, ¿en qué puedo ayudarte?' }],
      userMessages: [{ text: 'Hola, tengo una pregunta sobre mi cuenta' }],
      interventionMessages: [],  // Inicialmente vacío
      canInteract: false // No se puede intervenir
    },
    {
      id: 5,
      name: 'Chat 5',
      agentMessages: [],
      userMessages: [{ text: '¿Cómo puedo cambiar mi contraseña?' }],
      interventionMessages: [],  // Inicialmente vacío
      canInteract: false // No se puede intervenir
    }
  ];

  selectedChat: Chat | null = null;  // Chat seleccionado
  newMessage: string = '';  // Nuevo mensaje

  toggleOptions(chat: any): void {
    chat.showOptions = !chat.showOptions;
  }
  
  // Función para editar el nombre del chat
  editChat(chat: Chat) {
    const newName = prompt('Editar nombre del chat:', chat.name);
    if (newName) {
      chat.name = newName;
    }
    chat.showOptions = false;  // Ocultar el menú después de editar
  }

  // Función para eliminar el chat
  deleteChat(chat: Chat) {
    const confirmDelete = confirm(`¿Seguro que deseas eliminar el chat "${chat.name}"?`);
    if (confirmDelete) {
      this.interventionChats = this.interventionChats.filter(c => c.id !== chat.id);
    }
  }

  // Seleccionar un chat de intervención
  selectInterventionChat(chat: Chat) {
    this.selectedChat = chat;
  }

  // Enviar un mensaje de intervención
  sendMessage() {
    if (this.selectedChat && this.selectedChat.canInteract && this.newMessage.trim()) {
      this.selectedChat.interventionMessages.push({ text: this.newMessage });  // Guardar en la lista de intervención
      this.newMessage = '';  // Limpiar el campo de entrada
    }
  }
}
