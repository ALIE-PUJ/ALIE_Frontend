export const environment = {
  services: {
    alie: {
      apiUrl: 'http://localhost:3000/alie',
    },
    chat: {
      apiUrl: 'http://localhost:5000'
    },
    tagging: {
      apiUrl: 'http://localhost:5000/tag',
    },
    auth: {
      apiUrl: 'http://localhost:2001',
    },
    files: {
      submitUrl: 'http://localhost:5000/files/submit',
      listUrl: 'http://localhost:5000/files/list',
      deleteUrl: 'http://localhost:5000/files/delete',
      viewUrl: 'http://localhost:5000/files/view'
    }
  }
};
