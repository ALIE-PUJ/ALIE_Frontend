import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentChatComponent } from './agent-chat.component';
import { AgentService } from '../../../services/chat/agent.service';
import { TaggingService } from '../../../services/tagging/tagging.service';
import { AlieService } from '../../../services/alie/alie.service';
import { AuthService } from '../../../services/authentication/auth.service';
import { RouterTestingModule } from '@angular/router/testing'; // Para ActivatedRoute
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Para HttpClient
import { of } from 'rxjs';

describe('AgentChatComponent', () => {
  let component: AgentChatComponent;
  let fixture: ComponentFixture<AgentChatComponent>;
  let agentServiceMock: any;
  let taggingServiceMock: any;
  let alieServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    // Mock para localStorage (Simular valores de user_id y token)
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'ActiveUserId') {
        return 'mockedUserId';
      } else if (key === 'token') {
        return 'mockedAuthToken';
      }
      return null;
    });

    // Crear mocks de los servicios
    agentServiceMock = jasmine.createSpyObj('AgentService', [
      'guardarChat', 'listChatsByUser', 'archiveChat', 'deleteChat', 'getChat', 'getInterventionStatus'
    ]);
    taggingServiceMock = jasmine.createSpyObj('TaggingService', ['tagMessage']);
    alieServiceMock = jasmine.createSpyObj('AlieService', ['get_response_from_model']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['initializeAuth']);

    // Simular las respuestas de los métodos de AgentService
    agentServiceMock.listChatsByUser.and.returnValue(of([])); // Retorna un array vacío de chats
    agentServiceMock.guardarChat.and.returnValue(of({ memory_key: '12345', nombre: 'Nuevo Chat' }));
    agentServiceMock.getChat.and.returnValue(of({ mensajes_usuario: [], mensajes_agente: [] }));

    // Configuración del módulo de pruebas
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, // Simular ActivatedRoute
        HttpClientTestingModule // Simular HttpClient
      ],
      declarations: [AgentChatComponent],
      providers: [
        { provide: AgentService, useValue: agentServiceMock },
        { provide: TaggingService, useValue: taggingServiceMock },
        { provide: AlieService, useValue: alieServiceMock },
        { provide: AuthService, useValue: authServiceMock } // Simula AuthService
      ]
    }).compileComponents();

    // Crear el fixture y la instancia del componente
    fixture = TestBed.createComponent(AgentChatComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // Ejecutar ngOnInit
  });

  // Pruebas

  it('should create a new chat', () => {
    component.addNewChat();
    expect(agentServiceMock.guardarChat).toHaveBeenCalled();
    expect(component.chats.length).toBe(1);
    expect(component.chats[0].memory_key).toBe('12345');
    expect(component.chats[0].title).toBe('Nuevo Chat');
  });

  it('should list chats', () => {
    component.listChats();
    expect(agentServiceMock.listChatsByUser).toHaveBeenCalled();
    expect(component.chats.length).toBe(0); // Porque listChatsByUser retorna un array vacío
  });
  // Prueba: Renombrar un chat
  it('should rename a chat', () => {
    const chat = { memory_key: '12345', title: 'Chat Viejo', isEditing: true } as any;
    component.chats = [chat];

    component.enableEditing(chat);
    expect(chat.isEditing).toBe(true);

    chat.title = 'Chat Renombrado';
    agentServiceMock.guardarChat.and.returnValue(of(null));

    component.saveChatName(chat);

    expect(chat.isEditing).toBe(false);
    expect(agentServiceMock.guardarChat).toHaveBeenCalledWith({
      memory_key: '12345',
      nombre: 'Chat Renombrado',
      mensajes_agente: [],
      mensajes_usuario: [],
      mensajes_supervision: [],
      user_id: component.user_id
    });
  });

  // Prueba: Archivar un chat
  it('should archive a chat', () => {
    const chat = { memory_key: '12345', title: 'Chat 1', intervenido: false } as any;
    component.chats = [chat];

    agentServiceMock.archiveChat.and.returnValue(of(null));
    component.archiveChat('12345');

    expect(agentServiceMock.archiveChat).toHaveBeenCalledWith({ memory_key: '12345' });
    expect(component.chats.length).toBe(0); // El chat debe ser eliminado de la lista
  });

  // Prueba: Eliminar un chat
  it('should delete a chat', () => {
    const chat = { memory_key: '12345', title: 'Chat a Eliminar' } as any;
    component.chats = [chat];

    agentServiceMock.deleteChat.and.returnValue(of(null));
    component.deleteChat('12345');

    expect(agentServiceMock.deleteChat).toHaveBeenCalledWith('12345');
    expect(component.chats.length).toBe(0);
  });

  // Prueba: Enviar un mensaje al agente
  it('should send a message to the agent', async () => {
    const chat = { memory_key: '12345', title: 'Chat 1', messages: [] } as any;
    component.chats = [chat];
    component.activeChatId = '12345';
    component.message = 'Hola Agente';

    const agentResponse = 'Respuesta del Agente';
    alieServiceMock.get_response_from_model.and.returnValue(of({ answer: agentResponse }));

    await component.sendMessageToAgent();

    expect(chat.messages.length).toBe(1);
    expect(chat.messages[0].content).toBe('Hola Agente');
    expect(chat.messages[0].sender).toBe('user');
  });

  // Prueba: Feedback positivo (Thumb Up)
  it('should handle thumb up feedback', () => {
    const message = { content: 'Mensaje del Agente', sender: 'agent' } as any;
    component.messages = [{ content: 'Hola', sender: 'user' } as any, message];

    taggingServiceMock.tagMessage.and.returnValue(of({ success: true }));
    component.handleThumbUp(message);

    expect(taggingServiceMock.tagMessage).toHaveBeenCalledWith('Hola', 'Mensaje del Agente', 'pos');
  });

  // Prueba: Feedback negativo (Thumb Down)
  it('should handle thumb down feedback', () => {
    const message = { content: 'Mensaje del Agente', sender: 'agent' } as any;
    component.messages = [{ content: 'Hola', sender: 'user' } as any, message];

    taggingServiceMock.tagMessage.and.returnValue(of({ success: true }));
    component.handleThumbDown(message);

    expect(component.showConfirmation).toBe(true);
    expect(taggingServiceMock.tagMessage).toHaveBeenCalledWith('Hola', 'Mensaje del Agente', 'neg');
  });

  // Prueba: Retry para reenviar el mensaje al agente
  it('should retry sending the last user message', async () => {
    const chat = { memory_key: '12345', messages: [{ content: 'Hola', sender: 'user' }] } as any;
    component.chats = [chat];
    component.activeChatId = '12345';

    spyOn(component, 'getAgentResponseRetry').and.callThrough();
    agentServiceMock.getChat.and.returnValue(of({ mensajes_usuario: ['{"texto": "Hola"}'] }));

    await component.handleRetry();

    expect(agentServiceMock.getChat).toHaveBeenCalledWith('12345');
    expect(component.getAgentResponseRetry).toHaveBeenCalledWith('Hola', chat);
  });

  // Prueba: Interactuar con handleYes para intervención y enviar mensaje al supervisor
  it('should handle intervention and send a message to the supervisor', () => {
    const chat = { memory_key: '12345', title: 'Chat 1', intervenido: false } as any;
    component.chats = [chat];
    component.activeChatId = '12345';

    agentServiceMock.actualizarEstadoIntervenido.and.returnValue(of(null));
    component.handleYes();

    expect(chat.intervenido).toBe(true);
    expect(agentServiceMock.actualizarEstadoIntervenido).toHaveBeenCalledWith({
      memory_key: '12345',
      intervenido: true
    });
  });
});
