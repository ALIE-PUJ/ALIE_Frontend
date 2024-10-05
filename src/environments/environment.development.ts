export const environment = {
  services: {
    alie: {
      apiUrl: 'http://localhost:3000/api/ia',
    },
    chat: {
      apiUrl: 'http://localhost:5000/api/front/chat',
    },
    tagging: {
      apiUrl: 'http://localhost:5000/api/front/tag'
    },
    auth: {
      apiUrl: 'http://localhost:2001/api/auth',
    },
    files: {
      apiUrl: 'http://localhost:5000/api/front/files',
    }
  },
  ui: {
    enableNoLoginAccess: true,
  }
};
