export const environment = {
  services: {
    alie: {
      apiUrl: 'http://alie.javeriana.edu.co/api/ia',
    },
    chat: {
      apiUrl: 'http://alie.javeriana.edu.co/api/front',
    },
    tagging: {
      apiUrl: 'http://alie.javeriana.edu.co/api/front/tag'
    },
    auth: {
      apiUrl: 'http://alie.javeriana.edu.co/api/auth',
    },
    files: {
      submitUrl: 'http://alie.javeriana.edu.co/api/front/submit',
      listUrl: 'http://alie.javeriana.edu.co/api/front/list',
      deleteUrl: 'http://alie.javeriana.edu.co/api/front/delete',
    }
  },
  ui: {
    enableNoLoginAccess: false,
  }
};
